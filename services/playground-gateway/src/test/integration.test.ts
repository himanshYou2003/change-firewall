import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PlaygroundGateway } from '../server.js';

const repositoryRoot = resolve('../../');

test('real local session edits files, runs Change Firewall, reports Git state, and cleans up', { timeout: 180_000 }, async () => {
  const runtimeRoot = await mkdtemp(join(tmpdir(), 'playground-integration-'));
  const gateway = new PlaygroundGateway({
    host: '127.0.0.1', port: 0, allowedOrigin: 'http://localhost:3000', runtimeRoot,
    seedScript: join(repositoryRoot, 'scripts/playground/seed.mjs'), cliRoot: repositoryRoot,
    idleTtlMs: 60_000, absoluteTtlMs: 60_000, cliVersion: 'integration-test',
  });
  const address = await gateway.listen(); const base = `http://${address.host}:${address.port}`; let cookie = '';
  const request = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${base}${path}`, { ...init, headers: { origin: 'http://localhost:3000', cookie, 'content-type': 'application/json', ...init.headers } });
    const setCookie = response.headers.get('set-cookie'); if (setCookie) cookie = setCookie.split(';')[0]!;
    return response;
  };
  let workspace = '';
  try {
    const health = await request('/healthz'); assert.equal(health.status, 200);
    const readiness = await request('/readyz'); assert.equal(readiness.status, 200);
    assert.deepEqual(await readiness.json(), { ready: true, sessions: 0, capacity: 25 });
    const provisioningStartedAt = performance.now();
    const createdResponse = await request('/sessions', { method: 'POST', headers: { 'idempotency-key': 'integration-1' }, body: JSON.stringify({ fixtureId: 'contract-drift', fixtureVersion: '1' }) });
    const provisioningMs = performance.now() - provisioningStartedAt;
    assert.ok(provisioningMs < 10_000, `session provisioning took ${Math.round(provisioningMs)}ms; expected the release template path under 10s`);
    assert.equal(createdResponse.status, 201); const created = await createdResponse.json() as { sessionId: string; generation: number; capabilities: { pty: boolean; isolation: string } };
    assert.equal(typeof created.capabilities.pty, 'boolean'); assert.equal(created.capabilities.isolation, 'local-development');
    workspace = gateway.sessions.get(created.sessionId).workspace; assert.ok((await stat(join(workspace, '.git'))).isDirectory());

    const filesResponse = await request(`/sessions/${created.sessionId}/files`); assert.equal(filesResponse.status, 200);
    const filesBody = await filesResponse.json() as { files: Array<{ path: string; revision: string }>; git: { unstaged: string[] } };
    const readmeEntry = filesBody.files.find((entry) => entry.path === 'README.md'); assert.ok(readmeEntry);
    const fileResponse = await request(`/sessions/${created.sessionId}/file?path=README.md`); const file = await fileResponse.json() as { content: string; revision: string };
    const edited = `${file.content}\nIntegration edit.\n`;
    const saveResponse = await request(`/sessions/${created.sessionId}/file`, { method: 'PUT', body: JSON.stringify({ path: 'README.md', content: edited, expectedRevision: file.revision }) });
    assert.equal(saveResponse.status, 200); assert.equal(await readFile(join(workspace, 'README.md'), 'utf8'), edited);
    const conflict = await request(`/sessions/${created.sessionId}/file`, { method: 'PUT', body: JSON.stringify({ path: 'README.md', content: 'stale', expectedRevision: file.revision }) }); assert.equal(conflict.status, 409);
    const traversal = await request(`/sessions/${created.sessionId}/file?path=..%2Fpackage.json`); assert.equal(traversal.status, 400);

    const commandResponse = await request(`/sessions/${created.sessionId}/commands`, { method: 'POST', body: JSON.stringify({ command: 'change-firewall --help' }) });
    assert.equal(commandResponse.status, 201); const command = await commandResponse.json() as { processId: string; terminalId: string };
    const commandStartedAt = performance.now();
    let firstOutputMs: number | undefined; let terminalOutput = ''; let exited = false;
    for (let attempt = 0; attempt < 600 && !exited; attempt += 1) {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));
      const eventsResponse = await request(`/sessions/${created.sessionId}/events`); const eventBody = await eventsResponse.json() as { events: Array<{ event: Record<string, unknown> }> };
      terminalOutput = eventBody.events.filter((item) => item.event.type === 'terminal.output' && item.event.terminalId === command.terminalId).map((item) => item.event.data).join('');
      if (terminalOutput && firstOutputMs === undefined) firstOutputMs = performance.now() - commandStartedAt;
      exited = eventBody.events.some((item) => item.event.type === 'process.exit' && item.event.processId === command.processId);
    }
    assert.equal(exited, true); assert.match(terminalOutput, /Usage: change-firewall|Change Firewall/i);
    assert.ok(firstOutputMs !== undefined && firstOutputMs < 5_000, `first terminal output took ${Math.round(firstOutputMs ?? -1)}ms; expected under 5s`);
    for (const versionCommand of ['change-firewall --version']) {
      const versionResponse = await request(`/sessions/${created.sessionId}/commands`, { method: 'POST', body: JSON.stringify({ command: versionCommand }) });
      assert.equal(versionResponse.status, 201); const versionRun = await versionResponse.json() as { processId: string; terminalId: string };
      let versionOutput = ''; let versionExited = false;
      for (let attempt = 0; attempt < 750 && !versionExited; attempt += 1) {
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 40));
        const eventBody = await (await request(`/sessions/${created.sessionId}/events`)).json() as { events: Array<{ event: Record<string, unknown> }> };
        versionOutput = eventBody.events.filter((item) => item.event.type === 'terminal.output' && item.event.terminalId === versionRun.terminalId).map((item) => item.event.data).join('');
        versionExited = eventBody.events.some((item) => item.event.type === 'process.exit' && item.event.processId === versionRun.processId);
      }
      assert.equal(versionExited, true); assert.match(versionOutput, /\d+\.\d+\.\d+/);
    }
    const gitResponse = await request(`/sessions/${created.sessionId}/git/status`); const git = await gitResponse.json() as { unstaged: string[] };
    assert.ok(git.unstaged.includes('README.md'));

    const deleted = await request(`/sessions/${created.sessionId}`, { method: 'DELETE' }); assert.equal(deleted.status, 204);
    await assert.rejects(stat(workspace)); workspace = '';
  } finally {
    await gateway.close(); await rm(runtimeRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
