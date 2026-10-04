#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');

function readArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key?.startsWith('--')) continue;
    const value = argv[index + 1];
    values.set(key, value && !value.startsWith('--') ? value : true);
    if (value && !value.startsWith('--')) index += 1;
  }
  return values;
}

function usage() {
  return [
    'Usage: node scripts/playground/seed.mjs --target <directory> [options]',
    '',
    'Options:',
    '  --scenario <name>   contract-drift (default), clean-baseline,',
    '                      just-committed, staged-vs-unstaged,',
    '                      memory-lesson, or fresh-repository',
    '  --cli-root <path>   repository/package root (default: this checkout)',
    '  --artifact-manifest <path>  packed CLI artifact manifest',
    '  --force             replace an existing target directory',
  ].join('\n');
}

async function git(target, args, options = {}) {
  const environment = {
    ...process.env,
    GIT_AUTHOR_NAME: 'Change Firewall Playground',
    GIT_AUTHOR_EMAIL: 'playground@change-firewall.local',
    GIT_COMMITTER_NAME: 'Change Firewall Playground',
    GIT_COMMITTER_EMAIL: 'playground@change-firewall.local',
    GIT_AUTHOR_DATE: options.date ?? '2026-01-01T00:00:00Z',
    GIT_COMMITTER_DATE: options.date ?? '2026-01-01T00:00:00Z',
  };
  return execFileAsync('git', args, { cwd: target, env: environment });
}

async function digestFiles(root, relativePaths) {
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
  for (const relative of relativePaths) await add(relative);
  return hash.digest('hex');
}

async function installLocalCommand(target, artifactManifestPath) {
  const artifactManifest = JSON.parse(await readFile(artifactManifestPath, 'utf8'));
  const artifactRoot = path.dirname(artifactManifestPath);
  const artifactPath = path.join(artifactRoot, artifactManifest.filename);
  const dependencyDirectory = path.join(artifactRoot, artifactManifest.dependencyDirectory);
  const artifactDigest = createHash('sha256').update(await readFile(artifactPath)).digest('hex');
  if (artifactDigest !== artifactManifest.sha256) {
    throw new Error(`CLI artifact digest mismatch: expected ${artifactManifest.sha256}, received ${artifactDigest}`);
  }
  const dependencyDigest = await digestFiles(dependencyDirectory, await readdir(dependencyDirectory));
  if (dependencyDigest !== artifactManifest.dependencySha256) {
    throw new Error(`CLI dependency digest mismatch: expected ${artifactManifest.dependencySha256}, received ${dependencyDigest}`);
  }

  const binDirectory = path.join(target, 'node_modules', '.bin');
  const packageDirectory = path.join(target, 'node_modules', 'change-firewall');
  const extractionDirectory = path.join(target, '.artifact-extract');
  await mkdir(binDirectory, { recursive: true });
  await cp(dependencyDirectory, path.join(target, 'node_modules'), { recursive: true, dereference: true });
  await mkdir(extractionDirectory, { recursive: true });
  await execFileAsync('tar', ['-xzf', artifactPath, '-C', extractionDirectory]);
  await cp(path.join(extractionDirectory, 'package'), packageDirectory, { recursive: true });
  await rm(extractionDirectory, { recursive: true, force: true });
  const commandTarget = path.join(packageDirectory, 'bin', 'change-firewall.js');
  const commandLink = path.join(binDirectory, 'change-firewall');
  await symlink(commandTarget, commandLink);
  await writeFile(
    path.join(packageDirectory, '.playground-artifact.json'),
    JSON.stringify({
      name: artifactManifest.name,
      version: artifactManifest.version,
      digest: artifactDigest,
      dependencyDigest,
    }, null, 2) + '\n',
    'utf8'
  );
  return { digest: artifactDigest, cliEntry: commandTarget };
}

async function copyLayer(source, target) {
  await cp(source, target, { recursive: true, force: true });
}

async function removeMemory(target) {
  await rm(path.join(target, '.firewall'), { recursive: true, force: true });
}

