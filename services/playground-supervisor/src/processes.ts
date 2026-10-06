import { execFile, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { readFile, readdir, readlink } from 'node:fs/promises';
import { delimiter, join } from 'node:path';
import { promisify } from 'node:util';
import type { ServerEvent } from '../../../packages/playground-protocol/dist/index.js';
import { ProtocolError } from '../../../packages/playground-protocol/dist/index.js';
import type { IPty } from 'node-pty';

let nodePty: typeof import('node-pty') | undefined;
try { nodePty = await import('node-pty'); } catch { /* Optional native dependency is unavailable. */ }
const execFileAsync = promisify(execFile);

function shellCommand(command: string): { file: string; args: string[] } {
  if (process.platform === 'win32') {
    return { file: process.env.ComSpec || 'cmd.exe', args: ['/d', '/s', '/c', command] };
  }
  return { file: '/bin/sh', args: ['-c', command] };
}

export function nativePtyAvailable(): boolean { return Boolean(nodePty); }

export type RunningCommand = { processId: string; runId: string; terminalId: string; child?: ChildProcessWithoutNullStreams; pty?: IPty; pid: number; command: string };
type DashboardReadyNotice = { processId: string; runId: string; port: number; autoOpen: boolean; mode?: string };

export function dashboardPortFromOutput(text: string): number | undefined {
  const plainText = text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
  const match = /(?:Dashboard running at|Local Dashboard:|Live Dashboard active at:)\s+http:\/\/(?:localhost|127\.0\.0\.1):(\d+)/i.exec(plainText);
  if (!match) return undefined;
  const port = Number.parseInt(match[1]!, 10);
  return port >= 1024 && port <= 65535 ? port : undefined;
}

export class ProcessManager extends EventEmitter {
  private readonly commands = new Map<string, RunningCommand>();
  constructor(private readonly workspace: string, private readonly emitEvent: (event: ServerEvent) => void, private readonly maxProcesses = 2) { super(); }

  start(command: string, workspaceRevision: number, requestedTerminalId?: string): Omit<RunningCommand, 'child'> {
    if (!command.trim() || command.length > 8192) throw new ProtocolError(400, 'command must be between 1 and 8192 characters');
    if (this.commands.size >= this.maxProcesses) throw new ProtocolError(429, 'terminal process limit reached');
    const processId = randomUUID(); const runId = randomUUID(); const terminalId = requestedTerminalId ?? randomUUID();
    if (nodePty && /(^|\s)(interactive|inspect)(\s|$)/.test(command)) return this.startPty(command, processId, runId, terminalId, workspaceRevision);
    const shell = shellCommand(command);
    const child = spawn(shell.file, shell.args, {
      cwd: this.workspace, detached: process.platform !== 'win32', stdio: ['pipe', 'pipe', 'pipe', 'pipe'],
      env: {
        PATH: `${join(this.workspace, 'node_modules/.bin')}${delimiter}${process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin'}`,
        HOME: this.workspace, TERM: 'xterm-256color', NO_COLOR: process.env.NO_COLOR ?? '',
        CHANGE_FIREWALL_DASHBOARD_READY_FD: '3',
        CHANGE_FIREWALL_PLAYGROUND_PROGRESS: '1',
      },
    }) as ChildProcessWithoutNullStreams;
    const record: RunningCommand = { processId, runId, terminalId, child, pid: child.pid!, command };
    this.commands.set(processId, record);
    this.emitEvent({ type: 'command.started', runId, terminalId, family: command.trim().split(/\s+/)[0] ?? 'shell', workspaceRevision });
    let dashboardEmitted = false;
    let dashboardOutputBuffer = '';
    const emitDashboard = (port: number, autoOpen: boolean, mode?: string) => {
      if (dashboardEmitted) return;
      dashboardEmitted = true;
      this.emit('dashboard-ready', {
        processId,
        runId,
        port,
        autoOpen,
        ...(typeof mode === 'string' ? { mode } : {}),
      } satisfies DashboardReadyNotice);
    };

    const output = (data: Buffer) => {
      const text = data.toString('utf8');
      this.emitEvent({ type: 'terminal.output', terminalId, data: text });
      if (!dashboardEmitted) {
        dashboardOutputBuffer = `${dashboardOutputBuffer}${text}`.slice(-4096);
        const port = dashboardPortFromOutput(dashboardOutputBuffer);
        if (port !== undefined) {
            const mode = /(^|\s)watch(\s|$)/.test(command) ? 'watch' : /(^|\s)demo(\s|$)/.test(command) ? 'demo' : 'snapshot';
            const autoOpen = !/(^|\s)--no-open(\s|$)/.test(command);
            emitDashboard(port, autoOpen, mode);
        }
      }
    };
    child.stdout.on('data', output); child.stderr.on('data', output);
    const advisory = child.stdio[3]; let advisoryBuffer = '';
    if (advisory) advisory.on('data', (chunk: Buffer) => {
      advisoryBuffer += chunk.toString('utf8'); if (advisoryBuffer.length > 64 * 1024) { advisoryBuffer = ''; return; }
      const lines = advisoryBuffer.split('\n'); advisoryBuffer = lines.pop() ?? '';
      for (const line of lines) {
        try {
          const value = JSON.parse(line) as Record<string, unknown>;
          if (value.type === 'dashboard-ready' && Number.isInteger(value.port) && (value.port as number) >= 1024 && (value.port as number) <= 65535) {
            emitDashboard(value.port as number, value.autoOpen === true, typeof value.mode === 'string' ? value.mode : undefined);
          }
        } catch { /* Advisory metadata is ignored unless it matches the fixed schema. */ }
      }
    });
    child.on('error', (error) => this.emitEvent({ type: 'command.failed', runId, category: 'runtime', message: error.message }));
    child.on('close', (code, signal) => {
      this.commands.delete(processId);
      this.emitEvent({ type: 'process.exit', processId, code, ...(signal ? { signal } : {}) });
      this.emit('exit', processId);
    });
    return { processId, runId, terminalId, pid: child.pid!, command };
  }

  private startPty(command: string, processId: string, runId: string, terminalId: string, workspaceRevision: number): Omit<RunningCommand, 'child'> {
    const shell = shellCommand(command);
    const pty = nodePty!.spawn(shell.file, shell.args, {
      name: 'xterm-256color', cols: 100, rows: 28, cwd: this.workspace,
      env: { PATH: `${join(this.workspace, 'node_modules/.bin')}${delimiter}${process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin'}`, HOME: this.workspace, TERM: 'xterm-256color', NO_COLOR: process.env.NO_COLOR ?? '', CHANGE_FIREWALL_PLAYGROUND_PROGRESS: '1' },
    });
    const record: RunningCommand = { processId, runId, terminalId, pty, pid: pty.pid, command }; this.commands.set(processId, record);
    this.emitEvent({ type: 'command.started', runId, terminalId, family: command.trim().split(/\s+/)[0] ?? 'shell', workspaceRevision });
    let ptyDashboardEmitted = false;
    let ptyDashboardOutputBuffer = '';
    pty.onData((data) => {
      this.emitEvent({ type: 'terminal.output', terminalId, data });
      if (!ptyDashboardEmitted) {
        ptyDashboardOutputBuffer = `${ptyDashboardOutputBuffer}${data}`.slice(-4096);
        const port = dashboardPortFromOutput(ptyDashboardOutputBuffer);
        if (port !== undefined) {
            ptyDashboardEmitted = true;
            const mode = /(^|\s)watch(\s|$)/.test(command) ? 'watch' : /(^|\s)demo(\s|$)/.test(command) ? 'demo' : 'snapshot';
            const autoOpen = !/(^|\s)--no-open(\s|$)/.test(command);
            this.emit('dashboard-ready', { processId, runId, port, autoOpen, mode } satisfies DashboardReadyNotice);
        }
      }
    });
    pty.onExit(({ exitCode, signal }) => { this.commands.delete(processId); this.emitEvent({ type: 'process.exit', processId, code: exitCode, ...(signal ? { signal: String(signal) } : {}) }); this.emit('exit', processId); });
    return { processId, runId, terminalId, pty, pid: pty.pid, command };
  }

  input(processId: string, data: string): void {
    const command = this.commands.get(processId) ?? [...this.commands.values()].find((item) => item.terminalId === processId);
    if (!command) throw new ProtocolError(404, 'process not found');
    if (Buffer.byteLength(data) > 64 * 1024) throw new ProtocolError(413, 'input is too large');
    if (command.pty) command.pty.write(data); else command.child!.stdin.write(data);
  }
  resize(terminalId: string, cols: number, rows: number): void {
    const command = [...this.commands.values()].find((item) => item.terminalId === terminalId);
    if (command?.pty) command.pty.resize(cols, rows);
  }

  stop(processId: string): void {
    const command = this.commands.get(processId);
    if (!command) return;
    if (process.platform === 'win32') {
      const killer = spawn('taskkill.exe', ['/pid', String(command.pid), '/t', '/f'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      killer.unref();
      return;
    }
    try { process.kill(-command.pid, 'SIGTERM'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error; }
    setTimeout(() => { try { process.kill(-command.pid, 'SIGKILL'); } catch {} }, 1500).unref();
  }

  stopAll(): void { for (const id of this.commands.keys()) this.stop(id); }
  has(processId: string): boolean { return this.commands.has(processId); }
  hasTerminal(terminalId: string): boolean { return [...this.commands.values()].some((item) => item.terminalId === terminalId); }
  pid(processId: string): number | undefined { return this.commands.get(processId)?.pid; }
}

async function descendants(rootPid: number): Promise<Set<number>> {
  const result = new Set<number>([rootPid]);
  if (process.platform !== 'linux') return result;
  const procEntries = await readdir('/proc');
  const parents = new Map<number, number>();
  await Promise.all(procEntries.filter((name) => /^\d+$/.test(name)).map(async (name) => {
    try {
      const status = await readFile(`/proc/${name}/status`, 'utf8');
      const match = /^PPid:\s+(\d+)/m.exec(status); if (match) parents.set(Number(name), Number(match[1]));
    } catch {}
  }));
  let changed = true;
  while (changed) { changed = false; for (const [pid, ppid] of parents) if (result.has(ppid) && !result.has(pid)) { result.add(pid); changed = true; } }
  return result;
}

export async function processOwnsListeningPort(pid: number, port: number): Promise<boolean> {
  if (process.platform === 'win32') {
    const script = `
$rootProcessId = [int]$env:CF_PROCESS_ROOT
$listenPort = [int]$env:CF_LISTEN_PORT
$owners = @(Get-NetTCPConnection -State Listen -LocalPort $listenPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
if ($owners.Count -eq 0) { exit 1 }
$parents = @{}
Get-CimInstance Win32_Process | ForEach-Object { $parents[[int]$_.ProcessId] = [int]$_.ParentProcessId }
foreach ($ownerId in $owners) {
  $currentId = [int]$ownerId
  $visited = @{}
  while ($currentId -gt 0 -and -not $visited.ContainsKey($currentId)) {
    if ($currentId -eq $rootProcessId) { exit 0 }
    $visited[$currentId] = $true
    if (-not $parents.ContainsKey($currentId)) { break }
    $currentId = [int]$parents[$currentId]
  }
}
exit 1
`;
    try {
      await execFileAsync(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command', script],
        {
          env: { ...process.env, CF_PROCESS_ROOT: String(pid), CF_LISTEN_PORT: String(port) },
          timeout: 30_000,
          windowsHide: true,
        }
      );
      return true;
    } catch {
      return false;
    }
  }
  if (process.platform !== 'linux') return false;
  const wanted = port.toString(16).toUpperCase().padStart(4, '0');
  for (let attempt = 0; attempt < 5; attempt++) {
    const tables = await Promise.all(['/proc/net/tcp', '/proc/net/tcp6'].map(async (path) => { try { return await readFile(path, 'utf8'); } catch { return ''; } }));
    const inodes = new Set<string>();
    for (const table of tables) for (const line of table.split('\n').slice(1)) {
      const fields = line.trim().split(/\s+/); if (fields[1]?.endsWith(`:${wanted}`) && fields[3] === '0A' && fields[9]) inodes.add(fields[9]);
    }
    if (inodes.size > 0) {
      for (const childPid of await descendants(pid)) {
        try {
          for (const fd of await readdir(`/proc/${childPid}/fd`)) {
            try { const link = await readlink(`/proc/${childPid}/fd/${fd}`); const match = /^socket:\[(\d+)\]$/.exec(link); if (match && inodes.has(match[1]!)) return true; } catch {}
          }
        } catch {}
      }
    }
    if (attempt < 4) await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}
