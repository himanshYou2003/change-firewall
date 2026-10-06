import { access, mkdir } from 'node:fs/promises';
import { loadGatewayConfig } from './config.js';
import { PlaygroundGateway } from './server.js';

const config = loadGatewayConfig();

await access(config.cliRoot!);
await access((config.seedScript || config.fixtureRoot)!);
if (config.runtimeRoot) await mkdir(config.runtimeRoot, { recursive: true });

const gateway = new PlaygroundGateway(config);
if (config.warmPoolSize! > 0) {
  console.log(`Preparing ${config.warmPoolSize} warm playground session${config.warmPoolSize === 1 ? '' : 's'}...`);
  await gateway.warmup();
}
const address = await gateway.listen();
console.log(`Change Firewall local playground gateway listening at http://${address.host}:${address.port}`);
console.warn('LOCAL DEVELOPMENT ADAPTER: this process executes commands on the host and is not a production isolation boundary.');

let shutdownPromise: Promise<void> | undefined;
function shutdown(exitCode: number, reason: string): Promise<void> {
  if (shutdownPromise) return shutdownPromise;
  shutdownPromise = (async () => {
    console.log(`Shutting down playground gateway (${reason})...`);
    const forcedExit = setTimeout(() => {
      console.error(`Gateway shutdown exceeded ${config.shutdownTimeoutMs}ms; forcing exit.`);
      process.exit(exitCode || 1);
    }, config.shutdownTimeoutMs);
    forcedExit.unref();
    try {
      await gateway.close();
      clearTimeout(forcedExit);
      process.exitCode = exitCode;
    } catch (error) {
      console.error('Gateway shutdown failed:', error);
      process.exitCode = 1;
    }
  })();
  return shutdownPromise;
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => void shutdown(0, signal));
}
process.once('uncaughtException', (error) => {
  console.error('Uncaught gateway exception:', error);
  void shutdown(1, 'uncaughtException');
});
process.once('unhandledRejection', (reason) => {
  console.error('Unhandled gateway rejection:', reason);
  void shutdown(1, 'unhandledRejection');
});
