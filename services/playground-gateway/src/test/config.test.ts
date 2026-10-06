import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGatewayConfig } from '../config.js';

const developmentEnvironment = {
  NODE_ENV: 'development',
  PLAYGROUND_SEED_SCRIPT: 'seed.mjs',
  PLAYGROUND_ALLOWED_ORIGIN: 'http://localhost:3000,https://app.example.com',
} satisfies NodeJS.ProcessEnv;

test('production refuses to start the local-process adapter', () => {
  assert.throws(
    () => loadGatewayConfig({ ...developmentEnvironment, NODE_ENV: 'production' }),
    /Refusing to start the local-process playground adapter/,
  );
});

test('configuration validates origins, bounds, and exclusive fixture source', () => {
  const config = loadGatewayConfig({ ...developmentEnvironment, PLAYGROUND_MAX_SESSIONS: '7' });
  assert.equal(config.maxSessions, 7);
  assert.equal(config.warmPoolSize, 1);
  assert.equal(config.allowedOrigin, 'http://localhost:3000,https://app.example.com');
  assert.throws(() => loadGatewayConfig({ ...developmentEnvironment, PLAYGROUND_ALLOWED_ORIGIN: '*' }), /wildcard/);
  assert.throws(() => loadGatewayConfig({ ...developmentEnvironment, PLAYGROUND_PORT: '70000' }), /PLAYGROUND_PORT/);
  assert.throws(() => loadGatewayConfig({ ...developmentEnvironment, PLAYGROUND_FIXTURE_ROOT: 'fixture' }), /exactly one/);
});
