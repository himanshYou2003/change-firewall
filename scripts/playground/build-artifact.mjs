#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../..');
const artifactDirectory = path.join(repositoryRoot, '.playground-artifacts');

async function runNpm(args, options) {
  const npmCli = process.env.npm_execpath;
  if (npmCli) return execFileAsync(process.execPath, [npmCli, ...args], options);
  if (process.platform === 'win32') {
    const bundledNpmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    return execFileAsync(process.execPath, [bundledNpmCli, ...args], options);
  }
  return execFileAsync('npm', args, options);
}

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
  const reuseRuntime = process.argv.includes('--reuse-runtime');
  await runNpm(['run', 'build'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  });
  await mkdir(artifactDirectory, { recursive: true });
  const packageJson = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
  const expectedFilename = `${packageJson.name.replace(/^@/, '').replace('/', '-')}-${packageJson.version}.tgz`;
  await runNpm(
    ['pack', '--ignore-scripts', '--pack-destination', artifactDirectory],
    {
      cwd: repositoryRoot,
      env: { ...process.env, npm_config_cache: path.join(artifactDirectory, '.npm-cache') },
      maxBuffer: 10 * 1024 * 1024,
    }
  );
  const filename = expectedFilename;
  const artifactBytes = await readFile(path.join(artifactDirectory, filename));
  const dependencyDirectory = path.join(artifactDirectory, 'runtime-node-modules');
  let dependencySha256;
  let dependencyArchive;
  let dependencyArchiveSha256;
  if (reuseRuntime) {
    const previousManifest = JSON.parse(await readFile(path.join(artifactDirectory, 'manifest.json'), 'utf8'));
    dependencyArchive = previousManifest.dependencyArchive;
    dependencySha256 = previousManifest.dependencySha256;
    dependencyArchiveSha256 = previousManifest.dependencyArchiveSha256;
    if (!dependencyArchive || !dependencySha256 || !dependencyArchiveSha256) {
      throw new Error('Existing artifact manifest does not contain a reusable runtime archive');
    }
    const archiveDigest = createHash('sha256')
      .update(await readFile(path.join(artifactDirectory, dependencyArchive)))
      .digest('hex');
    if (archiveDigest !== dependencyArchiveSha256) {
      throw new Error(`Existing runtime archive digest mismatch: expected ${dependencyArchiveSha256}, received ${archiveDigest}`);
    }
  } else {
    const lock = JSON.parse(await readFile(path.join(repositoryRoot, 'package-lock.json'), 'utf8'));
    await rm(dependencyDirectory, { recursive: true, force: true });
    await mkdir(dependencyDirectory, { recursive: true });
    for (const [packagePath, details] of Object.entries(lock.packages ?? {})) {
      if (!packagePath.startsWith('node_modules/') || details?.dev === true) continue;
      const source = path.join(repositoryRoot, packagePath);
      const destination = path.join(dependencyDirectory, packagePath.slice('node_modules/'.length));
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(source, destination, { recursive: true, dereference: true });
    }
    dependencySha256 = await digestTree(dependencyDirectory);
    dependencyArchive = 'runtime-node-modules.tgz';
    const dependencyArchivePath = path.join(artifactDirectory, dependencyArchive);
    await rm(dependencyArchivePath, { force: true });
    await execFileAsync('tar', ['-czf', dependencyArchivePath, '-C', dependencyDirectory, '.']);
    dependencyArchiveSha256 = createHash('sha256')
      .update(await readFile(dependencyArchivePath))
      .digest('hex');
  }
  const metadata = {
    name: packageJson.name,
    version: packageJson.version,
    filename,
    sha256: createHash('sha256').update(artifactBytes).digest('hex'),
    dependencySha256,
    dependencyDirectory: path.basename(dependencyDirectory),
    dependencyArchive,
    dependencyArchiveSha256,
    createdAt: new Date().toISOString(),
  };
  const manifestPath = path.join(artifactDirectory, 'manifest.json');
  await writeFile(
    manifestPath,
    JSON.stringify(metadata, null, 2) + '\n',
    'utf8'
  );

  // Build the expensive Git history and contract memory once per release.
  // Runtime sessions restore this small immutable baseline and only apply the
  // selected scenario patch, avoiding dependency extraction and AST analysis.
  const templateContainer = await mkdtemp(path.join(tmpdir(), 'change-firewall-template-'));
  const templateWorkspace = path.join(templateContainer, 'workspace');
  const templateFilename = 'baseline-template.tgz';
  const templatePath = path.join(artifactDirectory, templateFilename);
  try {
    await execFileAsync(process.execPath, [
      path.join(scriptDirectory, 'seed.mjs'),
      '--target', templateWorkspace,
      '--scenario', 'clean-baseline',
      '--cli-root', repositoryRoot,
      '--artifact-manifest', manifestPath,
    ], { cwd: repositoryRoot, maxBuffer: 10 * 1024 * 1024 });
    const templateMetadata = JSON.parse(await readFile(path.join(templateWorkspace, '.playground.json'), 'utf8'));
    await rm(path.join(templateWorkspace, 'node_modules'), { recursive: true, force: true });
    await rm(path.join(templateWorkspace, '.playground.json'), { force: true });
    await rm(templatePath, { force: true });
    await execFileAsync('tar', ['-czf', templatePath, '-C', templateWorkspace, '.']);
    const templateBytes = await readFile(templatePath);
    metadata.baselineTemplate = {
      filename: templateFilename,
      sha256: createHash('sha256').update(templateBytes).digest('hex'),
      fixtureDigest: templateMetadata.fixtureDigest,
      cliDigest: metadata.sha256,
    };
    await writeFile(manifestPath, JSON.stringify(metadata, null, 2) + '\n', 'utf8');
  } finally {
    await rm(templateContainer, { recursive: true, force: true });
  }
  console.log(path.join(artifactDirectory, filename));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
