import * as fs from 'node:fs';
import pc from 'picocolors';
import type { AnalysisReport } from '../../types/index.js';
import { analyzeChanges } from '../../index.js';
import { startDashboardServer, type DashboardServer } from '../../dashboard/server.js';

export interface WatchOptions {
  cwd?: string;
  port?: number;
  open?: boolean;
}

export interface WatchHandle {
  stop: () => Promise<void>;
}

const IGNORED_PARTS = ['.git', 'node_modules', 'dist', '.firewall', '.tmp', 'package-lock.json'];

export async function startWatchMode(options: WatchOptions = {}): Promise<WatchHandle> {
  const cwd = options.cwd || process.cwd();
  const port = options.port || 4783;
  const autoOpen = options.open !== false;

  console.log(pc.cyan('\nStarting Change Firewall Live Watch Mode...'));

  // Run initial analysis
  let previousReport = await analyzeChanges({ cwd });
  const dashboard = await startDashboardServer(previousReport, port, autoOpen);

  console.log(pc.bold(pc.green(`✓ Change Firewall watching for changes in: ${pc.white(cwd)}`)));
  console.log(pc.cyan(`✓ Live Dashboard active at: ${pc.underline(dashboard.url)}`));
  console.log(pc.dim('Press Ctrl+C to stop.\n'));

  let debounceTimer: NodeJS.Timeout | null = null;
  let isAnalyzing = false;
  let hasPendingChange = false;

  async function triggerReanalysis(changedFile: string) {
    if (isAnalyzing) {
      hasPendingChange = true;
      return;
    }

    isAnalyzing = true;
    try {
      const newReport = await analyzeChanges({ cwd });
      const timeStr = new Date().toLocaleTimeString();

      const riskChanged = newReport.risk.score !== previousReport.risk.score;
      const findingsDiff = newReport.behavioralChangesCount - previousReport.behavioralChangesCount;

      console.log(
        pc.dim(`[${timeStr}] `) +
          pc.bold('File change detected: ') +
          pc.cyan(changedFile) +
          pc.dim(` (${newReport.totalFilesChanged} files in diff)`)
      );

      if (riskChanged) {
        const arrow = newReport.risk.score > previousReport.risk.score ? pc.red('↑') : pc.green('↓');
        console.log(
          `  ${pc.bold('Risk score changed:')} ${previousReport.risk.score} → ${pc.bold(
            newReport.risk.score
          )} / 100 ${arrow}`
        );
      }

      if (newReport.findings.length > 0) {
        for (const f of newReport.findings) {
          const isNew = !previousReport.findings.some((pf) => pf.id === f.id || pf.title === f.title);
          if (isNew) {
            console.log(
              `  ${pc.yellow('+ New Behavioral Change:')} [${pc.bold(f.category)}] ${f.title} in ${pc.dim(f.filePath)}`
            );
          }
        }
      }

      // Update dashboard live via SSE
      dashboard.update(newReport);
      previousReport = newReport;
    } catch (err: any) {
      console.error(pc.red(`Error during watch analysis: ${err.message}`));
    } finally {
      isAnalyzing = false;
      if (hasPendingChange) {
        hasPendingChange = false;
        triggerReanalysis('pending changes');
      }
    }
  }

  // Recursive watcher using fs.watch
  const watcher = fs.watch(cwd, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const norm = filename.replace(/\\/g, '/');

    // Skip ignored directories
    if (IGNORED_PARTS.some((ignored) => norm.includes(ignored))) {
      return;
    }

    // Debounce triggers
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      triggerReanalysis(norm);
    }, 350);
  });

  return {
    stop: async () => {
      watcher.close();
      await dashboard.close();
    },
  };
}
