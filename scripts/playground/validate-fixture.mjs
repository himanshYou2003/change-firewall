#!/usr/bin/env node

import { execFile, spawn } from 'node:child_process';
import { mkdtemp, open, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const seedScript = path.join(scriptDir, 'seed.mjs');
const fixtureManifest = JSON.parse(
  await readFile(path.join(repositoryRoot, 'fixtures', 'playground', 'manifest.json'), 'utf8')
);

async function runCaptured(workspace, command, args) {
  // Some managed runners discard stdout from a nested captured Node process.
  // A real file descriptor also avoids holding a potentially large report in a
  // child-process pipe and behaves the same way in ordinary local/CI runs.
  const outputPath = path.join(os.tmpdir(), `change-firewall-output-${process.pid}-${Date.now()}.json`);
  const output = await open(outputPath, 'w');
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: workspace,
        env: { ...process.env, NO_COLOR: '1' },
        stdio: ['ignore', output.fd, 'pipe'],
      });
      let stderr = '';
      child.stderr.on('data', (chunk) => { stderr += String(chunk); });
      child.on('error', reject);
      child.on('exit', (code) => code === 0
        ? resolve()
        : reject(new Error(`CLI exited ${code}: ${stderr.slice(-2000)}`)));
    });
  } finally {
    await output.close();
  }
  try {
    return await readFile(outputPath, 'utf8');
  } finally {
    await rm(outputPath, { force: true });
  }
}

async function runCli(workspace, args) {
  const cliEntry = path.join(workspace, 'node_modules', '.bin', 'change-firewall');
  return runCaptured(workspace, process.execPath, [cliEntry, ...args]);
}

