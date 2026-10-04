export const PROTOCOL_VERSION = 1 as const;
export const MAX_MESSAGE_BYTES = 64 * 1024;
export const MAX_EDITABLE_FILE_BYTES = 1024 * 1024;
export const MAX_VISIBLE_FILES = 200;

export type SessionState =
  | 'idle' | 'provisioning' | 'seeding' | 'ready' | 'reconnecting'
  | 'failed' | 'expired' | 'destroying';

export type RuntimeCapabilities = {
  pty: boolean;
  interactiveInput: boolean;
  terminalResize: boolean;
  previewProxy: boolean;
  isolation: 'local-development' | 'hardened';
};

export type Envelope<T> = {
  protocolVersion: typeof PROTOCOL_VERSION;
  sessionId: string;
  generation: number;
  sequence: number;
  event: T;
};

export type GitStatusSnapshot = {
  revision: number;
  head: string | null;
  staged: string[];
  unstaged: string[];
  untracked: string[];
};

export type ServerEvent =
  | { type: 'terminal.output'; terminalId: string; data: string }
  | { type: 'process.exit'; processId: string; code: number | null; signal?: string }
  | { type: 'command.started'; runId: string; terminalId: string; family: string; workspaceRevision: number }
  | { type: 'command.failed'; runId: string; category: 'syntax' | 'analysis' | 'runtime'; message: string }
  | { type: 'workspace.changed'; revision: number; paths: string[] }
  | ({ type: 'git.status' } & GitStatusSnapshot)
  | { type: 'dashboard.ready'; dashboardId: string; port: number; autoOpen: boolean; mode: 'snapshot' | 'watch' | 'demo' }
  | { type: 'memory.changed'; exists: boolean; contracts: number | null }
  | { type: 'session.state'; state: SessionState; reason?: string };

export type SessionView = {
  sessionId: string;
  generation: number;
  state: SessionState;
  expiresAt: string;
  cliVersion: string;
  capabilities: RuntimeCapabilities;
};

export type FileEntry = {
  path: string;
  kind: 'file' | 'directory';
  size?: number;
  revision?: string;
  gitStatus?: string;
};

export type ClientMessage =
  | { type: 'terminal.input'; terminalId: string; data: string }
  | { type: 'terminal.resize'; terminalId: string; cols: number; rows: number }
  | { type: 'command.cancel'; processId: string }
  | { type: 'events.ack'; sequence: number };

export class ProtocolError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ProtocolError';
  }
}

export function requireObject(value: unknown, label = 'body'): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ProtocolError(400, `${label} must be an object`);
  return value as Record<string, unknown>;
}

export function requireString(value: unknown, label: string, max = 4096): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max) {
    throw new ProtocolError(400, `${label} must be a non-empty string of at most ${max} characters`);
  }
  return value;
}

export function optionalString(value: unknown, label: string, max = 4096): string | undefined {
  if (value === undefined) return undefined;
  return requireString(value, label, max);
}

export function requireInteger(value: unknown, label: string, min: number, max: number): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new ProtocolError(400, `${label} must be an integer between ${min} and ${max}`);
  }
  return value as number;
}

export function parseJsonBody(raw: Buffer): Record<string, unknown> {
  if (raw.byteLength > MAX_MESSAGE_BYTES) throw new ProtocolError(413, 'request body is too large');
  try { return requireObject(JSON.parse(raw.toString('utf8'))); }
  catch (error) {
    if (error instanceof ProtocolError) throw error;
    throw new ProtocolError(400, 'request body is not valid JSON');
  }
}

export function validateRelativePath(input: unknown): string {
  const path = requireString(input, 'path', 1024).replaceAll('\\', '/');
  if (path.includes('\0') || path.startsWith('/') || /^[A-Za-z]:\//.test(path)) throw new ProtocolError(400, 'path must be relative');
  const segments = path.split('/');
  if (segments.some((part) => part === '' || part === '.' || part === '..')) throw new ProtocolError(400, 'path contains an unsafe segment');
  if (segments[0] === '.git' || segments[0] === 'node_modules') throw new ProtocolError(403, 'path is not editable');
  return segments.join('/');
}

export function validateClientMessage(value: unknown): ClientMessage {
  const body = requireObject(value, 'message');
  const type = requireString(body.type, 'type', 64);
  if (type === 'terminal.input') return { type, terminalId: requireString(body.terminalId, 'terminalId', 128), data: requireString(body.data, 'data', MAX_MESSAGE_BYTES) };
  if (type === 'terminal.resize') return { type, terminalId: requireString(body.terminalId, 'terminalId', 128), cols: requireInteger(body.cols, 'cols', 10, 500), rows: requireInteger(body.rows, 'rows', 2, 300) };
  if (type === 'command.cancel') return { type, processId: requireString(body.processId, 'processId', 128) };
  if (type === 'events.ack') return { type, sequence: requireInteger(body.sequence, 'sequence', 0, Number.MAX_SAFE_INTEGER) };
  throw new ProtocolError(400, 'unknown client message type');
}
