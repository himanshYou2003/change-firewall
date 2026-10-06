import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalSessionManager } from '../session.js';

async function fixture(): Promise<{ root: string; fixtureRoot: string; runtimeRoot: string }> {
  const root = await mkdtemp(join(tmpdir(), 'playground-session-test-'));
  const fixtureRoot = join(root, 'fixture');
  const runtimeRoot = join(root, 'runtime');
  await mkdir(fixtureRoot);
  await mkdir(runtimeRoot);
  await writeFile(join(fixtureRoot, 'README.md'), 'fixture');
  return { root, fixtureRoot, runtimeRoot };
}

test('session capacity is enforced atomically', async () => {
  const paths = await fixture();
  const manager = new LocalSessionManager({ fixtureRoot: paths.fixtureRoot, runtimeRoot: paths.runtimeRoot, maxSessions: 1 });
  try {
    await manager.create();
    await assert.rejects(manager.create(), (error: Error & { status?: number }) => error.status === 429);
    assert.equal(manager.activeCount, 1);
  } finally {
    await manager.close();
    await rm(paths.root, { recursive: true, force: true });
  }
});

test('expired sessions are removed and their workspace is deleted', async () => {
  const paths = await fixture();
  const manager = new LocalSessionManager({ fixtureRoot: paths.fixtureRoot, runtimeRoot: paths.runtimeRoot, idleTtlMs: 25, absoluteTtlMs: 1_000 });
  try {
    const session = await manager.create();
    const workspace = session.workspace;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
    assert.equal(manager.activeCount, 0);
    await assert.rejects(stat(workspace));
  } finally {
    await manager.close();
    await rm(paths.root, { recursive: true, force: true });
  }
});

test('warm pool allocates an already-seeded isolated workspace immediately', async () => {
  const paths = await fixture();
  const manager = new LocalSessionManager({ fixtureRoot: paths.fixtureRoot, runtimeRoot: paths.runtimeRoot, warmPoolSize: 1 });
  try {
    await manager.warmup();
    const startedAt = performance.now();
    const session = await manager.create();
    const allocationMs = performance.now() - startedAt;
    assert.ok(allocationMs < 1_000, `warm session allocation took ${Math.round(allocationMs)}ms`);
    assert.equal(await readFile(join(session.workspace, 'README.md'), 'utf8'), 'fixture');
  } finally {
    await manager.close();
    await rm(paths.root, { recursive: true, force: true });
  }
});