async function main() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'change-firewall-playground-'));
  const workspace = path.join(temporaryRoot, 'workspace');
  try {
    await execFileAsync(process.execPath, [seedScript, '--target', workspace, '--force']);
    const report = JSON.parse(await runCli(workspace, ['--json']));
    const defaultExpected = fixtureManifest.scenarios[fixtureManifest.defaultScenario].expected;
    const changedPaths = new Set(report.changedFiles?.map((file) => file.path) ?? []);
    for (const required of defaultExpected.changedPaths) {
      if (!changedPaths.has(required)) throw new Error(`Default report does not include ${required}`);
    }
    const memory = JSON.parse(
      await readFile(path.join(workspace, '.firewall', 'memory', 'invariants.json'), 'utf8')
    );
    const memoryContracts = Object.keys(memory.invariants ?? {}).length;
    if (memoryContracts < defaultExpected.memoryContractsMinimum) throw new Error('Default fixture has too few recorded contracts');

    const help = await runCli(workspace, ['--help']);
    for (const command of ['analyze', 'interactive', 'preflight', 'open', 'impact', 'watch', 'why', 'demo', 'mcp', 'graph', 'memory', 'audit-agent']) {
      if (!help.includes(command)) throw new Error(`Root help is missing ${command}`);
    }
    const directVersion = (await runCli(workspace, ['--version'])).trim();
    const npxVersion = (await runCaptured(
      workspace,
      'npx',
      ['--offline', '--no-install', 'change-firewall', '--version']
    )).trim();
    if (!directVersion || directVersion !== npxVersion) {
      throw new Error(`Local CLI resolution mismatch: direct=${directVersion}, npx=${npxVersion}`);
    }

    const categories = new Set(report.findings?.map((finding) => finding.category) ?? []);
    for (const category of defaultExpected.findingCategories) {
      if (!categories.has(category)) throw new Error(`Default fixture is missing ${category} finding`);
    }
    const { stdout: baselineTag } = await execFileAsync('git', ['rev-parse', 'playground-baseline'], { cwd: workspace });
    const { stdout: baselineHead } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: workspace });
    if (baselineTag.trim() !== baselineHead.trim()) throw new Error('playground-baseline tag does not point to the safe baseline HEAD');

    async function seedScenario(name) {
      const scenarioWorkspace = path.join(temporaryRoot, name);
      await execFileAsync(process.execPath, [seedScript, '--target', scenarioWorkspace, '--scenario', name, '--force']);
      return scenarioWorkspace;
    }

    const cleanExpected = fixtureManifest.scenarios['clean-baseline'].expected;
    const cleanWorkspace = await seedScenario('clean-baseline');
    const clean = JSON.parse(await runCli(cleanWorkspace, ['--json']));
    if (clean.totalFilesChanged !== cleanExpected.defaultFilesChanged) throw new Error('clean-baseline is not clean');

    const committedExpected = fixtureManifest.scenarios['just-committed'].expected;
    const committedWorkspace = await seedScenario('just-committed');
    const committedDefault = JSON.parse(await runCli(committedWorkspace, ['--json']));
    const committedBase = JSON.parse(await runCli(committedWorkspace, ['--json', '--base', 'playground-baseline']));
    if (committedDefault.totalFilesChanged !== committedExpected.defaultFilesChanged || committedBase.totalFilesChanged < committedExpected.baseFilesChangedMinimum) {
      throw new Error('just-committed does not preserve earlier-base analysis');
    }

    const stagedExpected = fixtureManifest.scenarios['staged-vs-unstaged'].expected;
    const stagedWorkspace = await seedScenario('staged-vs-unstaged');
    const stagedOnly = JSON.parse(await runCli(stagedWorkspace, ['--json', '--staged']));
    const stagedDefault = JSON.parse(await runCli(stagedWorkspace, ['--json']));
    const stagedPaths = stagedOnly.changedFiles.map((file) => file.path);
    if (JSON.stringify(stagedPaths.sort()) !== JSON.stringify([...stagedExpected.stagedPaths].sort()) || stagedDefault.totalFilesChanged !== stagedExpected.defaultFilesChanged) {
      throw new Error(`staged-vs-unstaged mismatch: ${stagedPaths.join(', ')}`);
    }

    const memoryExpected = fixtureManifest.scenarios['memory-lesson'].expected;
    const memoryWorkspace = await seedScenario('memory-lesson');
    const memoryLesson = JSON.parse(await runCli(memoryWorkspace, ['--json']));
    await readFile(path.join(memoryWorkspace, '.firewall', 'memory', 'invariants.json'), 'utf8')
      .then(() => { throw new Error('memory-lesson unexpectedly contains recorded memory'); })
      .catch((error) => { if (error.code !== 'ENOENT') throw error; });
    if (memoryExpected.memoryExists !== false) throw new Error('memory-lesson manifest must expect absent memory');
    if (memoryLesson.totalFilesChanged < memoryExpected.defaultFilesChangedMinimum) throw new Error('memory-lesson has no recordable diff');

    const freshExpected = fixtureManifest.scenarios['fresh-repository'].expected;
    const freshWorkspace = await seedScenario('fresh-repository');
    const fresh = JSON.parse(await runCli(freshWorkspace, ['--json']));
    if (fresh.totalFilesChanged < freshExpected.defaultFilesChangedMinimum || (freshExpected.hasHead === false && fresh.baseCommit)) throw new Error('fresh-repository does not exercise unborn HEAD behavior');

    const repeatWorkspace = await seedScenario('contract-drift');
    const { stdout: repeatHead } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repeatWorkspace });
    if (repeatHead.trim() !== baselineHead.trim()) throw new Error('two independent default seeds produced different Git history');
    const firstArtifact = JSON.parse(await readFile(path.join(workspace, 'node_modules/change-firewall/.playground-artifact.json'), 'utf8'));
    const repeatArtifact = JSON.parse(await readFile(path.join(repeatWorkspace, 'node_modules/change-firewall/.playground-artifact.json'), 'utf8'));
    if (!firstArtifact.digest || firstArtifact.digest !== repeatArtifact.digest) throw new Error('CLI artifact digest is missing or nondeterministic');

    console.log(JSON.stringify({
      ok: true,
      scenariosValidated: 6,
      filesChanged: report.totalFilesChanged,
      findings: report.behavioralChangesCount,
      risk: report.risk?.score,
      memoryContracts,
      cliVersion: directVersion,
      cliDigest: firstArtifact.digest,
    }, null, 2));
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`Fixture validation failed: ${error instanceof Error ? error.stack : String(error)}`);
  process.exitCode = 1;
});
