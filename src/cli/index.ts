import { Command } from 'commander';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import {
  analyzeChanges,
  buildDependencyGraph,
  computeBlastRadius,
  renderTerminalReport,
  renderJsonReport,
  startDashboardServer,
  startInteractiveInspector,
} from '../index.js';

const program = new Command();

program
  .name('change-firewall')
  .description('Converts code diffs into behavior-aware change reports and deterministic risk scoring')
  .version('0.2.2');

// Default / analyze command
program
  .command('analyze', { isDefault: true })
  .description('Analyze the current Git working tree for behavioral changes and risk')
  .option('--json', 'Output results in JSON format for CI and AI agents')
  .option('--interactive', 'Launch keyboard-driven interactive terminal inspector (Tab: call stacks, p: crash proof, f: fingerprint, a: auto-fix)')
  .option('--inspect', 'Alias for --interactive')
  .option('--open', 'Start and open local web dashboard at localhost:4783')
  .option('-p, --port <number>', 'Port for the local dashboard', '4783')
  .option('-b, --base <ref>', 'Base git commit or branch to compare against (default: HEAD)')
  .option('-s, --staged', 'Only analyze staged changes')
  .option('-i, --intent <text>', 'Audit AI agent stated intent vs actual code mutations')
  .option('--record-memory', 'Record verified baseline snapshot into persistent memory (.firewall/memory)')
  .action(async (options) => {
    try {
      const port = parseInt(options.port, 10) || 4783;
      const report = await analyzeChanges({
        cwd: process.cwd(),
        base: options.base,
        staged: options.staged,
        intent: options.intent,
        recordMemory: Boolean(options.recordMemory),
      });

      if (options.json) {
        console.log(renderJsonReport(report));
        return;
      }

      if (options.interactive || options.inspect) {
        await startInteractiveInspector(report);
        return;
      }

      let dashboardUrl: string | undefined;

      if (options.open) {
        const server = await startDashboardServer(report, port, true);
        dashboardUrl = server.url;
        renderTerminalReport(report, dashboardUrl);
        console.log(pc.cyan(`\nDashboard running at ${dashboardUrl}. Press Ctrl+C to stop.\n`));
        // Keep process open for dashboard
        await new Promise(() => {});
      } else {
        renderTerminalReport(report);
      }
    } catch (err: any) {
      console.error(pc.red(`\nError during analysis: ${err.message}\n`));
      process.exit(1);
    }
  });

// Dedicated Interactive Inspector command
program
  .command('interactive')
  .alias('inspect')
  .description('Launch keyboard-driven interactive terminal inspector (Tab: call stacks, p: crash proof, f: fingerprint, a: auto-fix)')
  .option('-b, --base <ref>', 'Base git commit or branch to compare against (default: HEAD)')
  .option('-s, --staged', 'Only inspect staged changes')
  .action(async (options) => {
    try {
      const report = await analyzeChanges({
        cwd: process.cwd(),
        base: options.base,
        staged: options.staged,
      });
      await startInteractiveInspector(report);
    } catch (err: any) {
      console.error(pc.red(`\nError starting interactive inspector: ${err.message}\n`));
      process.exit(1);
    }
  });

// Preflight / CI/CD merge-readiness gate
program
  .command('preflight')
  .alias('gate')
  .description('Determine whether the current changes are safe to merge (exit 0 for safe, exit 1 for blocked)')
  .option('-m, --max-risk <number>', 'Maximum acceptable risk score before blocking merge', '60')
  .option('-t, --threshold <number>', 'Alias for --max-risk (threshold score)')
  .option('--no-fail-on-high', 'Do not automatically fail on high severity behavioral findings')
  .option('--json', 'Output preflight evaluation result as JSON')
  .option('-b, --base <ref>', 'Base git commit or branch to compare against (default: HEAD)')
  .option('-s, --staged', 'Only evaluate staged changes')
  .action(async (options) => {
    try {
      const maxRisk = parseInt(options.threshold || options.maxRisk, 10) || 60;
      const failOnHigh = options.failOnHigh !== false;

      const report = await analyzeChanges({
        cwd: process.cwd(),
        base: options.base,
        staged: options.staged,
      });

      const { evaluatePreflight, renderPreflightTerminal } = await import('../index.js');
      const result = evaluatePreflight(report, { maxRisk, failOnHigh });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        renderPreflightTerminal(result);
      }

      if (!result.readyToMerge) {
        process.exit(1);
      }
    } catch (err: any) {
      console.error(pc.red(`\nPreflight check failed: ${err.message}\n`));
      process.exit(1);
    }
  });

