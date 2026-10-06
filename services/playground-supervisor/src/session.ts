import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { execFile, spawn } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import type { Envelope, GitStatusSnapshot, RuntimeCapabilities, ServerEvent, SessionState, SessionView } from '../../../packages/playground-protocol/dist/index.js';
import { PROTOCOL_VERSION, ProtocolError } from '../../../packages/playground-protocol/dist/index.js';
import { listWorkspaceFiles, mutateWorkspaceFile, readWorkspaceFile, writeWorkspaceFile } from './storage.js';
import { ProcessManager, nativePtyAvailable, processOwnsListeningPort } from './processes.js';

const execFileAsync = promisify(execFile);

export type SupervisorConfig = {
  fixtureRoot?: string;
  seedScript?: string;
  cliRoot?: string;
  runtimeRoot?: string;
  idleTtlMs?: number;
  absoluteTtlMs?: number;
  maxSessions?: number;
  warmPoolSize?: number;
  cliVersion?: string;
};

type Dashboard = { dashboardId: string; processId: string; port: number; mode: 'snapshot' | 'watch' | 'demo' };

export class LocalSession extends EventEmitter {
  readonly sessionId = randomUUID();
  readonly token = randomBytes(32).toString('base64url');
  readonly workspace: string;
  readonly capabilities: RuntimeCapabilities = { pty: nativePtyAvailable(), interactiveInput: true, terminalResize: nativePtyAvailable(), previewProxy: process.platform === 'linux' || process.platform === 'win32', isolation: 'local-development' };
  generation = 1;
  state: SessionState = 'idle';
  workspaceRevision = 0;
  expiresAt: Date;
  readonly events: Envelope<ServerEvent>[] = [];
  readonly processes: ProcessManager;
  readonly dashboards = new Map<string, Dashboard>();
  readonly terminals = new Set<string>();
  private sequence = 0;
  private absoluteTimer?: NodeJS.Timeout;
  private idleTimer?: NodeJS.Timeout;
  private destroyPromise?: Promise<void>;

  constructor(
    readonly root: string,
    private readonly config: Required<Pick<SupervisorConfig, 'idleTtlMs' | 'absoluteTtlMs' | 'cliVersion' | 'cliRoot'>>,
    private readonly onExpired: (sessionId: string) => void = () => undefined,
  ) {
    super(); this.workspace = join(root, 'workspace'); this.expiresAt = new Date(Date.now() + config.absoluteTtlMs);
    this.processes = new ProcessManager(this.workspace, (event) => this.push(event));
    this.processes.on('exit', (id) => {
      for (const [dashboardId, dashboard] of this.dashboards) if (dashboard.processId === id) this.dashboards.delete(dashboardId);
      this.workspaceRevision += 1; this.push({ type: 'workspace.changed', revision: this.workspaceRevision, paths: [] });
    });
    this.processes.on('dashboard-ready', (notice: { processId: string; runId: string; port: number; autoOpen: boolean; mode?: string }) => {
      const mode = notice.mode === 'watch' ? 'watch' : notice.mode === 'demo' ? 'demo' : 'snapshot';
      void this.registerDashboard(notice.processId, notice.port, mode, notice.autoOpen).catch((error) => {
        this.push({ type: 'command.failed', runId: notice.runId, category: 'runtime', message: `Dashboard registration failed: ${(error as Error).message}` });
      });
    });
  }

  push(event: ServerEvent): void {
    const envelope = { protocolVersion: PROTOCOL_VERSION, sessionId: this.sessionId, generation: this.generation, sequence: ++this.sequence, event } as Envelope<ServerEvent>;
    this.events.push(envelope); if (this.events.length > 2000) this.events.shift();
    this.emit('event', envelope); this.touch();
  }

