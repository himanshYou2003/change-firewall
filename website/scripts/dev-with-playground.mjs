#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readlink, symlink } from 'node:fs/promises';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(websiteRoot, '..');
const gatewayUrl = process.env.NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL || 'http://127.0.0.1:8787';
const parsedGatewayUrl = new URL(gatewayUrl);
const gatewayPort = Number(parsedGatewayUrl.port || (parsedGatewayUrl.protocol === 'https:' ? 443 : 80));
const websitePort = Number(process.env.PORT || 3000);
const nextEnvironment = { ...process.env };
let gateway;
let website;
let stopping = false;
let gatewayStartPromise;
let gatewayMonitor;

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function configureFastWindowsDevCache() {
  if (process.platform !== 'win32' || process.env.NEXT_DIST_DIR) return;

  // Next.js requires distDir to remain inside the project. Keep that supported
  // project-local path, but back it with an NTFS junction whose physical files
  // live outside OneDrive's sync filter.
  const projectId = createHash('sha256').update(websiteRoot.toLowerCase()).digest('hex').slice(0, 12);
  const cacheTarget = path.join(tmpdir(), 'ChangeFirewall', 'next-dev', projectId);
  const distDirName = '.next-dev-local';
  const junctionPath = path.join(websiteRoot, distDirName);

  await mkdir(cacheTarget, { recursive: true });

  try {
    const existing = await lstat(junctionPath);
    if (!existing.isSymbolicLink()) {
      throw new Error(
        `${junctionPath} already exists but is not the managed development-cache junction. ` +
        'Rename or remove that disposable directory, then run npm run dev again.'
      );
    }

    const currentTarget = path.resolve(path.dirname(junctionPath), await readlink(junctionPath));
    if (currentTarget.toLowerCase() !== path.resolve(cacheTarget).toLowerCase()) {
      throw new Error(
        `${junctionPath} points to ${currentTarget}, not the expected local cache ${cacheTarget}.`
      );
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    await symlink(cacheTarget, junctionPath, 'junction');
  }

  nextEnvironment.NEXT_DIST_DIR = distDirName;
  // Turbopack executes generated PostCSS workers from the junction's physical
  // target. Make project dependencies resolvable from that external location.
  nextEnvironment.NODE_PATH = [
    path.join(websiteRoot, 'node_modules'),
    process.env.NODE_PATH,
  ].filter(Boolean).join(path.delimiter);
  console.log(`Next.js development cache: ${cacheTarget} (local, outside OneDrive)`);
}

function portIsListening(host, port) {
  return new Promise(resolve => {
    const socket = connect({ host, port });
    const finish = listening => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(listening);
    };
    socket.setTimeout(750);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function gatewayHealthy() {
  try {
    const response = await fetch(`${gatewayUrl.replace(/\/$/, '')}/healthz`, {
      headers: { origin: process.env.PLAYGROUND_ALLOWED_ORIGIN || 'http://localhost:3000' },
      signal: AbortSignal.timeout(1_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForGateway(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await gatewayHealthy()) return true;
    await delay(200);
  }
  return false;
}

function stopChild(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  child.kill('SIGTERM');
}

function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  if (gatewayMonitor) clearInterval(gatewayMonitor);
  stopChild(website);
  stopChild(gateway);
  process.exitCode = code;
}

async function ensureGateway() {
  if (await gatewayHealthy()) return;
  if (gatewayStartPromise) return gatewayStartPromise;
  gatewayStartPromise = (async () => {
    if (gateway && gateway.exitCode === null && !gateway.killed) {
      if (!await waitForGateway()) {
        throw new Error(`Playground gateway process did not become healthy at ${gatewayUrl}`);
      }
      return;
    }

    // Another launcher can win the port between our health probe and spawn.
    // Give that gateway time to become healthy instead of creating an
    // EADDRINUSE restart loop.
    if (await portIsListening(parsedGatewayUrl.hostname, gatewayPort)) {
      if (await waitForGateway()) return;
      throw new Error(
        `Port ${gatewayPort} is occupied, but ${gatewayUrl}/healthz is not a healthy playground gateway. ` +
        'Stop the process using that port or set NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL.'
      );
    }

    gateway = spawn(process.execPath, [path.join(repositoryRoot, 'scripts/playground/start-gateway.mjs')], {
      cwd: repositoryRoot,
      stdio: 'inherit',
      env: process.env,
    });
    gateway.once('exit', code => {
      gateway = undefined;
      if (!stopping) {
        setTimeout(async () => {
          if (await gatewayHealthy()) {
            console.log(`Using the playground gateway already running at ${gatewayUrl}.`);
            return;
          }
          console.error(`Playground gateway exited unexpectedly (${code ?? 'signal'}); restarting.`);
          void ensureGateway().catch(error => console.error(error.message));
        }, 500);
      }
    });
    if (!await waitForGateway()) {
      throw new Error(`Playground gateway did not become healthy at ${gatewayUrl}`);
    }
  })().finally(() => { gatewayStartPromise = undefined; });
  return gatewayStartPromise;
}

if (!Number.isInteger(websitePort) || websitePort < 1 || websitePort > 65535) {
  throw new Error(`Invalid website PORT: ${process.env.PORT}`);
}
await configureFastWindowsDevCache();
if (await portIsListening('127.0.0.1', websitePort)) {
  if (await gatewayHealthy()) {
    console.log(`Change Firewall dev stack is already running at http://localhost:${websitePort}.`);
    process.exit(0);
  }
  console.error(
    `Website port ${websitePort} is already used by another process. ` +
    'Stop that process or set PORT to a different value.'
  );
  process.exit(1);
}

try {
  await ensureGateway();
} catch (error) {
  shutdown(1);
  throw error;
}
gatewayMonitor = setInterval(() => {
  void ensureGateway().catch(error => console.error('Playground gateway health recovery failed:', error));
}, 3_000);

website = spawn(process.execPath, [path.join(websiteRoot, 'node_modules/next/dist/bin/next'), 'dev', '-p', String(websitePort)], {
  cwd: websiteRoot,
  stdio: 'inherit',
  env: nextEnvironment,
});
website.once('exit', code => shutdown(code || 0));

for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => shutdown());