// Open dashboard command
program
  .command('open')
  .description('Start and open the local dashboard with current working tree analysis')
  .option('-p, --port <number>', 'Port for the local dashboard', '4783')
  .action(async (options) => {
    try {
      const port = parseInt(options.port, 10) || 4783;
      console.log(pc.cyan('Analyzing project and starting local dashboard...'));
      const report = await analyzeChanges({ cwd: process.cwd() });
      const server = await startDashboardServer(report, port, true);
      renderTerminalReport(report, server.url);
      console.log(pc.cyan(`\nDashboard running at ${server.url}. Press Ctrl+C to stop.\n`));
      await new Promise(() => {});
    } catch (err: any) {
      console.error(pc.red(`\nFailed to start dashboard: ${err.message}\n`));
      process.exit(1);
    }
  });

// Impact command
program
  .command('impact <file>')
  .description('Inspect the blast radius and downstream dependents of a specific file')
  .action(async (fileTarget: string) => {
    try {
      const cwd = process.cwd();
      const resolved = path.resolve(cwd, fileTarget);
      const normalized = path.relative(cwd, resolved).replace(/\\/g, '/');
      const fileExists = fs.existsSync(resolved) || fs.existsSync(resolved + '.ts') || fs.existsSync(resolved + '.js');

      const graph = await buildDependencyGraph(cwd);

      if (!fileExists && !graph.allFiles.includes(normalized)) {
        console.log(pc.yellow(`\n⚠️  Notice: File "${fileTarget}" does not exist in the current project repository.`));
      }

      const blast = computeBlastRadius(normalized, graph);

      console.log('\n' + pc.cyan('═'.repeat(54)));
      console.log(pc.bold(`  BLAST RADIUS INSPECTION: ${pc.yellow(normalized)}`));
      console.log(pc.cyan('═'.repeat(54)));

      console.log(`  ${pc.bold('Blast Severity:')}     ${blast.level}`);
      console.log(`  ${pc.bold('Total Consumers:')}    ${blast.totalConsumers}`);
      console.log(`  ${pc.bold('Direct Dependents:')}  ${blast.directDependents.length}`);
      for (const d of blast.directDependents) {
        console.log(`    ${pc.green('•')} ${d}`);
      }

      console.log(`  ${pc.bold('Indirect Dependents:')} ${blast.indirectDependents.length}`);
      for (const ind of blast.indirectDependents.slice(0, 5)) {
        console.log(`    ${pc.dim('•')} ${ind}`);
      }
      if (blast.indirectDependents.length > 5) {
        console.log(`    ${pc.dim(`... and ${blast.indirectDependents.length - 5} more`)}`);
      }

      if (blast.affectedRoutes.length > 0) {
        console.log(`  ${pc.bold('Affected Routes:')}    ${blast.affectedRoutes.length}`);
        for (const r of blast.affectedRoutes) {
          console.log(`    ${pc.red('→')} ${r}`);
        }
      }

      console.log(pc.cyan('═'.repeat(54)) + '\n');
    } catch (err: any) {
      console.error(pc.red(`\nError inspecting impact: ${err.message}\n`));
      process.exit(1);
    }
  });

// Watch mode command
program
  .command('watch')
  .description('Live watch mode: automatically re-analyzes on AI changes and updates local dashboard via SSE')
  .option('-p, --port <number>', 'Port for the local dashboard', '4783')
  .option('--no-open', 'Do not automatically open browser on startup')
  .action(async (options) => {
    try {
      const port = parseInt(options.port, 10) || 4783;
      const { startWatchMode } = await import('../index.js');
      const handle = await startWatchMode({
        cwd: process.cwd(),
        port,
        open: options.open !== false,
      });

      process.on('SIGINT', async () => {
        console.log(pc.yellow('\nStopping watch mode...'));
        await handle.stop();
        process.exit(0);
      });
    } catch (err: any) {
      console.error(pc.red(`\nWatch mode failed: ${err.message}\n`));
      process.exit(1);
    }
  });