  setState(state: SessionState, reason?: string): void { this.state = state; this.push({ type: 'session.state', state, ...(reason ? { reason } : {}) }); }
  view(): SessionView { return { sessionId: this.sessionId, generation: this.generation, state: this.state, expiresAt: this.expiresAt.toISOString(), cliVersion: this.config.cliVersion, capabilities: this.capabilities }; }
  touch(): void {
    if (this.state === 'destroying' || this.state === 'expired') return;
    clearTimeout(this.idleTimer);
    this.idleTimer = undefined;
    if (this.state !== 'ready') return;
    this.idleTimer = setTimeout(() => {
      void this.expire('idle timeout').catch(error => console.error('Failed to expire idle playground session:', error));
    }, this.config.idleTtlMs); this.idleTimer.unref();
  }
  get cliEntry(): string { return join(this.config.cliRoot, 'bin', 'change-firewall.js'); }
  armAbsoluteExpiry(): void {
    clearTimeout(this.absoluteTimer);
    this.expiresAt = new Date(Date.now() + this.config.absoluteTtlMs);
    this.absoluteTimer = setTimeout(() => {
      void this.expire('absolute timeout').catch(error => console.error('Failed to expire playground session at its absolute timeout:', error));
    }, this.config.absoluteTtlMs); this.absoluteTimer.unref(); this.touch();
  }
  async expire(reason: string): Promise<void> {
    if (this.state === 'destroying' || this.state === 'expired') return;
    this.setState('expired', reason);
    try { await this.destroy(false); }
    finally { this.onExpired(this.sessionId); }
  }
  async destroy(markDestroying = true): Promise<void> {
    if (this.destroyPromise) return this.destroyPromise;
    if (markDestroying) this.setState('destroying');
    clearTimeout(this.idleTimer); clearTimeout(this.absoluteTimer); this.processes.stopAll(); this.dashboards.clear(); this.terminals.clear();
    this.destroyPromise = (async () => {
      await new Promise((resolveTimer) => setTimeout(resolveTimer, 50));
      await rm(this.root, { recursive: true, force: true, maxRetries: 50, retryDelay: 200 });
    })();
    return this.destroyPromise;
  }
  eventsAfter(sequence: number): Envelope<ServerEvent>[] { return this.events.filter((event) => event.sequence > sequence); }
  async files() { this.touch(); return listWorkspaceFiles(this.workspace); }
  async readFile(path: unknown) { this.touch(); return readWorkspaceFile(this.workspace, path); }
  async writeFile(path: unknown, content: unknown, expectedRevision: unknown) { const result = await writeWorkspaceFile(this.workspace, path, content, expectedRevision); this.workspaceRevision += 1; this.push({ type: 'workspace.changed', revision: this.workspaceRevision, paths: [String(path)] }); return result; }
  async mutateFile(operation: Record<string, unknown>) { await mutateWorkspaceFile(this.workspace, operation); this.workspaceRevision += 1; this.push({ type: 'workspace.changed', revision: this.workspaceRevision, paths: [String(operation.path)] }); }
  createTerminal(): { terminalId: string; cwd: string; capabilities: { pty: boolean; resize: boolean } } {
    if (this.terminals.size >= 2) throw new ProtocolError(429, 'terminal limit reached');
    const terminalId = randomUUID(); this.terminals.add(terminalId); return { terminalId, cwd: '/workspace/demo', capabilities: { pty: this.capabilities.pty, resize: this.capabilities.terminalResize } };
  }
  start(command: string, terminalId?: string) {
    if (terminalId && !this.terminals.has(terminalId)) throw new ProtocolError(404, 'terminal not found');
    if (terminalId && this.processes.hasTerminal(terminalId)) throw new ProtocolError(409, 'terminal already has a running process');
    this.touch(); return this.processes.start(command, this.workspaceRevision, terminalId);
  }
  input(processId: string, data: string) { this.touch(); this.processes.input(processId, data); }
  resize(terminalId: string, cols: number, rows: number) { this.touch(); this.processes.resize(terminalId, cols, rows); }
  stop(processId: string) { this.touch(); this.processes.stop(processId); }

  async gitStatus(): Promise<GitStatusSnapshot> {
    this.touch(); let head: string | null = null;
    try { head = (await execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: this.workspace })).stdout.trim() || null; } catch {}
    let output = '';
    try {
      output = (await execFileAsync('git', ['status', '--porcelain=v1', '-z'], { cwd: this.workspace, maxBuffer: 1024 * 1024 })).stdout;
    } catch {
      const emptySnapshot = { revision: this.workspaceRevision, head: null, staged: [], unstaged: [], untracked: [] };
      return emptySnapshot;
    }
    const staged: string[] = [], unstaged: string[] = [], untracked: string[] = [];
    for (const record of output.split('\0').filter(Boolean)) {
      const x = record[0], y = record[1], path = record.slice(3);
      if (x === '?' && y === '?') untracked.push(path); else { if (x && x !== ' ') staged.push(path); if (y && y !== ' ') unstaged.push(path); }
    }
    const snapshot = { revision: this.workspaceRevision, head, staged, unstaged, untracked };
    this.push({ type: 'git.status', ...snapshot }); return snapshot;
  }

  async registerDashboard(processId: string, port: number, mode: Dashboard['mode'], autoOpen: boolean): Promise<Dashboard> {
    const pid = this.processes.pid(processId); if (!pid) throw new ProtocolError(404, 'process not found');
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new ProtocolError(400, 'invalid preview port');
    if (!await processOwnsListeningPort(pid, port)) throw new ProtocolError(403, 'port is not owned by this process tree');
    const dashboard = { dashboardId: randomUUID(), processId, port, mode }; this.dashboards.set(dashboard.dashboardId, dashboard);
    this.push({ type: 'dashboard.ready', dashboardId: dashboard.dashboardId, port, autoOpen, mode }); return dashboard;
  }
}

async function runSeed(script: string, target: string, cliRoot: string, scenario: string): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(process.execPath, [script, '--target', target, '--cli-root', cliRoot, '--scenario', scenario], { stdio: ['ignore', 'pipe', 'pipe'] });
    let error = ''; child.stderr.on('data', (chunk) => { error += String(chunk); });
    child.on('exit', (code) => code === 0 ? resolvePromise() : reject(new Error(`fixture seed failed (${code}): ${error.slice(-2000)}`)));
    child.on('error', reject);
  });
}

