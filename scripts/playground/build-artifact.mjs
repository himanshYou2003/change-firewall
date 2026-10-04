#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../..');
const artifactDirectory = path.join(repositoryRoot, '.playground-artifacts');

async function digestTree(root) {
  const hash = createHash('sha256');
  async function add(relative) {
    const absolute = path.join(root, relative);
    const info = await lstat(absolute);
    if (info.isDirectory()) {
      for (const child of (await readdir(absolute)).sort()) await add(path.join(relative, child));
      return;
    }
    hash.update(relative.replaceAll(path.sep, '/'));
    hash.update('\0');
    hash.update(await readFile(absolute));
    hash.update('\0');
  }
  for (const child of (await readdir(root)).sort()) await add(child);
  return hash.digest('hex');
}

async function main() {
  await execFileAsync('npm', ['run', 'build'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  });
  await mkdir(artifactDirectory, { recursive: true });
  const packageJson = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
  const expectedFilename = `${packageJson.name.replace(/^@/, '').replace('/', '-')}-${packageJson.version}.tgz`;
  await execFileAsync(
    'npm',
    ['pack', '--ignore-scripts', '--pack-destination', artifactDirectory],
    {
      cwd: repositoryRoot,
      env: { ...process.env, npm_config_cache: path.join(artifactDirectory, '.npm-cache') },
      maxBuffer: 10 * 1024 * 1024,
    }
  );
  const filename = expectedFilename;
  const artifactBytes = await readFile(path.join(artifactDirectory, filename));
  const lock = JSON.parse(await readFile(path.join(repositoryRoot, 'package-lock.json'), 'utf8'));
  const dependencyDirectory = path.join(artifactDirectory, 'runtime-node-modules');
  await rm(dependencyDirectory, { recursive: true, force: true });
  await mkdir(dependencyDirectory, { recursive: true });
  for (const [packagePath, details] of Object.entries(lock.packages ?? {})) {
    if (!packagePath.startsWith('node_modules/') || details?.dev === true) continue;
    const source = path.join(repositoryRoot, packagePath);
    const destination = path.join(dependencyDirectory, packagePath.slice('node_modules/'.length));
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination, { recursive: true, dereference: true });
  }
  const metadata = {
    name: packageJson.name,
    version: packageJson.version,
    filename,
    sha256: createHash('sha256').update(artifactBytes).digest('hex'),
    dependencySha256: await digestTree(dependencyDirectory),
    dependencyDirectory: path.basename(dependencyDirectory),
    createdAt: new Date().toISOString(),
  };
  await writeFile(
    path.join(artifactDirectory, 'manifest.json'),
    JSON.stringify(metadata, null, 2) + '\n',
    'utf8'
  );
  console.log(path.join(artifactDirectory, filename));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
