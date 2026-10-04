import { afterEach, describe, expect, it, vi } from 'vitest';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { collectFileDiffs } from '../src/core/git/collector.js';
import { startDashboardServer } from '../src/dashboard/server.js';
import { generateDemoReport } from '../src/core/demo/demo-runner.js';
import open from 'open';

vi.mock('open', () => ({ default: vi.fn() }));

const execFileAsync = promisify(execFile);
const cleanupPaths: string[] = [];

async function runNode(args: string[], options: { cwd?: string } = {}): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: options.cwd,
      env: { PATH: process.env.PATH },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`Node subprocess exited ${code}: ${stderr}`));
    });
  });
}

async function runNodeWithEvents(
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; events: any[]; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd,
      env: { PATH: process.env.PATH, CHANGE_FIREWALL_EVENT_FD: '3', CHANGE_FIREWALL_RUN_ID: 'test-run' },
      stdio: ['ignore', 'pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let eventOutput = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    const eventStream = child.stdio[3];
    if (eventStream && 'setEncoding' in eventStream) {
      eventStream.setEncoding('utf8');
      eventStream.on('data', (chunk) => (eventOutput += chunk));
    }
    child.once('error', reject);
    child.once('close', (code) => {
      const events = eventOutput.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
      resolve({ stdout, stderr, events, code: code ?? -1 });
    });
  });
}

async function makeRepo(): Promise<string> {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'change-firewall-correctness-'));
  cleanupPaths.push(cwd);
  await execFileAsync('git', ['init', '-q'], { cwd });
  await execFileAsync('git', ['config', 'user.name', 'Test Engineer'], { cwd });
  await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd });
  return cwd;
}

afterEach(async () => {
  await Promise.all(cleanupPaths.splice(0).map((entry) => fs.rm(entry, { recursive: true, force: true })));
});

