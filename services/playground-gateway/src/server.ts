import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Duplex } from 'node:stream';
import { URL } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { parseJsonBody, ProtocolError, requireInteger, requireString, validateClientMessage } from '../../../packages/playground-protocol/dist/index.js';
import { LocalSessionManager, type LocalSession, type SupervisorConfig } from '../../playground-supervisor/dist/index.js';

export type GatewayConfig = SupervisorConfig & {
  host?: string;
  port?: number;
  allowedOrigin?: string;
  gatewayToken?: string;
};

const HOP_BY_HOP = new Set(['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'set-cookie']);

async function body(request: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of request) { const bytes = Buffer.from(chunk); size += bytes.length; if (size > 64 * 1024) throw new ProtocolError(413, 'request body is too large'); chunks.push(bytes); }
  return Buffer.concat(chunks);
}

function json(response: ServerResponse, status: number, value: unknown): void {
  const payload = JSON.stringify(value); response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(payload), 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' }); response.end(payload);
}

function constantEqual(actual: string | undefined, expected: string): boolean {
  if (!actual) return false; const left = Buffer.from(actual), right = Buffer.from(expected); return left.length === right.length && timingSafeEqual(left, right);
}

function routeParts(pathname: string): string[] { return pathname.split('/').filter(Boolean).map((part) => decodeURIComponent(part)); }

export class PlaygroundGateway {
  readonly sessions: LocalSessionManager;
  readonly server: http.Server;
  private readonly idempotency = new Map<string, string>();
  readonly config: Required<Pick<GatewayConfig, 'host' | 'port' | 'allowedOrigin' | 'gatewayToken' | 'maxSessions'>>;
  private readonly allowedOrigins: Set<string>;
  private closing = false;

  constructor(config: GatewayConfig = {}) {
    this.config = { host: config.host ?? '127.0.0.1', port: config.port ?? 8787, allowedOrigin: config.allowedOrigin ?? 'http://localhost:3000,http://127.0.0.1:3000', gatewayToken: config.gatewayToken ?? '', maxSessions: config.maxSessions ?? 25 };
    this.allowedOrigins = new Set(this.config.allowedOrigin.split(',').map(origin => origin.trim()).filter(Boolean));
    this.sessions = new LocalSessionManager(config); this.server = http.createServer((request, response) => void this.handle(request, response));
    this.server.on('upgrade', (request, socket, head) => void this.upgrade(request, socket, head));
    this.server.headersTimeout = 10_000;
    this.server.requestTimeout = 15_000;
    this.server.keepAliveTimeout = 5_000;
    this.server.maxHeadersCount = 100;
    this.server.maxRequestsPerSocket = 1_000;
    this.server.on('clientError', (_error, socket) => {
      if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    });
  }
  async listen(): Promise<{ host: string; port: number }> {
    await new Promise<void>((resolvePromise, reject) => { this.server.once('error', reject); this.server.listen(this.config.port, this.config.host, resolvePromise); });
    const address = this.server.address(); return { host: this.config.host, port: typeof address === 'object' && address ? address.port : this.config.port };
  }
  async warmup(): Promise<void> { await this.sessions.warmup(); }
  async close(): Promise<void> {
    this.closing = true;
    this.server.closeIdleConnections();
    await this.sessions.close(); this.server.closeAllConnections();
    if (!this.server.listening) return;
    await new Promise<void>((resolvePromise, reject) => this.server.close((error) => error ? reject(error) : resolvePromise()));
  }

  private cors(request: IncomingMessage, response: ServerResponse): void {
    const origin = request.headers.origin;
    if (origin && this.allowedOrigins.has(origin)) {
      response.setHeader('access-control-allow-origin', origin); response.setHeader('vary', 'Origin'); response.setHeader('access-control-allow-credentials', 'true');
      response.setHeader('access-control-allow-headers', 'content-type, authorization, x-playground-session-token, x-playground-gateway-token, idempotency-key');
      response.setHeader('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
  }
  private assertOrigin(request: IncomingMessage): void {
    if (request.method === 'GET' || request.method === 'HEAD') return;
    const origin = request.headers.origin; if (origin && !this.allowedOrigins.has(origin)) throw new ProtocolError(403, 'origin is not allowed');
  }
  private createAuthorized(request: IncomingMessage): boolean { return !this.config.gatewayToken || constantEqual(request.headers['x-playground-gateway-token'] as string | undefined, this.config.gatewayToken); }
  private sessionToken(request: IncomingMessage, url: URL): string | undefined {
    const header = request.headers['x-playground-session-token']; if (typeof header === 'string') return header;
    const bearer = /^Bearer (.+)$/.exec(request.headers.authorization ?? ''); if (bearer) return bearer[1];
    const cookies = Object.fromEntries((request.headers.cookie ?? '').split(';').map((item) => item.trim().split(/=(.*)/s, 2)).filter(([key]) => key));
    const cookie = cookies.playground_session; if (cookie) { const separator = cookie.indexOf('.'); if (separator > 0 && cookie.slice(0, separator) === routeParts(url.pathname)[1]) return cookie.slice(separator + 1); }
    // Query credentials are intentionally local-development-only for direct preview URLs.
    return url.searchParams.get('sessionToken') ?? undefined;
  }
  private authorizedSession(id: string, request: IncomingMessage, url: URL): LocalSession { return this.sessions.authorize(id, this.sessionToken(request, url)); }

  private async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    this.cors(request, response);
    if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }
    try {
      this.assertOrigin(request);
      const forwardedProto = (request.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
      const forwardedHost = (request.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim();
      const effectiveProto = forwardedProto || 'http';
      const effectiveHost = forwardedHost || request.headers.host || 'localhost';
      const url = new URL(request.url ?? '/', `${effectiveProto}://${effectiveHost}`); const parts = routeParts(url.pathname);
      if (request.method === 'GET' && url.pathname === '/healthz') { json(response, 200, { ok: true, adapter: 'local-development', hardened: false }); return; }
      if (request.method === 'GET' && url.pathname === '/readyz') {
        json(response, this.closing ? 503 : 200, { ready: !this.closing, sessions: this.sessions.activeCount, capacity: this.config.maxSessions }); return;
      }
      if (this.closing) throw new ProtocolError(503, 'gateway is shutting down');
      if (request.method === 'POST' && url.pathname === '/sessions') {
        if (!this.createAuthorized(request)) throw new ProtocolError(401, 'invalid gateway token');
        const input = parseJsonBody(await body(request)); const fixtureId = requireString(input.fixtureId ?? 'contract-drift', 'fixtureId', 128); requireString(input.fixtureVersion ?? 'development', 'fixtureVersion', 128);
        const keyHeader = request.headers['idempotency-key'];
        const key = typeof keyHeader === 'string' ? requireString(keyHeader, 'idempotency-key', 128) : undefined;
        if (typeof key === 'string' && this.idempotency.has(key)) {
          try {
            const existing = this.sessions.get(this.idempotency.get(key)!);
            json(response, 200, { ...existing.view(), sessionToken: existing.token });
            return;
          } catch {
            this.idempotency.delete(key);
          }
        }
        const session = await this.sessions.create(fixtureId); if (typeof key === 'string') this.idempotency.set(key, session.sessionId);
        response.setHeader('set-cookie', `playground_session=${session.sessionId}.${session.token}; HttpOnly; SameSite=Strict; Path=/`);
        json(response, 201, { ...session.view(), sessionToken: session.token }); return;
      }
      if (parts[0] !== 'sessions' || !parts[1]) throw new ProtocolError(404, 'route not found');
      const sessionId = parts[1]; const session = this.authorizedSession(sessionId, request, url);
      if (parts.length === 2 && request.method === 'GET') { json(response, 200, session.view()); return; }
      if (parts.length === 2 && request.method === 'DELETE') {
        await this.sessions.delete(sessionId);
        for (const [key, value] of this.idempotency) if (value === sessionId) this.idempotency.delete(key);
        response.writeHead(204); response.end(); return;
      }
      if (parts[2] === 'reset' && request.method === 'POST') { const input = parseJsonBody(await body(request)); const generation = requireInteger(input.expectedGeneration, 'expectedGeneration', 1, Number.MAX_SAFE_INTEGER); const preset = typeof input.preset === 'string' ? requireString(input.preset, 'preset', 128) : 'contract-drift'; json(response, 200, (await this.sessions.reset(sessionId, generation, preset)).view()); return; }
      if (parts[2] === 'files' && parts.length === 3 && request.method === 'GET') {
        const [tree, git] = await Promise.all([session.files(), session.gitStatus()]); const statuses = new Map<string, string>();
        for (const path of git.untracked) statuses.set(path, 'U'); for (const path of git.unstaged) statuses.set(path, 'M'); for (const path of git.staged) statuses.set(path, statuses.has(path) ? 'M' : 'A');
        json(response, 200, { files: tree.filter((entry) => entry.kind === 'file').map((entry) => ({ ...entry, status: statuses.get(entry.path) ?? null, staged: git.staged.includes(entry.path) })), tree, git, revision: session.workspaceRevision }); return;
      }
      if (parts[2] === 'file' && request.method === 'GET') { json(response, 200, await session.readFile(url.searchParams.get('path'))); return; }
      if (parts[2] === 'file' && request.method === 'PUT') { const input = parseJsonBody(await body(request)); json(response, 200, await session.writeFile(input.path, input.content, input.expectedRevision)); return; }
      if (parts[2] === 'files' && parts.length === 3 && request.method === 'POST') { await session.mutateFile(parseJsonBody(await body(request))); response.writeHead(204); response.end(); return; }
      if (parts[2] === 'git' && parts[3] === 'status' && request.method === 'GET') { json(response, 200, await session.gitStatus()); return; }
      if (parts[2] === 'commands' && parts.length === 3 && request.method === 'POST') { const input = parseJsonBody(await body(request)); json(response, 201, session.start(requireString(input.command, 'command', 8192))); return; }
      if (parts[2] === 'terminals' && parts.length === 3 && request.method === 'POST') { json(response, 201, session.createTerminal()); return; }
      if (parts[2] === 'commands' && parts[3] && parts[4] === 'input' && request.method === 'POST') { const input = parseJsonBody(await body(request)); session.input(parts[3], requireString(input.data, 'data', 64 * 1024)); response.writeHead(204); response.end(); return; }
      if (parts[2] === 'commands' && parts[3] && parts.length === 4 && request.method === 'DELETE') { session.stop(parts[3]); response.writeHead(204); response.end(); return; }
      if (parts[2] === 'commands' && parts[3] && parts[4] === 'preview' && request.method === 'POST') {
        const input = parseJsonBody(await body(request)); const port = requireInteger(input.port, 'port', 1024, 65535); const mode = requireString(input.mode, 'mode', 16);
        if (!['snapshot', 'watch', 'demo'].includes(mode)) throw new ProtocolError(400, 'invalid preview mode');
        json(response, 201, await session.registerDashboard(parts[3], port, mode as 'snapshot' | 'watch' | 'demo', input.autoOpen === true)); return;
      }
      if (parts[2] === 'events' && request.method === 'GET') { this.events(request, response, session, Number(url.searchParams.get('after') ?? 0)); return; }
      if (parts[2] === 'preview-ticket' && request.method === 'POST') {
        const input = parseJsonBody(await body(request)); const dashboardId = requireString(input.dashboardId, 'dashboardId', 128);
        if (!session.dashboards.has(dashboardId)) throw new ProtocolError(404, 'dashboard is not available');
        json(response, 200, { url: `${url.origin}/sessions/${encodeURIComponent(sessionId)}/previews/${encodeURIComponent(dashboardId)}/?sessionToken=${encodeURIComponent(session.token)}` }); return;
      }
      if (parts[2] === 'mcp-test' && request.method === 'POST') {
        const input = parseJsonBody(await body(request));
        const tool = requireString(input.tool ?? 'analyze_changes', 'tool', 128);
        const args = typeof input.arguments === 'object' && input.arguments !== null ? (input.arguments as Record<string, unknown>) : undefined;
        json(response, 200, await this.runMcpTest(session, tool, args));
        return;
      }
      if (parts[2] === 'previews' && parts[3] && request.method === 'GET') { await this.proxyPreview(request, response, session, parts[3], parts.slice(4), url); return; }
      throw new ProtocolError(404, 'route not found');
    } catch (error) {
      if (response.headersSent) { response.destroy(error as Error); return; }
      const status = error instanceof ProtocolError ? error.status : 500;
      if (status === 500) console.error('Playground gateway request failed:', error);
      json(response, status, { error: status === 500 ? 'internal gateway error' : (error as Error).message });
    }
  }

  private async runMcpTest(session: LocalSession, tool: string, customArgs?: Record<string, unknown>): Promise<unknown> {
    const allowed = new Set(['analyze_changes', 'evaluate_preflight', 'compute_blast_radius', 'explain_file_impact', 'get_behavior_graph', 'audit_agent_intent']);
    if (!allowed.has(tool)) throw new ProtocolError(400, 'unsupported MCP tool');
    const cliEntry = session.cliEntry;
    const transport = new StdioClientTransport({ command: process.execPath, args: [cliEntry, 'mcp'], cwd: session.workspace, stderr: 'pipe', env: { PATH: process.env.PATH ?? '/usr/bin:/bin', HOME: session.workspace, NO_COLOR: '1' } });
    const client = new Client({ name: 'change-firewall-playground', version: '0.1.0' }, { capabilities: {} });
    try {
      await client.connect(transport); const tools = await client.listTools();
      const selected = tools.tools.find((item) => item.name === tool); if (!selected) throw new ProtocolError(404, 'MCP tool is not exposed by this CLI');
      const defaultArgs = tool === 'compute_blast_radius' || tool === 'explain_file_impact' || tool === 'get_behavior_graph'
        ? { file: 'src/middleware/auth.ts' }
        : tool === 'audit_agent_intent'
        ? { intent: 'Refactor user authentication and role verification' }
        : {};
      const args = customArgs && Object.keys(customArgs).length > 0 ? customArgs : defaultArgs;
      const result = await client.callTool({ name: tool, arguments: args });
      return { server: client.getServerVersion(), tools: tools.tools.map((item) => item.name), request: { name: tool, arguments: args }, result };
    } finally { await client.close().catch(() => undefined); }
  }

  private async upgrade(request: IncomingMessage, socket: Duplex, head: Buffer): Promise<void> {
    try {
      if (this.closing) throw new ProtocolError(503, 'gateway is shutting down');
      const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`); const parts = routeParts(url.pathname);
      if (parts[0] !== 'sessions' || !parts[1] || parts[2] !== 'stream' || parts.length !== 3) throw new ProtocolError(404, 'stream not found');
      const origin = request.headers.origin; if (origin && !this.allowedOrigins.has(origin)) throw new ProtocolError(403, 'origin is not allowed');
      const session = this.authorizedSession(parts[1], request, url); const key = request.headers['sec-websocket-key'];
      if (typeof key !== 'string' || request.headers.upgrade?.toLowerCase() !== 'websocket') throw new ProtocolError(400, 'invalid WebSocket upgrade');
      const accept = createHash('sha1').update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
      socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
      const send = (value: unknown) => socket.write(encodeWebSocketText(JSON.stringify(value)));
      for (const event of session.eventsAfter(Number(url.searchParams.get('after') ?? 0))) send(event);
      const listener = (event: unknown) => send(event); session.on('event', listener);
      let buffer = head;
      const consume = () => {
        while (buffer.length > 0) {
          const frame = decodeWebSocketFrame(buffer); if (!frame) return; buffer = buffer.subarray(frame.bytes);
          if (frame.opcode === 8) { socket.end(encodeWebSocketClose()); return; }
          if (frame.opcode === 9) { socket.write(encodeWebSocketFrame(10, frame.payload)); continue; }
          if (frame.opcode !== 1) throw new ProtocolError(400, 'only text WebSocket messages are supported');
          const raw = JSON.parse(frame.payload.toString('utf8')) as Record<string, unknown>;
          if (raw.sessionId !== session.sessionId || raw.generation !== session.generation) throw new ProtocolError(409, 'stale stream message');
          if (raw.type === 'command.start') { session.start(requireString(raw.command, 'command', 8192), requireString(raw.terminalId, 'terminalId', 128)); continue; }
          const message = validateClientMessage(raw);
          if (message.type === 'terminal.input') session.input(message.terminalId, message.data);
          else if (message.type === 'terminal.resize') session.resize(message.terminalId, message.cols, message.rows);
          else if (message.type === 'command.cancel') session.stop(message.processId);
          // Acknowledgements are accepted for forward-compatible replay accounting.
        }
      };
      socket.on('data', (chunk) => { try { buffer = Buffer.concat([buffer, chunk]); if (buffer.length > 64 * 1024) throw new ProtocolError(413, 'WebSocket buffer is too large'); consume(); } catch { socket.end(encodeWebSocketClose(1008)); } });
      socket.on('close', () => session.off('event', listener)); socket.on('error', () => session.off('event', listener));
      consume();
    } catch (error) { const status = error instanceof ProtocolError ? error.status : 500; socket.end(`HTTP/1.1 ${status} Error\r\nConnection: close\r\n\r\n`); }
  }

  private events(request: IncomingMessage, response: ServerResponse, session: LocalSession, after: number): void {
    if (!request.headers.accept?.includes('text/event-stream')) { json(response, 200, { events: session.eventsAfter(after) }); return; }
    response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive', 'x-accel-buffering': 'no' });
    const send = (event: unknown) => response.write(`data: ${JSON.stringify(event)}\n\n`); for (const event of session.eventsAfter(after)) send(event);
    const listener = (event: unknown) => send(event); session.on('event', listener); const heartbeat = setInterval(() => response.write(': heartbeat\n\n'), 15_000); heartbeat.unref();
    request.on('close', () => { clearInterval(heartbeat); session.off('event', listener); });
  }

  private async proxyPreview(request: IncomingMessage, response: ServerResponse, session: LocalSession, dashboardId: string, rest: string[], url: URL): Promise<void> {
    const dashboard = session.dashboards.get(dashboardId); if (!dashboard || !session.processes.has(dashboard.processId)) throw new ProtocolError(404, 'dashboard is not available');
    const upstreamPath = `/${rest.map(encodeURIComponent).join('/')}${url.searchParams.size ? `?${[...url.searchParams].filter(([key]) => key !== 'sessionToken').map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')}` : ''}`;
    await new Promise<void>((resolvePromise, reject) => {
      const upstream = http.request({ host: '127.0.0.1', port: dashboard.port, method: 'GET', path: upstreamPath, headers: { accept: request.headers.accept ?? '*/*', 'user-agent': 'change-firewall-playground-proxy' } }, (upstreamResponse) => {
        if ((upstreamResponse.statusCode ?? 500) >= 300 && (upstreamResponse.statusCode ?? 500) < 400) { upstreamResponse.resume(); reject(new ProtocolError(502, 'preview redirects are not forwarded')); return; }
        for (const [name, value] of Object.entries(upstreamResponse.headers)) if (!HOP_BY_HOP.has(name) && value !== undefined) response.setHeader(name, value);
        response.statusCode = upstreamResponse.statusCode ?? 502; response.setHeader('content-security-policy', `default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; script-src 'self' 'unsafe-inline'; connect-src 'self'`); upstreamResponse.pipe(response); upstreamResponse.on('end', resolvePromise);
      });
      upstream.setTimeout(15_000, () => upstream.destroy(new ProtocolError(504, 'preview upstream timed out')));
      upstream.on('error', reject); request.on('close', () => upstream.destroy()); upstream.end();
    });
  }
}

function encodeWebSocketFrame(opcode: number, payload: Buffer): Buffer {
  if (payload.length < 126) return Buffer.concat([Buffer.from([0x80 | opcode, payload.length]), payload]);
  if (payload.length <= 0xffff) { const header = Buffer.alloc(4); header[0] = 0x80 | opcode; header[1] = 126; header.writeUInt16BE(payload.length, 2); return Buffer.concat([header, payload]); }
  const header = Buffer.alloc(10); header[0] = 0x80 | opcode; header[1] = 127; header.writeBigUInt64BE(BigInt(payload.length), 2); return Buffer.concat([header, payload]);
}
function encodeWebSocketText(value: string): Buffer { return encodeWebSocketFrame(1, Buffer.from(value)); }
function encodeWebSocketClose(code = 1000): Buffer { const payload = Buffer.alloc(2); payload.writeUInt16BE(code); return encodeWebSocketFrame(8, payload); }
function decodeWebSocketFrame(buffer: Buffer): { opcode: number; payload: Buffer; bytes: number } | undefined {
  if (buffer.length < 2) return undefined; const opcode = buffer[0]! & 0x0f; const masked = (buffer[1]! & 0x80) !== 0; let length = buffer[1]! & 0x7f; let offset = 2;
  if (length === 126) { if (buffer.length < 4) return undefined; length = buffer.readUInt16BE(2); offset = 4; }
  else if (length === 127) { if (buffer.length < 10) return undefined; const long = buffer.readBigUInt64BE(2); if (long > 64n * 1024n) throw new ProtocolError(413, 'WebSocket frame is too large'); length = Number(long); offset = 10; }
  if (!masked) throw new ProtocolError(400, 'client WebSocket frames must be masked'); if (buffer.length < offset + 4 + length) return undefined;
  const mask = buffer.subarray(offset, offset + 4); offset += 4; const payload = Buffer.from(buffer.subarray(offset, offset + length)); for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4]!;
  return { opcode, payload, bytes: offset + length };
}
