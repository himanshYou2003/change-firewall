import { resolve } from 'node:path';
import { PlaygroundGateway } from './server.js';

const gateway = new PlaygroundGateway({
  host: process.env.PLAYGROUND_HOST ?? '127.0.0.1',
  port: Number(process.env.PLAYGROUND_PORT ?? 8787),
  allowedOrigin: process.env.PLAYGROUND_ALLOWED_ORIGIN ?? 'http://localhost:3000',
  gatewayToken: process.env.PLAYGROUND_GATEWAY_TOKEN ?? '',
  fixtureRoot: process.env.PLAYGROUND_FIXTURE_ROOT,
  seedScript: process.env.PLAYGROUND_SEED_SCRIPT,
  cliRoot: process.env.PLAYGROUND_CLI_ROOT ?? resolve('../..'),
  runtimeRoot: process.env.PLAYGROUND_RUNTIME_ROOT,
  idleTtlMs: process.env.PLAYGROUND_IDLE_TTL_MS ? Number(process.env.PLAYGROUND_IDLE_TTL_MS) : undefined,
  absoluteTtlMs: process.env.PLAYGROUND_ABSOLUTE_TTL_MS ? Number(process.env.PLAYGROUND_ABSOLUTE_TTL_MS) : undefined,
  cliVersion: process.env.PLAYGROUND_CLI_VERSION ?? 'development',
});
const address = await gateway.listen();
console.log(`Change Firewall local playground gateway listening at http://${address.host}:${address.port}`);
console.warn('LOCAL DEVELOPMENT ADAPTER: this process executes commands on the host and is not a production isolation boundary.');
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => void gateway.close().finally(() => process.exit(0)));
