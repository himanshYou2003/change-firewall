import pc from 'picocolors';
import type { AnalysisReport, BehavioralFinding, SeverityLevel } from '../../types/index.js';

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
  const separator = pc.dim('─'.repeat(64));
  const doubleSeparator = pc.cyan('═'.repeat(64));

  console.log('\n' + doubleSeparator);
  console.log(pc.bold(pc.cyan('  CHANGE FIREWALL  ')) + pc.dim('• Behavior-Aware Change Intelligence'));
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
  console.log(separator);

  // Findings
  if (report.findings.length === 0) {
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
