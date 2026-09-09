import path from 'node:path';
import type {
  AnalysisReport,
  AnalyzeOptions,
  BehavioralFinding,
  BlastRadius,
  ASTDiff,
  BehavioralMutationReport,
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

// Genius Core Extensions
import {
  buildBehaviorGraph,
  classifyRole,
  findCriticalPathsTouchingFile,
  formatBehaviorGraphAscii,
} from './core/graph/behavior-graph.js';
import { computeBehavioralFingerprint } from './core/analyzer/fingerprint-engine.js';
import {
  loadFirewallMemory,
  evaluateBrokenInvariants,
  recordMemorySnapshot,
  resetMemory,
} from './core/memory/memory-engine.js';
import { generateSymbolicCrashTraces } from './core/symbolic/trace-engine.js';
import { auditAgentIntent } from './core/agent/intent-verifier.js';
import { generateRemediationPrompt } from './core/agent/remediation-generator.js';
import { startInteractiveInspector } from './core/interactive/terminal-inspector.js';

export * from './types/index.js';
export {
  startInteractiveInspector,
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
  // Genius Core Exports
  buildBehaviorGraph,
  classifyRole,
  findCriticalPathsTouchingFile,
  formatBehaviorGraphAscii,
  computeBehavioralFingerprint,
  loadFirewallMemory,
  evaluateBrokenInvariants,
  recordMemorySnapshot,
  resetMemory,
  generateSymbolicCrashTraces,
  auditAgentIntent,
  generateRemediationPrompt,
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
  const behaviorGraph = await buildBehaviorGraph(cwd, graph);

  const isAnyTestChanged = changedFiles.some(
    (f) =>
      graph.testFiles.has(f.path) ||
      f.path.includes('.test.') ||
      f.path.includes('.spec.')
  );

  const findings: BehavioralFinding[] = [];
  const blastRadiusMap: Record<string, BlastRadius> = {};
  const astDiffs: ASTDiff[] = [];

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
      astDiffs.push(astDiff);

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

  // 11-Dimensional Behavioral Fingerprint
  const fingerprint = computeBehavioralFingerprint(astDiffs, blastRadiusMap, isAnyTestChanged);

  // Persistent Firewall Memory & Invariants
  const memoryContext = await loadFirewallMemory(cwd);
  const brokenInvariants = evaluateBrokenInvariants(astDiffs, cwd, memoryContext.rawInvariants);
  memoryContext.brokenInvariants = brokenInvariants;

  // Symbolic Crash Traces
  const symbolicTraces = await generateSymbolicCrashTraces(astDiffs, blastRadiusMap, cwd);

  // Critical Paths across changed files
  const touchingCriticalPaths = changedFiles.flatMap((f) =>
    findCriticalPathsTouchingFile(f.path, behaviorGraph)
  );
  // Deduplicate
  const uniqueCriticalPaths = Array.from(new Set(touchingCriticalPaths.map((p) => p.id)))
    .map((id) => touchingCriticalPaths.find((p) => p.id === id)!);

  // Risk Score (Enhanced with Critical Paths and Broken Invariants)
  const risk = calculateRiskScore(findings, blastRadiusMap, isAnyTestChanged, {
    criticalPathsCount: uniqueCriticalPaths.length,
    brokenInvariantsCount: brokenInvariants.length,
  });

  // AI Agent Intent vs Reality Audit
  let agentAudit = undefined;
  if (options.intent) {
    agentAudit = auditAgentIntent(options.intent, findings, astDiffs);
  }

  // Record snapshot if requested
  if (options.recordMemory && baseCommit) {
    await recordMemorySnapshot(cwd, baseCommit, astDiffs);
  }

  const { detectSuspiciousChanges } = await import('./core/analyzer/suspicious-analyzer.js');
  const suspiciousChanges = detectSuspiciousChanges(findings, blastRadiusMap, changedFiles, isAnyTestChanged);

  const { getRecentTimeline } = await import('./core/git/history.js');
  const timeline = await getRecentTimeline(cwd);

  const recommendations = findings.map((f) => f.recommendation);
  if (brokenInvariants.length > 0) {
    recommendations.unshift(
      `Broken contract invariant: restore baseline contract for ${brokenInvariants[0].symbolOrFile} or update callers.`
    );
  }
  if (symbolicTraces.length > 0) {
    recommendations.unshift(
      `Runtime crash proven: ${symbolicTraces[0].simulatedException} in ${symbolicTraces[0].consumerFile}`
    );
  }
  if (findings.length === 0 && brokenInvariants.length === 0) {
    recommendations.push('Working tree is clean or changes have no breaking behavioral impact.');
  }

  // Calculate missing regression coverage count
  let missingRegressionCoverage = 0;
  for (const b of Object.values(blastRadiusMap)) {
    if (b.affectedRoutes.length > 0 && !isAnyTestChanged) {
      missingRegressionCoverage += b.affectedRoutes.length;
    }
  }

  let totalConsumersCount = 0;
  for (const b of Object.values(blastRadiusMap)) {
    totalConsumersCount = Math.max(totalConsumersCount, b.totalConsumers);
  }

  // Recommended Action
  let recommendedAction = 'SAFE TO MERGE: Changes are localized without downstream breaks.';
  if (risk.level === 'CRITICAL' || brokenInvariants.length > 0 || symbolicTraces.length > 0) {
    recommendedAction = 'REJECT: Block merge until consumer contracts and regression tests are updated.';
  } else if (risk.level === 'HIGH') {
    recommendedAction = 'MANUAL REVIEW: High risk boundary shift; audit caller compatibility and run integration tests.';
  } else if (risk.level === 'MEDIUM') {
    recommendedAction = 'PROCEED WITH CAUTION: Run downstream verification tests before staging deployment.';
  }

  const mutationDiagnosis: BehavioralMutationReport = {
    mutation: fingerprint.primaryMutation,
    confidence: fingerprint.confidenceScore,
    consumersAffected: totalConsumersCount,
    criticalPathsCount: uniqueCriticalPaths.length,
    historicalStability: memoryContext.historicalStability,
    missingRegressionCoverage,
    recommendedAction,
  };

  // AI Agent Remediation & PR Description Generator
  const remediation = generateRemediationPrompt(
    findings,
    symbolicTraces,
    blastRadiusMap,
    brokenInvariants
  );

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
    // Genius Core Additions
    behaviorGraph,
    fingerprint,
    symbolicTraces,
    memoryContext,
    agentAudit,
    mutationDiagnosis,
    remediation,
  };
}
