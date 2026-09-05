import pc from 'picocolors';
import type { AnalysisReport, BehavioralFinding } from '../../types/index.js';

export interface PreflightOptions {
  maxRisk?: number;
  failOnHigh?: boolean;
}

export interface PreflightResult {
  readyToMerge: boolean;
  score: number;
  maxRiskThreshold: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  missingTestsCount: number;
  blockers: string[];
  recommendations: string[];
  report: AnalysisReport;
}

export function evaluatePreflight(
  report: AnalysisReport,
  options: PreflightOptions = {}
): PreflightResult {
  const maxRiskThreshold = options.maxRisk ?? 60;
  const failOnHigh = options.failOnHigh ?? true;

  const highRiskFindings = report.findings.filter(
    (f) => f.severity === 'HIGH' || f.severity === 'CRITICAL'
  );
  const mediumRiskFindings = report.findings.filter((f) => f.severity === 'MEDIUM');
  const lowRiskFindings = report.findings.filter((f) => f.severity === 'LOW');

  const missingTestFactors = report.risk.factors.filter((f) =>
    f.factor.toLowerCase().includes('test')
  );

  const blockers: string[] = [];

  // Check risk score threshold
  if (report.risk.score > maxRiskThreshold) {
    blockers.push(
      `Overall risk score (${report.risk.score}/100) exceeds maximum acceptable threshold (${maxRiskThreshold}/100).`
    );
  }

  // Check high severity findings
  if (failOnHigh && highRiskFindings.length > 0) {
    for (const f of highRiskFindings) {
      blockers.push(`[${f.category}] ${f.title} in ${f.filePath}`);
    }
  }

  const readyToMerge = blockers.length === 0;

  const recommendations = Array.from(
    new Set(report.findings.map((f) => f.recommendation))
  );

  if (missingTestFactors.length > 0) {
    recommendations.unshift('Add regression tests covering the modified behavioral logic before merging.');
  }

  return {
    readyToMerge,
    score: report.risk.score,
    maxRiskThreshold,
    highRiskCount: highRiskFindings.length,
    mediumRiskCount: mediumRiskFindings.length,
    lowRiskCount: lowRiskFindings.length,
    missingTestsCount: missingTestFactors.length,
    blockers,
    recommendations,
    report,
  };
}

export function renderPreflightTerminal(result: PreflightResult): void {
  const sep = pc.dim('─'.repeat(58));
  const doubleSep = pc.cyan('═'.repeat(58));

  console.log('\n' + doubleSep);
  console.log(pc.bold('  CHANGE FIREWALL PREFLIGHT') + pc.dim(' • Merge Readiness Gate'));
  console.log(doubleSep);

  console.log(`\n  ${pc.bold('READY TO MERGE?')}`);

  if (result.readyToMerge) {
    console.log(`  ${pc.bgGreen(pc.black(pc.bold('  APPROVED / SAFE TO MERGE  ')))}`);
    console.log(`  ${pc.dim('Score:')} ${pc.green(pc.bold(`${result.score} / 100`))} ${pc.dim(`(Threshold: ${result.maxRiskThreshold})`)}`);
  } else {
    console.log(`  ${pc.bgRed(pc.white(pc.bold('  MERGE BLOCKED / REVIEW REQUIRED  ')))}`);
    console.log(`  ${pc.dim('Score:')} ${pc.red(pc.bold(`${result.score} / 100`))} ${pc.dim(`(Threshold: ${result.maxRiskThreshold})`)}`);
  }

  console.log('\n  ' + pc.bold('BEHAVIORAL RISK BREAKDOWN:'));

  if (result.highRiskCount > 0) {
    console.log(`  ${pc.red('🔴')} ${pc.bold(result.highRiskCount)} high-risk behavioral change(s)`);
  }
  if (result.mediumRiskCount > 0) {
    console.log(`  ${pc.yellow('🟠')} ${pc.bold(result.mediumRiskCount)} medium-risk change(s)`);
  }
  if (result.missingTestsCount > 0) {
    console.log(`  ${pc.yellow('🟡')} ${pc.bold(result.missingTestsCount)} missing regression test notice(s)`);
  }
  if (result.lowRiskCount > 0) {
    console.log(`  ${pc.green('🟢')} ${pc.bold(result.lowRiskCount)} low-risk change(s)`);
  }
  if (result.highRiskCount === 0 && result.mediumRiskCount === 0 && result.missingTestsCount === 0) {
    console.log(pc.green('  ✓ Clean diff: No high or medium risk changes detected.'));
  }

  if (result.blockers.length > 0) {
    console.log('\n  ' + pc.bold('BLOCKING REASONS:'));
    for (const b of result.blockers) {
      console.log(`  ${pc.red('✕')} ${b}`);
    }
  }

  if (result.recommendations.length > 0) {
    console.log('\n  ' + pc.bold('ACTIONABLE RECOMMENDATIONS:'));
    for (const r of result.recommendations) {
      console.log(`  ${pc.cyan('→')} ${r}`);
    }
  }

  console.log('\n' + doubleSep + '\n');
}