async function assertRecordedMemory(target) {
  const memoryPath = path.join(target, '.firewall', 'memory', 'invariants.json');
  const memory = JSON.parse(await readFile(memoryPath, 'utf8'));
  const count = Object.keys(memory.invariants ?? {}).length;
  if (count < 1) {
    throw new Error('Fixture memory recording produced zero contracts. Build the CLI and inspect the baseline layer.');
  }
  return count;
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  if (args.has('--help')) {
    console.log(usage());
    return;
  }

  const targetArgument = args.get('--target');
  if (typeof targetArgument !== 'string') {
    throw new Error(`--target is required\n\n${usage()}`);
  }

  const target = path.resolve(targetArgument);
  const fixtureRoot = path.join(repositoryRoot, 'fixtures', 'playground');
  const manifest = JSON.parse(await readFile(path.join(fixtureRoot, 'manifest.json'), 'utf8'));
  const fixtureDigest = await digestFiles(fixtureRoot, ['foundation', 'baseline', 'patches']);
  if (fixtureDigest !== manifest.sourceDigest) {
    throw new Error(`Fixture source digest mismatch: expected ${manifest.sourceDigest}, received ${fixtureDigest}`);
  }
  const scenarioName = typeof args.get('--scenario') === 'string'
    ? args.get('--scenario')
    : manifest.defaultScenario;
  const scenario = manifest.scenarios[scenarioName];
  if (!scenario) {
    throw new Error(`Unknown scenario "${scenarioName}". Choose: ${Object.keys(manifest.scenarios).join(', ')}`);
  }

  const cliRoot = path.resolve(
    typeof args.get('--cli-root') === 'string' ? args.get('--cli-root') : repositoryRoot
  );
  const artifactManifestPath = path.resolve(
    typeof args.get('--artifact-manifest') === 'string'
      ? args.get('--artifact-manifest')
      : path.join(cliRoot, '.playground-artifacts', 'manifest.json')
  );
  await readFile(artifactManifestPath, 'utf8').catch(() => {
    throw new Error(`Packed CLI artifact is missing at ${artifactManifestPath}. Run npm run playground:artifact first.`);
  });

  if (args.has('--force')) {
    const forbidden = new Set([path.parse(target).root, repositoryRoot, cliRoot, process.cwd()]);
    if (forbidden.has(target)) throw new Error(`Refusing to replace unsafe target: ${target}`);
    try {
      const marker = await readFile(path.join(target, '.playground-workspace'), 'utf8');
      if (marker.trim() !== 'change-firewall-playground-v1') {
        throw new Error(`Refusing to replace unmarked target: ${target}`);
      }
    } catch (error) {
      if ((error).code !== 'ENOENT') throw error;
      try {
        await lstat(target);
        throw new Error(`Refusing to replace existing unmarked target: ${target}`);
      } catch (targetError) {
        if ((targetError).code !== 'ENOENT') throw targetError;
      }
    }
    await rm(target, { recursive: true, force: true });
  }
  await mkdir(path.dirname(target), { recursive: true });
  await mkdir(target, { recursive: false });
  await writeFile(path.join(target, '.playground-workspace'), 'change-firewall-playground-v1\n', 'utf8');
  await copyLayer(path.join(fixtureRoot, 'foundation'), target);
  const installedCli = await installLocalCommand(target, artifactManifestPath);
  const cliDigest = installedCli.digest;
  await git(target, ['init', '--quiet']);
  await git(target, ['config', 'user.name', 'Change Firewall Playground']);
  await git(target, ['config', 'user.email', 'playground@change-firewall.local']);

  if (scenario.noCommits) {
    await copyLayer(path.join(fixtureRoot, 'baseline'), target);
    await removeMemory(target);
    console.log(JSON.stringify({ target, scenario: scenarioName, head: null, memoryContracts: 0, cliDigest }, null, 2));
    return;
  }

  await git(target, ['add', '.']);
  await git(target, ['commit', '--quiet', '-m', 'seed foundation'], { date: '2026-01-01T00:00:00Z' });
  await copyLayer(path.join(fixtureRoot, 'baseline'), target);

  if (scenario.stopAfterBaselineLayer) {
    await removeMemory(target);
    console.log(JSON.stringify({ target, scenario: scenarioName, head: 'seed foundation', memoryContracts: 0, cliDigest }, null, 2));
    return;
  }

  const memoryResult = await execFileAsync(process.execPath, [installedCli.cliEntry, 'memory', 'record'], {
    cwd: target,
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 10 * 1024 * 1024,
  });
  const memoryContracts = await assertRecordedMemory(target);
  await git(target, ['add', '.']);
  await git(target, ['commit', '--quiet', '-m', 'safe application baseline'], { date: '2026-01-02T00:00:00Z' });
  await git(target, ['tag', manifest.baselineTag]);

  if (scenario.patch) {
    await copyLayer(path.join(fixtureRoot, scenario.patch), target);
  }
  if (Array.isArray(scenario.stage) && scenario.stage.length > 0) {
    await git(target, ['add', '--', ...scenario.stage]);
  }
  if (scenario.commitPatch) {
    await git(target, ['add', '.']);
    await git(target, ['commit', '--quiet', '-m', 'agent contract mutation'], { date: '2026-01-03T00:00:00Z' });
  }
  if (scenario.removeMemory) await removeMemory(target);

  const { stdout: head } = await git(target, ['rev-parse', '--short', 'HEAD']);
  const { stdout: status } = await git(target, ['status', '--short']);
  await writeFile(
    path.join(target, '.playground.json'),
    JSON.stringify({
      fixtureVersion: manifest.version,
      fixtureDigest,
      cliDigest,
      scenario: scenarioName,
    }, null, 2) + '\n',
    'utf8'
  );

  console.log(JSON.stringify({
    target,
    scenario: scenarioName,
    head: head.trim(),
    memoryContracts,
    cliDigest,
    status: status.trim().split('\n').filter(Boolean),
    memoryOutput: memoryResult.stdout.trim(),
  }, null, 2));
}

main().catch((error) => {
  console.error(`Playground seed failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
