import pc from 'picocolors';
import type { AnalysisReport, BehavioralFinding, SeverityLevel } from '../../types/index.js';
import { formatBehaviorGraphAscii } from '../graph/behavior-graph.js';

function getSeverityBadge(severity: SeverityLevel): string {
  switch (severity) {
    case 'CRITICAL':
      return pc.bgRed(pc.white(pc.bold(' CRITICAL ')));
    case 'HIGH':
      return pc.red(pc.bold('🔴 HIGH'));
    case 'MEDIUM':
      return pc.yellow(pc.bold('🟠 MEDIUM'));
    case 'LOW':
    default:
      return pc.green(pc.bold('🟡 LOW'));
  }
}

function getRiskScoreDisplay(score: number, level: SeverityLevel): string {
  const scoreText = `${score} / 100`;
  switch (level) {
    case 'CRITICAL':
      return pc.bgRed(pc.white(pc.bold(` ${scoreText} [CRITICAL] `)));
    case 'HIGH':
      return pc.red(pc.bold(`${scoreText} [HIGH RISK]`));
    case 'MEDIUM':
      return pc.yellow(pc.bold(`${scoreText} [MEDIUM RISK]`));
    case 'LOW':
    default:
      return pc.green(pc.bold(`${scoreText} [LOW RISK]`));
  }
}