export class LocalSessionManager {
  private readonly sessions = new Map<string, LocalSession>();
  private readonly config: Required<SupervisorConfig>;
  private creating = 0;
  private readonly warmRoots: string[] = [];
  private warmupPromise?: Promise<void>;
  private closed = false;
  constructor(config: SupervisorConfig = {}) {
    this.config = { fixtureRoot: config.fixtureRoot ?? '', seedScript: config.seedScript ?? '', cliRoot: config.cliRoot ?? resolve('.'), runtimeRoot: config.runtimeRoot ?? tmpdir(), idleTtlMs: config.idleTtlMs ?? 10 * 60_000, absoluteTtlMs: config.absoluteTtlMs ?? 30 * 60_000, maxSessions: config.maxSessions ?? 25, warmPoolSize: config.warmPoolSize ?? 0, cliVersion: config.cliVersion ?? 'development' };
  }
  private async seedRoot(scenario: string): Promise<string> {
    const root = await mkdtemp(join(this.config.runtimeRoot, 'change-firewall-playground-'));
    try {
      const workspace = join(root, 'workspace');
      if (this.config.seedScript) await runSeed(this.config.seedScript, workspace, this.config.cliRoot, scenario);
      else if (this.config.fixtureRoot) { await mkdir(workspace, { recursive: true }); await cp(this.config.fixtureRoot, workspace, { recursive: true, force: true }); }
      else throw new Error('PLAYGROUND_FIXTURE_ROOT or PLAYGROUND_SEED_SCRIPT is required');
      return root;
    } catch (error) {
      await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
      throw error;
    }
  }
  async warmup(): Promise<void> {
    if (this.closed || this.config.warmPoolSize === 0 || this.warmRoots.length >= this.config.warmPoolSize) return;
    if (this.warmupPromise) return this.warmupPromise;
    this.warmupPromise = (async () => {
      while (!this.closed && this.warmRoots.length < this.config.warmPoolSize) {
        this.warmRoots.push(await this.seedRoot('contract-drift'));
      }
    })().finally(() => { this.warmupPromise = undefined; });
    return this.warmupPromise;
  }
  async create(scenario = 'contract-drift'): Promise<LocalSession> {
    if (this.sessions.size + this.creating >= this.config.maxSessions) throw new ProtocolError(429, 'playground session capacity reached');
    this.creating += 1;
    let root: string;
    try {
      root = scenario === 'contract-drift' && this.warmRoots.length > 0
        ? this.warmRoots.shift()!
        : await this.seedRoot(scenario);
    }
    finally { this.creating -= 1; }
    const session = new LocalSession(root, this.config, (sessionId) => this.sessions.delete(sessionId)); this.sessions.set(session.sessionId, session);
    try {
      session.setState('provisioning'); session.setState('seeding');
      session.setState('ready'); session.armAbsoluteExpiry();
      if (scenario === 'contract-drift') void this.warmup().catch((error) => console.error('Failed to replenish playground warm pool:', error));
      return session;
    } catch (error) { session.setState('failed', (error as Error).message); await session.destroy(false); this.sessions.delete(session.sessionId); throw error; }
  }
  get activeCount(): number { return this.sessions.size; }
  get(id: string): LocalSession { const session = this.sessions.get(id); if (!session) throw new ProtocolError(404, 'session not found'); return session; }
  authorize(id: string, token: string | undefined): LocalSession { const session = this.get(id); if (!token || !timingSafeEqualString(token, session.token)) throw new ProtocolError(401, 'invalid session token'); return session; }
  async delete(id: string): Promise<void> { const session = this.sessions.get(id); if (!session) return; this.sessions.delete(id); await session.destroy(); }
  async reset(id: string, expectedGeneration: number, scenario = 'contract-drift'): Promise<LocalSession> {
    const old = this.get(id); if (old.generation !== expectedGeneration) throw new ProtocolError(409, 'stale session generation');
    old.processes.stopAll(); old.dashboards.clear(); old.terminals.clear(); old.setState('seeding');
    await rm(old.workspace, { recursive: true, force: true, maxRetries: 50, retryDelay: 200 });
    if (this.config.seedScript) await runSeed(this.config.seedScript, old.workspace, this.config.cliRoot, scenario); else { await mkdir(old.workspace, { recursive: true }); await cp(this.config.fixtureRoot, old.workspace, { recursive: true, force: true }); }
    old.generation += 1; old.workspaceRevision = 0; old.setState('ready'); return old;
  }
  async close(): Promise<void> {
    this.closed = true;
    await this.warmupPromise?.catch(() => undefined);
    await Promise.all([
      ...[...this.sessions.keys()].map((id) => this.delete(id)),
      ...this.warmRoots.splice(0).map((root) => rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })),
    ]);
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a), right = Buffer.from(b); if (left.length !== right.length) return false;
  return (awaitImportCryptoTimingSafeEqual)(left, right);
}
import { timingSafeEqual as awaitImportCryptoTimingSafeEqual } from 'node:crypto';
