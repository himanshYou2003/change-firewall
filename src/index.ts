import path from 'node:path';
import type {
  AnalysisReport,
  AnalyzeOptions,
  BehavioralFinding,
  BlastRadius,
} from './types/index.js';
import {
  collectFileDiffs,
  getCurrentBranch,
  getHeadCommit,
} from './core/git/collector.js';
import {
  buildDependencyGraph,
  computeBlastRadius,
} from './core/graph/dependency-graph.js';
import { analyzeASTDiff } from './core/parser/ast-parser.js';
import { detectBehavioralChanges } from './core/analyzer/behavior-analyzer.js';
import { calculateRiskScore } from './core/risk/risk-engine.js';
import { startDashboardServer } from './dashboard/server.js';
import { renderTerminalReport } from './core/reporter/terminal-reporter.js';
import { renderJsonReport } from './core/reporter/json-reporter.js';
import {
  evaluatePreflight,
  renderPreflightTerminal,
  type PreflightOptions,
  type PreflightResult,
} from './core/preflight/preflight-checker.js';
import { startWatchMode, type WatchOptions, type WatchHandle } from './core/watcher/watch-engine.js';
import { getFileHistory, type FileHistoryInfo } from './core/git/history.js';
import { createMcpServer, startMcpServer, type McpServerOptions } from './mcp/index.js';

export * from './types/index.js';
export {
  collectFileDiffs,
  buildDependencyGraph,
  computeBlastRadius,
  analyzeASTDiff,
  detectBehavioralChanges,
  calculateRiskScore,
  startDashboardServer,
  renderTerminalReport,
  renderJsonReport,
  evaluatePreflight,
  renderPreflightTerminal,
  startWatchMode,
  getFileHistory,
  createMcpServer,
  startMcpServer,
  type PreflightOptions,
  type PreflightResult,
  type WatchOptions,
  type WatchHandle,
  type FileHistoryInfo,
  type McpServerOptions,
};
export { generateDemoReport, runDemoSimulation, type DemoOptions } from './core/demo/demo-runner.js';

export async function analyzeChanges(options: AnalyzeOptions = {}): Promise<AnalysisReport> {
  const cwd = path.resolve(options.cwd || process.cwd());

  const branch = await getCurrentBranch(cwd);
  const baseCommit = await getHeadCommit(cwd);

  const changedFiles = await collectFileDiffs({
    cwd,
    base: options.base,
    staged: options.staged,
  });

  const graph = await buildDependencyGraph(cwd);

  const isAnyTestChanged = changedFiles.some(
    (f) =>
      graph.testFiles.has(f.path) ||
      f.path.includes('.test.') ||
      f.path.includes('.spec.')
  );

  const findings: BehavioralFinding[] = [];
  const blastRadiusMap: Record<string, BlastRadius> = {};

  let totalAdded = 0;
  let totalDeleted = 0;

  for (const file of changedFiles) {
    totalAdded += file.linesAdded;
    totalDeleted += file.linesDeleted;

    const blast = computeBlastRadius(file.path, graph);
    blastRadiusMap[file.path] = blast;

    const ext = path.extname(file.path).toLowerCase();
    const isCodeFile = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext);

    if (isCodeFile && (file.beforeContent || file.afterContent)) {
      const astDiff = analyzeASTDiff(
        file.path,
        file.beforeContent,
        file.afterContent
      );

      const isRoute = graph.routeFiles.has(file.path);
      const isMiddleware = graph.middlewareFiles.has(file.path);

      const fileFindings = detectBehavioralChanges(
        astDiff,
        blast,
        isRoute,
        isMiddleware,
        isAnyTestChanged
      );

      findings.push(...fileFindings);
    }
  }

  const risk = calculateRiskScore(findings, blastRadiusMap, isAnyTestChanged);

  const { detectSuspiciousChanges } = await import('./core/analyzer/suspicious-analyzer.js');
  const suspiciousChanges = detectSuspiciousChanges(findings, blastRadiusMap, changedFiles, isAnyTestChanged);

  const { getRecentTimeline } = await import('./core/git/history.js');
  const timeline = await getRecentTimeline(cwd);

  const recommendations = findings.map((f) => f.recommendation);
  if (findings.length === 0) {
    recommendations.push('Working tree is clean or changes have no breaking behavioral impact.');
  }

  return {
    timestamp: new Date().toISOString(),
    projectPath: cwd,
    branch,
    baseCommit,
    totalFilesChanged: changedFiles.length,
    linesAdded: totalAdded,
    linesDeleted: totalDeleted,
    behavioralChangesCount: findings.length,
    risk,
    findings,
    suspiciousChanges,
    timeline,
    blastRadiusMap,
    changedFiles,
    recommendations,
  };
}
