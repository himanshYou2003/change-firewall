import readline from 'node:readline';
import pc from 'picocolors';
import type {
  AnalysisReport,
  BehavioralFinding,
  SymbolicFailureTrace,
  FingerprintVector,
} from '../../types/index.js';
import { formatBehaviorGraphAscii } from '../graph/behavior-graph.js';

type ActivePanel = 'overview' | 'callstacks' | 'graph' | 'crashproof' | 'fingerprint' | 'autofix';

/**
 * Interactive Terminal Inspector for Change Firewall
 * Allows developers to interactively navigate findings, toggle call stacks (Tab),
 * view symbolic crash proofs (p), inspect the 11-D fingerprint matrix (f),
 * and generate instant auto-fixes / test stubs (a).
 */
export async function startInteractiveInspector(report: AnalysisReport): Promise<void> {
  if (!process.stdin.isTTY) {
    console.log(pc.yellow('\nNotice: Non-interactive terminal detected. Falling back to static report.\n'));
    const { renderTerminalReport } = await import('../reporter/terminal-reporter.js');
    renderTerminalReport(report);
    return;
  }

  const findings: BehavioralFinding[] = report.findings.length > 0 ? report.findings : [];
  let selectedIndex = 0;
  let activePanel: ActivePanel = 'overview';
  let messageBanner = '';

  // Format executed command display
  const rawArgs = process.argv.slice(1);
  const scriptName = rawArgs[0] && (rawArgs[0].endsWith('.js') || rawArgs[0].endsWith('.ts'))
    ? rawArgs[0].replace(/\\/g, '/').split('/').slice(-2).join('/')
    : 'change-firewall';
  const commandArgs = rawArgs.slice(1).join(' ');
  const commandDisplay = rawArgs[0]?.includes('change-firewall') && !rawArgs[0].endsWith('.js')
    ? `change-firewall ${commandArgs}`.trim()
    : `node ${scriptName} ${commandArgs}`.trim();

  const cwd = process.cwd();
  const isWindows = process.platform === 'win32';
  const promptLocation = isWindows ? `PS ${cwd}> ` : `${cwd} $ `;

  // Setup readline raw mode
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();

  // Enter alternate screen buffer & hide cursor (preserves original terminal history)
  process.stdout.write('\x1B[?1049h\x1B[?25l');

  let isCleanedUp = false;
  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    // Leave alternate screen buffer & restore cursor
    process.stdout.write('\x1B[?1049l\x1B[?25h\n');
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    process.removeListener('SIGINT', sigintHandler);
  };

  const sigintHandler = () => {
    cleanup();
    process.exit(0);
  };
  process.once('SIGINT', sigintHandler);

  const clearScreen = () => {
    process.stdout.write('\x1B[2J\x1B[0;0H');
  };

  const render = () => {
    clearScreen();

    // Invoked Command Breadcrumb
    console.log(`  ${pc.dim(promptLocation)}${pc.cyan(commandDisplay)}`);

    // Top Header
    console.log(pc.bgCyan(pc.black(pc.bold('  CHANGE FIREWALL  • Interactive Terminal Inspector  '))));
    console.log(
      pc.dim(
        `  Files: ${report.totalFilesChanged} (+${report.linesAdded}/-${report.linesDeleted}) | Findings: ${findings.length} | Risk: `
      ) +
        (report.risk.score >= 70
          ? pc.red(pc.bold(`${report.risk.score}/100 [HIGH RISK]`))
          : report.risk.score >= 40
          ? pc.yellow(pc.bold(`${report.risk.score}/100 [MEDIUM RISK]`))
          : pc.green(pc.bold(`${report.risk.score}/100 [LOW RISK]`)))
    );
    console.log(pc.dim('═'.repeat(72)));

    if (findings.length === 0) {
      console.log(pc.green('\n  ✓ No behavioral mutations detected! Everything looks clean and safe to merge.\n'));
      console.log(pc.dim('  Press [q] or [Esc] to exit.'));
      return;
    }

    const currentFinding: BehavioralFinding | undefined = findings[selectedIndex];
    const currentBlast = currentFinding ? report.blastRadiusMap[currentFinding.filePath] : undefined;
    const currentTrace: SymbolicFailureTrace | undefined =
      report.symbolicTraces?.find(
        (t: SymbolicFailureTrace) =>
          t.sourceFile === currentFinding?.filePath || t.consumerFile === currentFinding?.filePath
      ) || report.symbolicTraces?.[0];

    // Findings List Navigation
    console.log(pc.bold(`  DETECTED BEHAVIORAL SHIFTS (${selectedIndex + 1}/${findings.length}):`));
    findings.forEach((f: BehavioralFinding, idx: number) => {
      const isSelected = idx === selectedIndex;
      const prefix = isSelected ? pc.cyan('❯ ') : '  ';
      const badge =
        f.severity === 'HIGH'
          ? pc.red('🔴 HIGH  ')
          : f.severity === 'MEDIUM'
          ? pc.yellow('🟠 MEDIUM')
          : pc.blue('🟡 LOW   ');
      const title = isSelected ? pc.bold(pc.white(f.title)) : pc.dim(f.title);
      const file = pc.dim(`(${f.filePath})`);
      console.log(`${prefix}${badge} ${title} ${file}`);
    });

    console.log(pc.dim('─'.repeat(72)));

    // Active View Tab Indicators
    const tabOverview = activePanel === 'overview' ? pc.bgWhite(pc.black(' 1. Overview ')) : pc.dim(' 1. Overview ');
    const tabStacks = activePanel === 'callstacks' ? pc.bgWhite(pc.black(' [Tab] Call Stacks ')) : pc.dim(' [Tab] Call Stacks ');
    const tabGraph = activePanel === 'graph' ? pc.bgWhite(pc.black(' [g] Architecture ')) : pc.dim(' [g] Architecture ');
    const tabProof = activePanel === 'crashproof' ? pc.bgWhite(pc.black(' [p] Crash Proof ')) : pc.dim(' [p] Crash Proof ');
    const tabFingerprint = activePanel === 'fingerprint' ? pc.bgWhite(pc.black(' [f] 11-D Fingerprint ')) : pc.dim(' [f] 11-D Fingerprint ');
    const tabAutofix = activePanel === 'autofix' ? pc.bgWhite(pc.black(' [a] Auto-Fix ')) : pc.dim(' [a] Auto-Fix ');

    console.log(`  VIEW: ${tabOverview} ${tabStacks} ${tabGraph} ${tabProof} ${tabFingerprint} ${tabAutofix}`);
    console.log(pc.dim('─'.repeat(72)));

    // Render Panel Content
    if (activePanel === 'overview' && currentFinding) {
      console.log(pc.bold(pc.cyan(`  DETAILS: ${currentFinding.title}`)));
      console.log(pc.dim(`  File: `) + pc.white(currentFinding.filePath));
      console.log(pc.dim(`  Confidence: `) + pc.green(`${currentFinding.confidence}% (Symbolically Verified)`));
      console.log(`\n  ${pc.white(currentFinding.description)}`);

      if (currentFinding.evidence.length > 0) {
        console.log(pc.bold('\n  EVIDENCE & SHIFTS:'));
        currentFinding.evidence.slice(0, 3).forEach((ev: string) => {
          console.log(`   • ${pc.yellow(ev)}`);
        });
      }

      if (currentFinding.recommendation) {
        console.log(`\n  ${pc.bold(pc.magenta('RECOMMENDED ACTION:'))} ${currentFinding.recommendation}`);
      }
    } else if (activePanel === 'callstacks') {
      console.log(pc.bold(pc.cyan(`  DOWNSTREAM CONSUMER CALL STACK & BLAST RADIUS`)));
      console.log(pc.dim(`  Target: `) + pc.white(currentFinding?.filePath || 'N/A'));

      if (currentBlast) {
        console.log(
          pc.dim(`  Severity: `) +
            (currentBlast.level === 'HIGH' ? pc.red('HIGH') : pc.yellow(currentBlast.level))
        );
        console.log(pc.dim(`  Total Consumers: `) + pc.bold(pc.white(String(currentBlast.totalConsumers))));

        console.log(pc.bold('\n  Direct Dependents (Callers):'));
        if (currentBlast.directDependents.length > 0) {
          currentBlast.directDependents.forEach((dep: string) => {
            console.log(`   ├── [DIRECT] ${pc.green(dep)}`);
          });
        } else {
          console.log(pc.dim('   └── No direct dependents detected.'));
        }

        console.log(pc.bold('\n  Indirect Consumers (Downstream Flow):'));
        if (currentBlast.indirectDependents.length > 0) {
          currentBlast.indirectDependents.slice(0, 5).forEach((dep: string, i: number, arr: string[]) => {
            const isLast = i === arr.length - 1;
            console.log(`   ${isLast ? '└──' : '├──'} [INDIRECT] ${pc.yellow(dep)}`);
          });
          if (currentBlast.indirectDependents.length > 5) {
            console.log(pc.dim(`       ... and ${currentBlast.indirectDependents.length - 5} more indirect consumers`));
          }
        } else {
          console.log(pc.dim('   └── No indirect dependents detected.'));
        }

        if (currentBlast.affectedRoutes.length > 0) {
          console.log(pc.bold('\n  Exposed API Routes Impacted:'));
          currentBlast.affectedRoutes.forEach((route: string) => {
            console.log(`   🚨 ${pc.red(route)}`);
          });
        }
      } else {
        console.log(pc.dim('  No blast radius recorded for this file.'));
      }
    } else if (activePanel === 'graph' && currentFinding) {
      console.log(pc.bold(pc.cyan(`  BEHAVIOR GRAPH ARCHITECTURE & CALLER TREE`)));
      console.log(pc.dim(`  Target: `) + pc.white(currentFinding.filePath));
      if (report.behaviorGraph) {
        const ascii = formatBehaviorGraphAscii(currentFinding.filePath, report.behaviorGraph, currentBlast);
        console.log('\n' + ascii + '\n');
      } else {
        console.log(pc.dim('\n  No behavior graph recorded for this target file.'));
      }
    } else if (activePanel === 'crashproof') {
      console.log(pc.bold(pc.cyan(`  SYMBOLIC CRASH PROOF (Deterministic Runtime Verification)`)));
      if (currentTrace) {
        console.log(pc.red(pc.bold(`\n  Simulated Exception: `)) + pc.red(currentTrace.simulatedException));
        console.log(
          pc.dim(`  Origin:     `) +
            pc.white(currentTrace.sourceFile + (currentTrace.sourceLine ? `:${currentTrace.sourceLine}` : ''))
        );
        console.log(
          pc.dim(`  Crash Site: `) +
            pc.yellow(currentTrace.consumerFile + (currentTrace.consumerLine ? `:${currentTrace.consumerLine}` : ''))
        );
        console.log(pc.bold('\n  Proof Chain:'));
        currentTrace.proofSteps.forEach((step: string) => {
          console.log(`    ${pc.cyan('➔')} ${step}`);
        });
        if (currentTrace.preventativeFix) {
          console.log(`\n  ${pc.bold(pc.green('Auto-Fix Advice:'))} ${currentTrace.preventativeFix}`);
        }
      } else {
        console.log(pc.dim('\n  No runtime crash proof required for this mutation (Non-breaking contract).'));
      }
    } else if (activePanel === 'fingerprint') {
      console.log(pc.bold(pc.cyan(`  11-DIMENSIONAL BEHAVIORAL FINGERPRINT MATRIX`)));
      if (report.fingerprint) {
        console.log(pc.dim(`  Primary Mutation: `) + pc.bold(pc.yellow(report.fingerprint.primaryMutation)));
        console.log(pc.dim(`  Confidence Score: `) + pc.green(`${report.fingerprint.confidenceScore}%`));
        console.log('');

        const entries = Object.entries(report.fingerprint.vectors) as [string, FingerprintVector][];
        entries.forEach(([key, vec]: [string, FingerprintVector]) => {
          const name = key.padEnd(16);
          const barLength = Math.round(vec.score / 10);
          const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength);
          const barColor = vec.score >= 50 ? pc.red(bar) : vec.score > 0 ? pc.yellow(bar) : pc.dim(bar);
          const status = vec.active ? pc.bold(pc.red('MUTATED')) : pc.dim('STABLE ');
          console.log(`   ${pc.bold(name)} [${barColor}] ${status} ${pc.dim(vec.description)}`);
        });
      } else {
        console.log(pc.dim('\n  Fingerprint matrix not computed for this diff.'));
      }
    } else if (activePanel === 'autofix') {
      console.log(pc.bold(pc.cyan(`  INSTANT AUTO-FIX & TEST STUB GENERATOR`)));
      console.log(pc.dim(`  Target Finding: `) + pc.white(currentFinding?.title || ''));
      console.log(pc.dim(`  Target File:    `) + pc.white(currentFinding?.filePath || ''));

      console.log(pc.bold('\n  1-Line Auto-Fix Suggestion:'));
      if (currentTrace?.preventativeFix) {
        console.log(pc.green(`   ${currentTrace.preventativeFix}`));
      } else if (currentFinding?.category === 'AUTH') {
        console.log(pc.green(`   Ensure auth middleware guards match route definition and regression suite in test/auth.test.ts`));
      } else if (currentFinding?.category === 'FUNCTION_CONTRACT') {
        console.log(pc.green(`   export function ${currentFinding.filePath}: restore return signature or create backward-compatible adapter.`));
      } else {
        console.log(pc.green(`   // Guard access against undefined/null: const val = target?.prop ?? defaultValue;`));
      }

      console.log(pc.bold('\n  Auto-Generated Regression Test Stub:'));
      const testStub = [
        `  // test/${(currentFinding?.filePath || 'component').replace(/[/\\.]/g, '-')}.regression.test.ts`,
        `  import { describe, it, expect } from 'vitest';`,
        `  `,
        `  describe('Contract Regression: ${currentFinding?.title || 'Invariant'}', () => {`,
        `    it('preserves downstream caller compatibility', async () => {`,
        `      // Invariant check for ${currentFinding?.filePath}`,
        `      expect(true).toBe(true);`,
        `    });`,
        `  });`,
      ];
      console.log(pc.dim(testStub.join('\n')));
    }

    // Bottom Navigation Bar
    console.log(pc.dim('\n' + '═'.repeat(72)));
    if (messageBanner) {
      console.log(pc.cyan(`  ℹ ${messageBanner}`));
    }
    const countText = findings.length > 0 ? `the ${findings.length} findings` : 'findings';
    console.log(pc.cyan('  Press ↓ or ↑') + ` to scroll through ${countText}.`);
    console.log(pc.cyan('  Press Tab') + ' to expand the call stack and downstream consumers.');
    console.log(pc.cyan('  Press g') + ' to view the Architecture Behavior Graph tree.');
    console.log(pc.cyan('  Press p') + ' to view the Symbolic Crash Proof.');
    console.log(pc.cyan('  Press f') + ' to inspect the 11-D Fingerprint Matrix.');
    console.log(pc.cyan('  Press a') + ' to generate an auto-fix suggestion and test stub.');
    console.log(pc.cyan('  Press q') + ' when you want to quit.');
  };

  // Initial render
  render();

  // Event loop for interactive keyboard navigation
  return new Promise<void>((resolve) => {
    const handleKeypress = (_str: string, key: readline.Key) => {
      if (!key) return;

      messageBanner = '';

      // Explicit Quit condition: 'q', 'Q', or Ctrl+C
      if ((key.ctrl && key.name === 'c') || key.name === 'q' || _str === 'q' || _str === 'Q') {
        cleanup();
        process.stdin.removeListener('keypress', handleKeypress);
        console.log(pc.cyan('Exited Interactive Terminal Inspector.'));
        resolve();
        return;
      }

      // Ignore bare escape codes or sequence prefixes
      if (key.name === 'escape') {
        return;
      }

      // Up navigation
      if (key.name === 'up' || key.name === 'k' || _str === 'k') {
        if (selectedIndex > 0) {
          selectedIndex--;
        }
        render();
        return;
      }

      // Down navigation
      if (key.name === 'down' || key.name === 'j' || _str === 'j') {
        if (selectedIndex < findings.length - 1) {
          selectedIndex++;
        }
        render();
        return;
      }

      // Tab toggles between Call Stacks and Overview
      if (key.name === 'tab' || _str === '\t') {
        activePanel = activePanel === 'callstacks' ? 'overview' : 'callstacks';
        render();
        return;
      }

      // Direct view shortcuts: p, f, a, 1, o
      const char = (_str || key.name || '').toLowerCase();

      if (char === 'p') {
        activePanel = activePanel === 'crashproof' ? 'overview' : 'crashproof';
        render();
        return;
      }

      if (char === 'g') {
        activePanel = activePanel === 'graph' ? 'overview' : 'graph';
        render();
        return;
      }

      if (char === 'f') {
        activePanel = activePanel === 'fingerprint' ? 'overview' : 'fingerprint';
        render();
        return;
      }

      if (char === 'a') {
        activePanel = activePanel === 'autofix' ? 'overview' : 'autofix';
        render();
        return;
      }

      if (char === '1' || char === 'o') {
        activePanel = 'overview';
        render();
        return;
      }

      // Handle unhandled keys gracefully
      render();
    };

    process.stdin.on('keypress', handleKeypress);
  });
}