// Why command
program
  .command('why <file>')
  .description('Explain why a file matters to the architecture, its role, history, and dependents')
  .action(async (fileTarget: string) => {
    try {
      const cwd = process.cwd();
      const graph = await buildDependencyGraph(cwd);
      const normalized = path.relative(cwd, path.resolve(cwd, fileTarget)).replace(/\\/g, '/');
      const blast = computeBlastRadius(normalized, graph);
      const { getFileHistory } = await import('../index.js');
      const history = await getFileHistory(normalized, cwd);

      let role = 'General Utility / Component';
      if (graph.middlewareFiles.has(normalized)) role = 'Authentication / Security Middleware';
      else if (graph.routeFiles.has(normalized)) role = 'Public / Protected API Route';
      else if (graph.serviceFiles.has(normalized)) role = 'Business Logic Service Layer';
      else if (graph.modelFiles.has(normalized)) role = 'Database Model / Data Layer';
      else if (graph.testFiles.has(normalized)) role = 'Automated Test Suite';

      console.log('\n' + pc.cyan('═'.repeat(58)));
      console.log(pc.bold(`  WHY THIS FILE MATTERS: ${pc.yellow(normalized)}`));
      console.log(pc.cyan('═'.repeat(58)));
      console.log(`  ${pc.bold('Architectural Role:')} ${pc.magenta(role)}`);
      console.log(`  ${pc.bold('Dependents:')}         ${blast.totalConsumers} consumer(s)`);
      console.log(`  ${pc.bold('Blast Radius:')}       ${blast.level}`);
      if (blast.affectedRoutes.length > 0) {
        console.log(`  ${pc.bold('Route Impact:')}        Guards/serves ${blast.affectedRoutes.length} route(s)`);
      }

      if (history.totalCommits > 0) {
        console.log(`\n  ${pc.bold('Git Stability & History:')}`);
        console.log(`    ${pc.dim('•')} Total historical commits: ${pc.white(history.totalCommits)}${history.isHighChurn ? pc.red(' (High Churn File)') : ''}`);
        console.log(`    ${pc.dim('•')} Unique contributors:     ${pc.white(history.uniqueAuthors)}`);
        if (history.recentCommits.length > 0) {
          console.log(`    ${pc.dim('•')} Recent modifications:`);
          for (const c of history.recentCommits.slice(0, 3)) {
            console.log(`       ${pc.dim(c.hash)} ${pc.dim(c.date)} ${c.subject}`);
          }
        }
      }

      console.log(pc.cyan('═'.repeat(58)) + '\n');
    } catch (err: any) {
      console.error(pc.red(`\nError explaining file: ${err.message}\n`));
      process.exit(1);
    }
  });

// Demo command
program
  .command('demo')
  .description('Run an interactive simulated AI change scenario (Section 7 Golden Moment) with live dashboard')
  .option('-p, --port <number>', 'Port for the local dashboard', '4783')
  .option('--no-open', 'Do not automatically open browser on startup')
  .action(async (options) => {
    try {
      const port = parseInt(options.port, 10) || 4783;
      const { runDemoSimulation } = await import('../index.js');
      await runDemoSimulation({
        port,
        open: options.open !== false,
      });
    } catch (err: any) {
      console.error(pc.red(`\nDemo failed: ${err.message}\n`));
      process.exit(1);
    }
  });

// MCP server command
program
  .command('mcp')
  .description('Start Model Context Protocol (MCP) server over stdio for Claude Desktop, Antigravity, and Cursor')
  .action(async () => {
    try {
      const { startMcpServer } = await import('../index.js');
      await startMcpServer();
    } catch (err: any) {
      console.error(pc.red(`\nMCP Server failed to start: ${err.message}\n`));
      process.exit(1);
    }
  });

