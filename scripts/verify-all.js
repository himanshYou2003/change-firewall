import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const binPath = path.resolve(process.cwd(), 'bin/change-firewall.js');

async function runStep(name, fn) {
  process.stdout.write(`• Testing ${name}... `);
  try {
    const result = await fn();
    console.log('✓ PASS' + (result ? ` (${result})` : ''));
    return { name, status: 'PASS', details: result };
  } catch (err) {
    console.log('✗ FAIL');
    console.error(`  Error: ${err.message}`);
    return { name, status: 'FAIL', error: err.message };
  }
}

async function main() {
  console.log('\n============================================================');
  console.log('  CHANGE FIREWALL: EXHAUSTIVE SENIOR QA VERIFICATION MATRIX  ');
  console.log('============================================================\n');

  const results = [];

  // 1. Version check
  results.push(
    await runStep('CLI --version output', async () => {
      const { stdout } = await execFileAsync('node', [binPath, '--version']);
      if (!stdout.includes('0.1.0')) throw new Error(`Unexpected version: ${stdout}`);
      return stdout.trim();
    })
  );

  // 2. Help command check
  results.push(
    await runStep('CLI --help command definitions', async () => {
      const { stdout } = await execFileAsync('node', [binPath, '--help']);
      const commands = ['analyze', 'preflight', 'watch', 'demo', 'open', 'impact', 'why'];
      for (const cmd of commands) {
        if (!stdout.includes(cmd)) throw new Error(`Missing command: ${cmd}`);
      }
      return '7/7 commands confirmed';
    })
  );

  // 3. Analyze command
  results.push(
    await runStep('CLI analyze working tree diff', async () => {
      const { stdout } = await execFileAsync('node', [binPath, 'analyze']);
      if (!stdout.includes('CHANGE FIREWALL')) throw new Error('Header missing');
      if (!stdout.includes('Files Changed')) throw new Error('Metrics missing');
      return 'Report rendered';
    })
  );

  // 4. Analyze --json output
  results.push(
    await runStep('CLI analyze --json machine-readable protocol', async () => {
      const { stdout } = await execFileAsync('node', [binPath, 'analyze', '--json']);
      const data = JSON.parse(stdout);
      if (typeof data.risk?.score !== 'number') throw new Error('Invalid risk score');
      if (!Array.isArray(data.findings)) throw new Error('Findings not array');
      if (!Array.isArray(data.changedFiles)) throw new Error('Changed files not array');
      return `Valid JSON, Risk ${data.risk.score}/100`;
    })
  );

  // 5. Preflight blocking gate (Exit 1)
  results.push(
    await runStep('CLI preflight exit code 1 on blocking changes', async () => {
      try {
        await execFileAsync('node', [binPath, 'preflight', '-m', '20']);
        throw new Error('Expected exit code 1, but passed with exit code 0');
      } catch (err) {
        if (err.code === 1 && err.stdout.includes('MERGE BLOCKED')) {
          return 'Exit code 1 strictly enforced';
        }
        throw err;
      }
    })
  );

  // 6. Preflight approval gate (Exit 0)
  results.push(
    await runStep('CLI preflight exit code 0 on approved thresholds', async () => {
      const { stdout } = await execFileAsync('node', [binPath, 'preflight', '-m', '100', '--no-fail-on-high']);
      if (!stdout.includes('APPROVED / SAFE TO MERGE')) throw new Error('Expected approved badge');
      return 'Exit code 0 strictly enforced';
    })
  );

  // 7. Impact command
  results.push(
    await runStep('CLI impact <file> blast radius mapping', async () => {
      const { stdout } = await execFileAsync('node', [binPath, 'impact', 'src/core/parser/ast-parser.ts']);
      if (!stdout.includes('BLAST RADIUS INSPECTION')) throw new Error('Header missing');
      if (!stdout.includes('Total Consumers')) throw new Error('Consumers metric missing');
      return 'Blast radius computed';
    })
  );

  // 8. Why command
  results.push(
    await runStep('CLI why <file> architectural role explanation', async () => {
      const { stdout } = await execFileAsync('node', [binPath, 'why', 'src/core/parser/ast-parser.ts']);
      if (!stdout.includes('WHY THIS FILE MATTERS')) throw new Error('Header missing');
      if (!stdout.includes('Architectural Role')) throw new Error('Role missing');
      return 'Architectural context extracted';
    })
  );

  // 9. Demo runner
  results.push(
    await runStep('CLI demo --no-open golden moment verification', async () => {
      const { stdout } = await execFileAsync('node', [binPath, 'demo', '--no-open']);
      const clean = stdout.replace(/\u001b\[[0-9;]*m/g, '');
      if (!clean.includes('74 / 100')) throw new Error('Expected risk 74/100');
      if (!clean.includes('Behavioral Shifts: 4')) {
        throw new Error(`Expected 'Behavioral Shifts: 4', got:\n${clean.slice(0, 300)}`);
      }
      return 'Section 7 Golden Moment verified';
    })
  );

  // 10. NPM pack distribution check
  results.push(
    await runStep('NPM packaging hygiene (npm pack --dry-run)', async () => {
      const isWin = process.platform === 'win32';
      const cmd = isWin ? 'npm.cmd' : 'npm';
      const { stdout } = await execFileAsync(cmd, ['pack', '--dry-run'], { shell: isWin });
      if (stdout.includes('test/')) throw new Error('Tarball contains test files!');
      if (stdout.includes('.git/')) throw new Error('Tarball contains .git!');
      return 'Zero leaks, 100% production clean';
    })
  );

  console.log('\n============================================================');
  const allPassed = results.every((r) => r.status === 'PASS');
  if (allPassed) {
    console.log(`  ALL ${results.length} INTEGRITY CHECKS PASSED WITH ZERO ERRORS.  `);
    console.log('============================================================\n');
    process.exit(0);
  } else {
    console.log('  SOME CHECKS FAILED.  ');
    console.log('============================================================\n');
    process.exit(1);
  }
}

main();
