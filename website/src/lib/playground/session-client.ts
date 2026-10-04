import { GitStatus, PlaygroundFile, PlaygroundSession } from './types';

const configuredUrl =
  process.env.NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL?.trim() ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8787'
    : '');

export class PlaygroundApiError extends Error {
  constructor(message: string, public status?: number, public body?: unknown) { super(message); this.name = 'PlaygroundApiError'; }
}

type FileEntry = { path: string; kind: 'file' | 'directory'; size?: number; revision?: string; gitStatus?: string };

export class PlaygroundSessionClient {
  readonly baseUrl = configuredUrl?.replace(/\/$/, '') || '';
  private token = '';
  private events?: EventSource;
  private controls?: WebSocket;

  get configured() { return Boolean(this.baseUrl); }
  setSession(session: PlaygroundSession) { if (session.sessionToken) this.token = session.sessionToken; }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.baseUrl) throw new PlaygroundApiError('Live runtime unavailable: NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL is not configured.');
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, credentials: 'include', headers: { 'content-type': 'application/json', ...(this.token ? { 'x-playground-session-token': this.token } : {}), ...init?.headers } });
    const body = response.status === 204 ? undefined : await response.json().catch(() => undefined);
    if (!response.ok) throw new PlaygroundApiError((body as { error?: string; message?: string })?.error || (body as { message?: string })?.message || `Gateway request failed (${response.status})`, response.status, body);
    return body as T;
  }

  async createSession(idempotencyKey: string): Promise<PlaygroundSession> {
    const session = await this.request<PlaygroundSession>('/sessions', { method: 'POST', headers: { 'idempotency-key': idempotencyKey }, body: JSON.stringify({ fixtureId: 'contract-drift', fixtureVersion: 'development' }) });
    this.setSession(session); return session;
  }
  getSession(id: string): Promise<PlaygroundSession> { return this.request(`/sessions/${encodeURIComponent(id)}`); }
  destroySession(id: string): Promise<void> { return this.request(`/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
  resetSession(id: string, generation: number, _preset: string) { return this.request<PlaygroundSession>(`/sessions/${encodeURIComponent(id)}/reset`, { method: 'POST', body: JSON.stringify({ expectedGeneration: generation }) }); }
  async listFiles(id: string): Promise<{ files: PlaygroundFile[] }> {
    const body = await this.request<{ files: FileEntry[] }>(`/sessions/${encodeURIComponent(id)}/files`);
    return { files: body.files.filter(entry => entry.kind === 'file').map(entry => ({ path: entry.path, revision: entry.revision || '', status: normalizeStatus(entry.gitStatus) })) };
  }
  async getGitStatus(id: string): Promise<GitStatus & { revision: number }> {
    try {
      return await this.request<GitStatus & { revision: number }>(`/sessions/${encodeURIComponent(id)}/git/status`);
    } catch {
      return { head: null, staged: [], unstaged: [], untracked: [], revision: 0, hasPreviousCommit: false };
    }
  }
  getFile(id: string, path: string) { return this.request<{ content: string; revision: string }>(`/sessions/${encodeURIComponent(id)}/file?path=${encodeURIComponent(path)}`); }
  putFile(id: string, path: string, content: string, expectedRevision?: string | null) {
    const payload: { path: string; content: string; expectedRevision?: string } = { path, content };
    if (expectedRevision) payload.expectedRevision = expectedRevision;
    return this.request<{ revision: string }>(`/sessions/${encodeURIComponent(id)}/file`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  fileOperation(id: string, operation: Record<string, unknown>) { return this.request<void>(`/sessions/${encodeURIComponent(id)}/files`, { method: 'POST', body: JSON.stringify(operation) }); }
  startCommand(id: string, command: string) { return this.request<{ processId: string; runId: string; terminalId: string; command: string }>(`/sessions/${encodeURIComponent(id)}/commands`, { method: 'POST', body: JSON.stringify({ command }) }); }
  commandInput(id: string, processId: string, data: string) { return this.request<void>(`/sessions/${encodeURIComponent(id)}/commands/${encodeURIComponent(processId)}/input`, { method: 'POST', body: JSON.stringify({ data }) }); }
  stopCommand(id: string, processId: string) { return this.request<void>(`/sessions/${encodeURIComponent(id)}/commands/${encodeURIComponent(processId)}`, { method: 'DELETE' }); }
  mcpTest(id: string, tool = 'analyze_changes', args?: Record<string, unknown>) {
    return this.request<unknown>(`/sessions/${encodeURIComponent(id)}/mcp-test`, {
      method: 'POST',
      body: JSON.stringify({ tool, ...(args ? { arguments: args } : {}) }),
    });
  }
  previewUrl(id: string, dashboardId: string): string {
    const tokenQuery = this.token ? `?sessionToken=${encodeURIComponent(this.token)}` : '';
    return `${this.baseUrl}/sessions/${encodeURIComponent(id)}/previews/${encodeURIComponent(dashboardId)}/${tokenQuery}`;
  }
  async previewTicket(id: string, dashboardId: string) {
    const body = await this.request<{ url: string }>(`/sessions/${encodeURIComponent(id)}/preview-ticket`, { method: 'POST', body: JSON.stringify({ dashboardId }) });
    const url = new URL(body.url, this.baseUrl);
    const gateway = new URL(this.baseUrl);
    const expectedPath = `/sessions/${encodeURIComponent(id)}/previews/${encodeURIComponent(dashboardId)}/`;
    if (url.origin !== gateway.origin || !url.pathname.startsWith(expectedPath) || !['http:', 'https:'].includes(url.protocol)) {
      throw new PlaygroundApiError('Gateway returned an invalid preview ticket URL.');
    }
    return url.toString();
  }
  resizeTerminal(session: PlaygroundSession, terminalId: string, cols: number, rows: number) {
    if (this.controls?.readyState !== WebSocket.OPEN) return false;
    this.controls.send(JSON.stringify({ type: 'terminal.resize', sessionId: session.sessionId, generation: session.generation, terminalId, cols, rows }));
    return true;
  }
  connect(session: PlaygroundSession, onEvent: (event: unknown) => void, onState: (state: 'open' | 'closed' | 'reconnecting') => void) {
    this.close();
    const query = new URLSearchParams({ after: '0', ...(this.token ? { sessionToken: this.token } : {}) });
    const source = new EventSource(`${this.baseUrl}/sessions/${encodeURIComponent(session.sessionId)}/events?${query}`, { withCredentials: true });
    this.events = source;
    source.onopen = () => onState('open');
    source.onerror = () => onState(source.readyState === EventSource.CLOSED ? 'closed' : 'reconnecting');
    source.onmessage = message => { try { onEvent(JSON.parse(message.data)); } catch { /* Invalid control messages are ignored. */ } };
    const socketUrl = new URL(`${this.baseUrl}/sessions/${encodeURIComponent(session.sessionId)}/stream`);
    socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    query.forEach((value, key) => socketUrl.searchParams.set(key, value));
    const controls = new WebSocket(socketUrl);
    this.controls = controls;
    controls.onmessage = message => { try { onEvent(JSON.parse(String(message.data))); } catch { /* Invalid control messages are ignored. */ } };
    return () => source.close();
  }
  close() { this.events?.close(); this.events = undefined; this.controls?.close(); this.controls = undefined; }
}

function normalizeStatus(status?: string): PlaygroundFile['status'] {
  const value = status?.trim().charAt(0).toUpperCase();
  return value === 'M' || value === 'A' || value === 'D' || value === 'R' || value === 'U' ? value : null;
}

export function unwrapEvent(raw: unknown): Record<string, any> {
  if (!raw || typeof raw !== 'object') return {};
  const value = raw as Record<string, any>;
  return value.event && typeof value.event === 'object' ? value.event : value;
}