// Graph command
program
  .command('graph <file>')
  .description('Display the architectural Behavior Graph and critical paths for a specific file/symbol')
  .action(async (fileTarget: string) => {
    try {
      const cwd = process.cwd();
      const resolved = path.resolve(cwd, fileTarget);
      const normalized = path.relative(cwd, resolved).replace(/\\/g, '/');
      const fileExists = fs.existsSync(resolved) || fs.existsSync(resolved + '.ts') || fs.existsSync(resolved + '.js');

      const { buildDependencyGraph, buildBehaviorGraph, computeBlastRadius, formatBehaviorGraphAscii } = await import('../index.js');
      const depGraph = await buildDependencyGraph(cwd);

      if (!fileExists && !depGraph.allFiles.includes(normalized)) {
        console.log(pc.yellow(`\n⚠️  Notice: File "${fileTarget}" does not exist in the current project repository.`));
        console.log(pc.dim(`   Displaying zero-connection fallback graph for "${normalized}".`));
      }

      const behaviorGraph = await buildBehaviorGraph(cwd, depGraph);
      const blast = computeBlastRadius(normalized, depGraph);

      console.log('\n' + pc.cyan('═'.repeat(66)));
      console.log(pc.bold(`  BEHAVIOR GRAPH: ${pc.yellow(normalized)}`));
      console.log(pc.cyan('═'.repeat(66)) + '\n');

      const ascii = formatBehaviorGraphAscii(normalized, behaviorGraph, blast);
      console.log(ascii + '\n');
    } catch (err: any) {
      console.error(pc.red(`\nError rendering behavior graph: ${err.message}\n`));
      process.exit(1);
    }
  });

// Memory command
program
  .command('memory [action]')
  .description('Manage persistent contract memory (status, record, reset)')
  .action(async (action: string = 'status') => {
    try {
      const cwd = process.cwd();
      const { loadFirewallMemory, recordMemorySnapshot, resetMemory, analyzeChanges } = await import('../index.js');

      if (action === 'reset') {
        await resetMemory(cwd);
        console.log(pc.green('\n✓ Persistent Firewall Memory has been reset.\n'));
        return;
      }

      if (action === 'record') {
        await analyzeChanges({ cwd, recordMemory: true });
        const mem = await loadFirewallMemory(cwd);
        console.log(pc.green(`\n✓ Recorded baseline contract memory snapshot (${mem.invariantsCount} verified symbol contracts at commit ${pc.bold(mem.baselineCommit || 'HEAD')}).\n`));
        return;
      }

      // Default status
      const mem = await loadFirewallMemory(cwd);
      console.log('\n' + pc.cyan('═'.repeat(54)));
      console.log(pc.bold('  PERSISTENT FIREWALL MEMORY STATUS'));
      console.log(pc.cyan('═'.repeat(54)));
      console.log(`  ${pc.bold('Recorded Invariants:')} ${pc.white(mem.invariantsCount)} verified symbol/route contracts`);
      console.log(`  ${pc.bold('Baseline Commit:')}     ${pc.yellow(mem.baselineCommit || 'None recorded')}`);
      console.log(`  ${pc.bold('Stability Rating:')}    ${pc.green(mem.historicalStability)}`);
      if (mem.lastApprovalDate) {
        console.log(`  ${pc.bold('Last Verified:')}      ${pc.dim(mem.lastApprovalDate)}`);
      }
      console.log(pc.cyan('═'.repeat(54)) + '\n');
    } catch (err: any) {
      console.error(pc.red(`\nMemory command failed: ${err.message}\n`));
      process.exit(1);
    }
  });

// Audit-agent command
program
  .command('audit-agent')
  .description('Audit stated AI agent intent (commit message or prompt) against actual uncommitted diffs')
  .option('-i, --intent <text>', 'Stated intention or prompt given to the AI coding agent', 'General improvements')
  .option('--json', 'Output agent audit report as JSON')
  .action(async (options) => {
    try {
      const { analyzeChanges, renderTerminalReport, renderJsonReport } = await import('../index.js');
      const report = await analyzeChanges({
        cwd: process.cwd(),
        intent: options.intent,
      });

      if (options.json) {
        console.log(renderJsonReport(report));
      } else {
        renderTerminalReport(report);
      }

      if (report.agentAudit && (report.agentAudit.verdict === 'STEALTH_MUTATION' || report.agentAudit.verdict === 'HIGH_DRIFT')) {
        process.exit(1);
      }
    } catch (err: any) {
      console.error(pc.red(`\nAgent audit failed: ${err.message}\n`));
      process.exit(1);
    }
  });

// Normalize common user inputs like -inspect, -graph, etc. into valid subcommands
const normalizedArgv = process.argv.map((arg) => {
  if (arg === '-inspect' || arg === '--inspect') {
    return 'inspect';
  }
  if (arg === '-graph' || arg === '--graph') {
    return 'graph';
  }
  if (arg === '-impact' || arg === '--impact') {
    return 'impact';
  }
  if (arg === '-preflight' || arg === '--preflight' || arg === '-gate' || arg === '--gate') {
    return 'preflight';
  }
  return arg;
});

program.parse(normalizedArgv);
