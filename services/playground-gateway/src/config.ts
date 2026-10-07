import { resolve } from 'node:path';
import type { GatewayConfig } from './server.js';

export type LoadedGatewayConfig = GatewayConfig & {
  shutdownTimeoutMs: number;
};

function integer(environment: NodeJS.ProcessEnv, name: string, fallback: number, minimum: number, maximum: number): number {
  const raw = environment[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}

function origins(raw: string): string {
  const values = raw.split(',').map((value) => value.trim()).filter(Boolean);
  if (values.length === 0) throw new Error('PLAYGROUND_ALLOWED_ORIGIN must contain at least one explicit origin');
  for (const value of values) {
    if (value === '*') throw new Error('PLAYGROUND_ALLOWED_ORIGIN cannot contain a wildcard');
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== value) {
      throw new Error(`PLAYGROUND_ALLOWED_ORIGIN contains an invalid origin: ${value}`);
    }
  }
  return [...new Set(values)].join(',');
}

export function loadGatewayConfig(environment: NodeJS.ProcessEnv = process.env): LoadedGatewayConfig {
  if (environment.NODE_ENV === 'production') {
    throw new Error(
      'Refusing to start the local-process playground adapter with NODE_ENV=production. ' +
      'Public execution requires the hardened per-session sandbox adapter; do not bypass this guard.'
    );
  }

  const fixtureRoot = environment.PLAYGROUND_FIXTURE_ROOT?.trim() || undefined;
  const seedScript = environment.PLAYGROUND_SEED_SCRIPT?.trim() || undefined;
  if (Boolean(fixtureRoot) === Boolean(seedScript)) {
    throw new Error('Configure exactly one of PLAYGROUND_SEED_SCRIPT or PLAYGROUND_FIXTURE_ROOT');
  }

  return {
    host: environment.PLAYGROUND_HOST?.trim() || '127.0.0.1',
    port: integer(environment, environment.PLAYGROUND_PORT !== undefined ? 'PLAYGROUND_PORT' : 'PORT', 8787, 1, 65_535),
    allowedOrigin: origins(environment.PLAYGROUND_ALLOWED_ORIGIN ?? 'http://localhost:3000,http://127.0.0.1:3000'),
    gatewayToken: environment.PLAYGROUND_GATEWAY_TOKEN ?? '',
    fixtureRoot,
    seedScript,
    cliRoot: environment.PLAYGROUND_CLI_ROOT?.trim() || resolve('../..'),
    runtimeRoot: environment.PLAYGROUND_RUNTIME_ROOT?.trim() || undefined,
    idleTtlMs: integer(environment, 'PLAYGROUND_IDLE_TTL_MS', 10 * 60_000, 10_000, 24 * 60 * 60_000),
    absoluteTtlMs: integer(environment, 'PLAYGROUND_ABSOLUTE_TTL_MS', 30 * 60_000, 10_000, 24 * 60 * 60_000),
    maxSessions: integer(environment, 'PLAYGROUND_MAX_SESSIONS', 25, 1, 10_000),
    warmPoolSize: integer(environment, 'PLAYGROUND_WARM_POOL_SIZE', 1, 0, 10),
    cliVersion: environment.PLAYGROUND_CLI_VERSION?.trim() || 'development',
    shutdownTimeoutMs: integer(environment, 'PLAYGROUND_SHUTDOWN_TIMEOUT_MS', 10_000, 1_000, 60_000),
  };
}
