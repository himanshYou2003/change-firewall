#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, open, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, '../..');
const cliEntry = path.join(repositoryRoot, 'bin', 'change-firewall.js');

function discoverCommands(rootHelp) {
  const commandsBlock = rootHelp.split(/^Commands:\s*$/m)[1];
  if (!commandsBlock) throw new Error('Unable to find the Commands section in root help');

  const discovered = [];
  for (const line of commandsBlock.split('\n')) {
    const match = line.match(/^  (\S[^\s]*)(?:\s+|$)/);
    if (!match) continue;
    const signature = match[1];
    const aliases = signature.split('|').map((entry) => entry.replace(/[<[].*$/, ''));
    const name = aliases[0];
    if (!name || name === 'help') continue;
    discovered.push({ name, aliases: aliases.slice(1) });
  }
  if (discovered.length === 0) throw new Error('Root help did not expose any commands');
  return discovered;
}

async function capture(args) {
  const outputPath = path.join(os.tmpdir(), `change-firewall-help-${process.pid}-${Date.now()}.txt`);
  const output = await open(outputPath, 'w');
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [cliEntry, ...args], {
        cwd: repositoryRoot,
        env: { ...process.env, NO_COLOR: '1' },
        stdio: ['ignore', output.fd, 'pipe'],
      });
      let stderr = '';
      child.stderr.on('data', (chunk) => { stderr += String(chunk); });
      child.on('error', reject);
      child.on('exit', (code) => code === 0
        ? resolve()
        : reject(new Error(`CLI help exited ${code}: ${stderr.slice(-2000)}`)));
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

async function main() {
  const outputArgument = process.argv.find((value) => value.startsWith('--output='));
  const output = path.resolve(
    outputArgument?.slice('--output='.length)
      ?? path.join(repositoryRoot, 'website', 'public', 'playground', 'command-manifest.json')
  );
  const rootHelp = await capture(['--help']);
  const version = (await capture(['--version'])).trim();
  const commands = discoverCommands(rootHelp);
  const entries = [];
  for (const command of commands) {
    entries.push({ ...command, help: await capture([command.name, '--help']) });
  }
  const manifest = {
    generatedAt: new Date().toISOString(),
    version,
    executable: 'npx change-firewall',
    rootHelp,
    commands: entries,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Captured Change Firewall ${version} command manifest at ${output}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
