#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../..');
const execFileAsync = promisify(execFile);

async function prepareWindowsRuntime() {
  const artifactRoot = path.join(repositoryRoot, '.playground-artifacts');
  const manifestBytes = await readFile(path.join(artifactRoot, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  const cacheId = createHash('sha256').update(manifestBytes).digest('hex').slice(0, 16);
  const cacheBase = path.resolve(tmpdir(), 'ChangeFirewall', 'playground-cli');
  const target = path.join(cacheBase, cacheId);
  const markerPath = path.join(target, '.runtime-ready');
  const expectedMarker = `${manifest.sha256}\n`;
  if (await readFile(markerPath, 'utf8').catch(() => '') === expectedMarker) return target;

  await mkdir(cacheBase, { recursive: true });
  const staging = path.join(cacheBase, `.staging-${process.pid}-${Date.now()}`);
  if (!path.resolve(staging).startsWith(`${cacheBase}${path.sep}`)) throw new Error('Refusing to prepare runtime outside the local cache');
  await rm(staging, { recursive: true, force: true });
  await mkdir(path.join(staging, 'node_modules'), { recursive: true });
  try {
    const dependencyArchive = path.join(artifactRoot, manifest.dependencyArchive);
    const dependencyDigest = createHash('sha256').update(await readFile(dependencyArchive)).digest('hex');
    if (dependencyDigest !== manifest.dependencyArchiveSha256) throw new Error('Playground dependency archive digest mismatch');
    await execFileAsync('tar', ['-xzf', dependencyArchive, '-C', path.join(staging, 'node_modules')]);
    await execFileAsync('tar', ['-xzf', path.join(artifactRoot, manifest.filename), '-C', staging, '--strip-components=1']);
    const stagedArtifacts = path.join(staging, '.playground-artifacts');
    await mkdir(stagedArtifacts, { recursive: true });
    await cp(path.join(artifactRoot, 'manifest.json'), path.join(stagedArtifacts, 'manifest.json'));
    await cp(path.join(artifactRoot, manifest.filename), path.join(stagedArtifacts, manifest.filename));
    if (manifest.baselineTemplate?.filename) {
      await cp(path.join(artifactRoot, manifest.baselineTemplate.filename), path.join(stagedArtifacts, manifest.baselineTemplate.filename));
    }
    await writeFile(path.join(staging, '.runtime-ready'), expectedMarker, 'utf8');
    await rm(target, { recursive: true, force: true });
    await rename(staging, target);
    return target;
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}

process.env.PLAYGROUND_SEED_SCRIPT ||= path.join(repositoryRoot, 'scripts', 'playground', 'seed.mjs');
if (!process.env.PLAYGROUND_CLI_ROOT) {
  process.env.PLAYGROUND_CLI_ROOT = process.platform === 'win32'
    ? await prepareWindowsRuntime()
    : repositoryRoot;
}
process.env.PLAYGROUND_ALLOWED_ORIGIN ||= 'http://localhost:3000,http://127.0.0.1:3000';

await import(pathToFileURL(path.join(repositoryRoot, 'services', 'playground-gateway', 'dist', 'main.js')).href);