export function renderTerminalReport(report: AnalysisReport, dashboardUrl?: string): void {
  const separator = pc.dim('─'.repeat(66));
  const doubleSeparator = pc.cyan('═'.repeat(66));

  console.log('\n' + doubleSeparator);
  console.log(pc.bold(pc.cyan('  CHANGE FIREWALL  ')) + pc.dim('• Behavior-Aware Change Intelligence Engine'));
  console.log(doubleSeparator);

  // Summary Metrics
  console.log(
    `  ${pc.bold('Files Changed:')} ${pc.white(report.totalFilesChanged)} ` +
      pc.dim(`(+${report.linesAdded} / -${report.linesDeleted})`) +
      `  ${pc.bold('Behavioral Shifts:')} ${
        report.behavioralChangesCount > 0
          ? pc.yellow(pc.bold(report.behavioralChangesCount))
          : pc.green('0')
      }`
  );
  console.log(`  ${pc.bold('Overall Risk:')}  ${getRiskScoreDisplay(report.risk.score, report.risk.level)}`);

  // Operational Intelligence Diagnosis Card (The exact requested format)
  if (report.mutationDiagnosis) {
    const diag = report.mutationDiagnosis;
    const stabilityColor = diag.historicalStability === 'HIGH' ? pc.green : diag.historicalStability === 'MEDIUM' ? pc.yellow : pc.red;

    console.log(separator);
    console.log(pc.bold('  OPERATIONAL INTELLIGENCE DIAGNOSIS:'));
    console.log(`  ${pc.dim('├──')} ${pc.bold('Behavioral Mutation:')}     ${pc.magenta(pc.bold(diag.mutation))}`);
    console.log(`  ${pc.dim('├──')} ${pc.bold('Confidence:')}              ${pc.green(pc.bold(`${diag.confidence}%`))} ${pc.dim('(Symbolically Proven)')}`);
    console.log(`  ${pc.dim('├──')} ${pc.bold('Consumers Affected:')}      ${pc.yellow(diag.consumersAffected)} downstream caller(s)`);
    console.log(`  ${pc.dim('├──')} ${pc.bold('Critical Paths:')}          ${diag.criticalPathsCount > 0 ? pc.red(pc.bold(diag.criticalPathsCount)) : pc.green('0')} cross-boundary flow(s)`);
    console.log(`  ${pc.dim('├──')} ${pc.bold('Historical Stability:')}    ${stabilityColor(diag.historicalStability)}`);
    console.log(
      `  ${pc.dim('├──')} ${pc.bold('Regression Coverage:')}     ${
        diag.missingRegressionCoverage > 0
          ? pc.red(pc.bold(`❌ Missing (${diag.missingRegressionCoverage} uncovered routes)`))
          : pc.green('✓ Verified')
      }`
    );
    console.log(`  ${pc.dim('└──')} ${pc.bold('Recommended Action:')}     ${pc.cyan(pc.bold(diag.recommendedAction))}`);
  }

  // AI Agent Intent Audit (if present)
  if (report.agentAudit) {
    const audit = report.agentAudit;
    console.log(separator);
    console.log(pc.bold('  AI AGENT INTENT VS REALITY AUDIT:'));
    console.log(`  ${pc.dim('Intent:')}  "${pc.white(audit.intentText)}"`);

    let verdictBadge = pc.green('✓ ALIGNED');
    if (audit.verdict === 'STEALTH_MUTATION') verdictBadge = pc.bgRed(pc.white(pc.bold(' 🚨 STEALTH MUTATION ')));
    else if (audit.verdict === 'HIGH_DRIFT') verdictBadge = pc.red(pc.bold('⚠️ HIGH DRIFT'));
    else if (audit.verdict === 'MINOR_DRIFT') verdictBadge = pc.yellow('ℹ️ MINOR SCOPE DRIFT');

    console.log(`  ${pc.dim('Verdict:')} ${verdictBadge} ${pc.dim(`(Drift Score: ${audit.driftScore}%)`)}`);
    console.log(`  ${pc.dim('Detail:')}  ${audit.summary}`);

    if (audit.unannouncedMutations.length > 0) {
      console.log(`  ${pc.red(pc.bold('Unannounced Mutations:'))}`);
      for (const un of audit.unannouncedMutations) {
        console.log(`    ${pc.red('•')} ${un}`);
      }
    }
  }

  // Broken Contract Invariants (Persistent Memory)
  if (report.memoryContext?.brokenInvariants && report.memoryContext.brokenInvariants.length > 0) {
    console.log(separator);
    console.log(pc.red(pc.bold('  ⚠️ BROKEN CONTRACT INVARIANTS (Firewall Memory):')));
    for (const inv of report.memoryContext.brokenInvariants) {
      console.log(`  ${pc.red('✖')} ${pc.bold(inv.symbolOrFile)} ${pc.dim(`(${inv.historicalDuration})`)}`);
      console.log(`    ${pc.dim('Rule:')}     ${inv.rule}`);
      console.log(`    ${pc.dim('Mutation:')} ${pc.yellow(inv.mutation)}`);
    }
  }

  // Symbolic Runtime Crash Traces
  if (report.symbolicTraces && report.symbolicTraces.length > 0) {
    console.log(separator);
    console.log(pc.bgRed(pc.white(pc.bold('  SYMBOLIC CRASH PROOF (Zero Guesswork)  '))));
    for (const trace of report.symbolicTraces.slice(0, 3)) {
      console.log(`\n  ${pc.red(pc.bold('Simulated Exception:'))} ${pc.white(pc.bold(trace.simulatedException))}`);
      console.log(`  ${pc.dim('Origin:')}    ${pc.cyan(trace.sourceFile)}${trace.sourceSymbol ? ` (${trace.sourceSymbol})` : ''}`);
      console.log(`  ${pc.dim('Crash Site:')} ${pc.magenta(trace.consumerFile)}${trace.consumerLine ? `:${trace.consumerLine}` : ''}`);
      console.log(`  ${pc.dim('Proof Steps:')}`);
      for (const step of trace.proofSteps) {
        console.log(`    ${pc.yellow('➔')} ${step}`);
      }
      if (trace.preventativeFix) {
        console.log(`  ${pc.bold('Auto-Fix Advice:')} ${pc.green(trace.preventativeFix)}`);
      }
    }
  }

  // Visual Behavior Graph Tree (if changes touch boundaries)
  if (report.behaviorGraph && report.changedFiles.length > 0) {
    const primaryFile = report.changedFiles[0]?.path;
    if (primaryFile && report.behaviorGraph.nodes[primaryFile]) {
      console.log(separator);
      console.log(pc.bold('  BEHAVIOR GRAPH ARCHITECTURE:'));
      const asciiTree = formatBehaviorGraphAscii(primaryFile, report.behaviorGraph);
      console.log('  ' + asciiTree.split('\n').join('\n  '));
    }
  }

  console.log(separator);

  // Findings
  if (report.findings.length === 0 && (!report.symbolicTraces || report.symbolicTraces.length === 0)) {
    console.log(
      pc.green('\n  ✓ No breaking contract shifts or behavioral regressions detected.')
    );
    console.log(pc.dim('    Changes appear localized without downstream impact.\n'));
  } else {
    console.log(pc.bold('\n  BEHAVIORAL FINDINGS:'));

    for (const finding of report.findings) {
      console.log('\n  ' + getSeverityBadge(finding.severity) + '  ' + pc.bold(finding.title));
      console.log(`  ${pc.dim('File:')} ${pc.cyan(finding.filePath)}`);
      console.log(`  ${finding.description}`);

      console.log(pc.dim('  Evidence:'));
      for (const ev of finding.evidence) {
        console.log(`   ${pc.yellow('•')} ${ev}`);
      }

      if (finding.affectedFiles.length > 0) {
        console.log(
          `  ${pc.dim('Blast Radius:')} ${pc.magenta(finding.affectedFiles.length)} consumer(s) [${finding.affectedFiles.slice(0, 3).join(', ')}${
            finding.affectedFiles.length > 3 ? '...' : ''
          }]`
        );
      }

      console.log(`  ${pc.dim('Confidence:')} ${pc.green(finding.confidence + '%')}`);
      console.log(`  ${pc.bold('Action:')} ${pc.italic(finding.recommendation)}`);
      console.log('  ' + pc.dim('─'.repeat(50)));
    }
  }

  // Risk Factors Breakdown
  if (report.risk.factors.length > 0) {
    console.log(pc.bold('\n  RISK EVIDENCE FACTORS:'));
    for (const factor of report.risk.factors) {
      console.log(
        `   ${pc.red('+')} ${pc.white(factor.factor)} ${pc.dim(`(+${factor.scoreContribution})`)}: ${pc.dim(
          factor.reason
        )}`
      );
    }
  }

  // Dashboard Prompt
  if (dashboardUrl) {
    console.log('\n' + separator);
    console.log(`  ${pc.bold('Local Dashboard:')} ${pc.underline(pc.cyan(dashboardUrl))}`);
    console.log(pc.dim('  Open in browser to inspect interactive blast-radius dependency map.'));
  }

  console.log(doubleSeparator + '\n');
}