describe('CLI correctness foundations', () => {
  it('reads staged content and numstats from the index, isolated from unstaged edits', async () => {
    const cwd = await makeRepo();
    await fs.writeFile(path.join(cwd, 'modified.txt'), 'base one\nbase two\n');
    await fs.writeFile(path.join(cwd, 'deleted.txt'), 'delete one\ndelete two\n');
    await fs.writeFile(path.join(cwd, 'rename-old.txt'), 'same content\n');
    await fs.writeFile(path.join(cwd, 'unstaged.txt'), 'base unstaged\n');
    await execFileAsync('git', ['add', '.'], { cwd });
    await execFileAsync('git', ['commit', '-qm', 'baseline'], { cwd });

    await fs.writeFile(path.join(cwd, 'modified.txt'), 'index one\nbase two\n');
    await fs.writeFile(path.join(cwd, 'added.txt'), 'added one\nadded two\n');
    await execFileAsync('git', ['add', 'modified.txt', 'added.txt'], { cwd });
    await execFileAsync('git', ['rm', '-q', 'deleted.txt'], { cwd });
    await execFileAsync('git', ['mv', 'rename-old.txt', 'rename-new.txt'], { cwd });

    await fs.writeFile(path.join(cwd, 'modified.txt'), 'worktree only\nbase two\nextra\n');
    await fs.writeFile(path.join(cwd, 'added.txt'), 'worktree replacement\n');
    await fs.writeFile(path.join(cwd, 'unstaged.txt'), 'not staged\n');

    const diffs = await collectFileDiffs({ cwd, staged: true });
    const byPath = new Map(diffs.map((diff) => [diff.path, diff]));

    expect([...byPath.keys()].sort()).toEqual([
      'added.txt',
      'deleted.txt',
      'modified.txt',
      'rename-new.txt',
    ]);
    expect(byPath.get('modified.txt')).toMatchObject({
      changeType: 'modified',
      beforeContent: 'base one\nbase two\n',
      afterContent: 'index one\nbase two\n',
      linesAdded: 1,
      linesDeleted: 1,
    });
    expect(byPath.get('added.txt')).toMatchObject({
      changeType: 'added',
      afterContent: 'added one\nadded two\n',
      linesAdded: 2,
      linesDeleted: 0,
    });
    expect(byPath.get('deleted.txt')).toMatchObject({
      changeType: 'deleted',
      beforeContent: 'delete one\ndelete two\n',
      afterContent: undefined,
      linesAdded: 0,
      linesDeleted: 2,
    });
    expect(byPath.get('rename-new.txt')).toMatchObject({
      changeType: 'renamed',
      oldPath: 'rename-old.txt',
      beforeContent: 'same content\n',
      afterContent: 'same content\n',
    });
  });

  it('handles unborn repositories separately for staged and working-tree analysis', async () => {
    const cwd = await makeRepo();
    await fs.writeFile(path.join(cwd, 'staged.txt'), 'index version\n');
    await execFileAsync('git', ['add', 'staged.txt'], { cwd });
    await fs.writeFile(path.join(cwd, 'staged.txt'), 'working version\nsecond line\n');
    await fs.writeFile(path.join(cwd, 'untracked.txt'), 'untracked\n');

    const staged = await collectFileDiffs({ cwd, staged: true });
    expect(staged).toHaveLength(1);
    expect(staged[0]).toMatchObject({
      path: 'staged.txt',
      changeType: 'added',
      afterContent: 'index version\n',
      linesAdded: 1,
    });

    const working = await collectFileDiffs({ cwd });
    expect(working).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'staged.txt', afterContent: 'working version\nsecond line\n', linesAdded: 2 }),
      expect.objectContaining({ path: 'untracked.txt', afterContent: 'untracked\n', linesAdded: 1 }),
    ]));
  });

  it.skipIf(process.env.CODEX_CI === '1')('emits dashboard-ready metadata only through an explicitly supplied hook', async () => {
    const events: unknown[] = [];
    process.env.CHANGE_FIREWALL_DASHBOARD_READY_FD = '99';
    const server = await startDashboardServer(generateDemoReport(), 0, true, {
      mode: 'snapshot',
      onReady: (event) => events.push(event),
    });
    try {
      expect(events).toEqual([
        expect.objectContaining({
          type: 'dashboard-ready',
          port: expect.any(Number),
          autoOpen: true,
          mode: 'snapshot',
        }),
      ]);
      expect(new URL(server.url).port).toBe(String((events[0] as { port: number }).port));
      expect(open).not.toHaveBeenCalled();
    } finally {
      await server.close();
      delete process.env.CHANGE_FIREWALL_DASHBOARD_READY_FD;
    }
  });

  it.skipIf(process.env.CODEX_CI === '1')('awaits async commands so subprocess JSON and memory output are complete', async () => {
    const cwd = await makeRepo();
    await fs.writeFile(path.join(cwd, 'sample.ts'), 'export const sample = true;\n');
    await execFileAsync('git', ['add', '.'], { cwd });
    await execFileAsync('git', ['commit', '-qm', 'baseline'], { cwd });
    const binPath = path.resolve(process.cwd(), 'bin/change-firewall.js');

    const analysis = await runNode([binPath, '--json'], { cwd });
    expect(analysis.stderr).toBe('');
    expect(analysis.stdout.length).toBeGreaterThan(0);
    expect(JSON.parse(analysis.stdout)).toMatchObject({
      totalFilesChanged: 0,
      changedFiles: [],
    });

    const memory = await runNode([binPath, 'memory', 'record'], { cwd });
    expect(memory.stderr).toBe('');
    expect(memory.stdout).toContain('Recorded baseline contract memory snapshot');
    await expect(fs.stat(path.join(cwd, '.firewall/memory/invariants.json'))).resolves.toBeDefined();
  });

  it.skipIf(process.env.CODEX_CI === '1')('preserves analyze --inspect as an option while accepting root --inspect', async () => {
    const binPath = path.resolve(process.cwd(), 'bin/change-firewall.js');
    const explicit = await runNode([binPath, 'analyze', '--inspect', '--help']);
    const rootAlias = await runNode([binPath, '--inspect', '--help']);

    expect(explicit.stdout).toContain('Usage: change-firewall analyze [options]');
    expect(explicit.stdout).toContain('--inspect');
    expect(rootAlias.stdout).toContain('Usage: change-firewall interactive|inspect [options]');
  });

  it.skipIf(process.env.CODEX_CI === '1')('emits opt-in semantic analysis, gate, failure, and exit events off stdout', async () => {
    const cwd = await makeRepo();
    await fs.writeFile(path.join(cwd, 'sample.ts'), 'export const sample = true;\n');
    await execFileAsync('git', ['add', '.'], { cwd });
    await execFileAsync('git', ['commit', '-qm', 'baseline'], { cwd });
    const binPath = path.resolve(process.cwd(), 'bin/change-firewall.js');

    const analysis = await runNodeWithEvents([binPath, 'analyze', '--json', '--staged'], cwd);
    expect(analysis.code).toBe(0);
    expect(() => JSON.parse(analysis.stdout)).not.toThrow();
    expect(analysis.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'command-start', command: 'analyze', runId: 'test-run' }),
      expect.objectContaining({
        type: 'analysis-completed',
        command: 'analyze',
        scope: 'staged',
        filesChanged: 0,
        findings: 0,
      }),
      expect.objectContaining({ type: 'command-exit', command: 'analyze', exitCode: 0 }),
    ]));

    const audit = await runNodeWithEvents([binPath, 'audit-agent', '--json'], cwd);
    expect(audit.code).toBe(0);
    expect(() => JSON.parse(audit.stdout)).not.toThrow();
    expect(audit.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'analysis-completed', command: 'audit-agent' }),
      expect.objectContaining({ type: 'command-exit', command: 'audit-agent', exitCode: 0 }),
    ]));

    const preflight = await runNodeWithEvents(
      [binPath, 'preflight', '--json', '--max-risk', '1'],
      cwd
    );
    expect(preflight.code).toBe(1);
    expect(() => JSON.parse(preflight.stdout)).not.toThrow();
    expect(preflight.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'preflight-gate', readyToMerge: false, maxRisk: 1 }),
      expect.objectContaining({ type: 'command-exit', command: 'preflight', exitCode: 1 }),
    ]));

    const failure = await runNodeWithEvents(
      [binPath, 'analyze', '--json', '--base', 'missing-comparison-ref'],
      cwd
    );
    expect(failure.code).toBe(1);
    expect(failure.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'command-failure', command: 'analyze' }),
      expect.objectContaining({ type: 'command-exit', command: 'analyze', exitCode: 1 }),
    ]));
  });

});
