import { Command } from 'commander';
import pc from 'picocolors';
import path from 'node:path';
import {
  analyzeChanges,
  buildDependencyGraph,
  computeBlastRadius,
  renderTerminalReport,
  renderJsonReport,
  startDashboardServer,
} from '../index.js';

const program = new Command();

program
  .name('change-firewall')
  .description('Converts code diffs into behavior-aware change reports and deterministic risk scoring')
  .version('0.1.0');

// Default / analyze command
program
  .command('analyze', { isDefault: true })
  .description('Analyze the current Git working tree for behavioral changes and risk')
  .option('--json', 'Output results in JSON format for CI and AI agents')
  .option('--open', 'Start and open local web dashboard at localhost:4783')
  .option('-p, --port <number>', 'Port for the local dashboard', '4783')
  .option('-b, --base <ref>', 'Base git commit or branch to compare against (default: HEAD)')
  .option('-s, --staged', 'Only analyze staged changes')
  .action(async (options) => {
    try {
      const port = parseInt(options.port, 10) || 4783;
      const report = await analyzeChanges({
        cwd: process.cwd(),
        base: options.base,
        staged: options.staged,
      });

      if (options.json) {
        console.log(renderJsonReport(report));
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

// Preflight merge-readiness command
program
  .command('preflight')
  .description('Determine whether the current changes are safe to merge (exit 0 for safe, exit 1 for blocked)')
  .option('-m, --max-risk <number>', 'Maximum acceptable risk score before blocking merge', '60')
  .option('--no-fail-on-high', 'Do not automatically fail on high severity behavioral findings')
  .option('--json', 'Output preflight evaluation result as JSON')
  .option('-b, --base <ref>', 'Base git commit or branch to compare against (default: HEAD)')
  .option('-s, --staged', 'Only evaluate staged changes')
  .action(async (options) => {
    try {
      const maxRisk = parseInt(options.maxRisk, 10) || 60;
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
      const graph = await buildDependencyGraph(cwd);
      const normalized = path.relative(cwd, path.resolve(cwd, fileTarget)).replace(/\\/g, '/');

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

program.parse(process.argv);
