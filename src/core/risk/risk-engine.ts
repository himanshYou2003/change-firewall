import type {
  BehavioralFinding,
  BlastRadius,
  RiskScore,
  RiskFactor,
  SeverityLevel,
} from '../../types/index.js';

export function calculateRiskScore(
  findings: BehavioralFinding[],
  blastRadiusMap: Record<string, BlastRadius>,
  isAnyTestChanged: boolean
): RiskScore {
  const factors: RiskFactor[] = [];
  let baseScore = 0;

  if (findings.length === 0) {
    return {
      score: 5,
      level: 'LOW',
      factors: [
        {
          factor: 'No Behavioral Shifts',
          scoreContribution: 5,
          reason: 'No breaking AST or security-relevant alterations detected in this change.',
        },
      ],
    };
  }

  // 1. Evaluate Findings Severity & Category
  const hasAuthFinding = findings.some((f) => f.category === 'AUTH');
  const hasApiContractFinding = findings.some((f) => f.category === 'API_CONTRACT');
  const hasDeletedExport = findings.some(
    (f) => f.category === 'FUNCTION_CONTRACT' && f.severity === 'CRITICAL'
  );

  if (hasAuthFinding) {
    const contribution = 35;
    baseScore += contribution;
    factors.push({
      factor: 'Authentication / Authorization Shift',
      scoreContribution: contribution,
      reason: 'Security, session, or role evaluation logic was altered.',
    });
  }

  if (hasApiContractFinding) {
    const contribution = 25;
    baseScore += contribution;
    factors.push({
      factor: 'API Contract Mutated',
      scoreContribution: contribution,
      reason: 'Endpoint return payload or signature shape modified.',
    });
  }

  if (hasDeletedExport) {
    const contribution = 25;
    baseScore += contribution;
    factors.push({
      factor: 'Breaking Export Removal',
      scoreContribution: contribution,
      reason: 'One or more exported functions or types were deleted.',
    });
  }

  // 2. Blast Radius Assessment
  let maxConsumers = 0;
  let totalAffectedRoutes = 0;

  for (const radius of Object.values(blastRadiusMap)) {
    if (radius.totalConsumers > maxConsumers) {
      maxConsumers = radius.totalConsumers;
    }
    totalAffectedRoutes += radius.affectedRoutes.length;
  }

  if (maxConsumers > 6) {
    const contribution = 20;
    baseScore += contribution;
    factors.push({
      factor: 'Extensive Blast Radius',
      scoreContribution: contribution,
      reason: `${maxConsumers} downstream consumers depend on modified modules.`,
    });
  } else if (maxConsumers > 2) {
    const contribution = 10;
    baseScore += contribution;
    factors.push({
      factor: 'Moderate Blast Radius',
      scoreContribution: contribution,
      reason: `${maxConsumers} downstream consumers depend on modified modules.`,
    });
  }

  // 3. Route Exposure
  if (totalAffectedRoutes > 0) {
    const contribution = Math.min(15, totalAffectedRoutes * 5);
    baseScore += contribution;
    factors.push({
      factor: 'Public Route Exposure',
      scoreContribution: contribution,
      reason: `${totalAffectedRoutes} route endpoint(s) impacted by changes.`,
    });
  }

  // 4. Test Delta (Was any test file modified in this diff?)
  if (!isAnyTestChanged && (hasAuthFinding || hasApiContractFinding || maxConsumers > 2)) {
    const contribution = 15;
    baseScore += contribution;
    factors.push({
      factor: 'Missing Test Updates',
      scoreContribution: contribution,
      reason: 'Behavioral logic changed without corresponding unit/regression test updates.',
    });
  }

  // Cap between 0 and 100
  const finalScore = Math.min(100, Math.max(10, baseScore));

  let level: SeverityLevel = 'LOW';
  if (finalScore >= 80) {
    level = 'CRITICAL';
  } else if (finalScore >= 60) {
    level = 'HIGH';
  } else if (finalScore >= 35) {
    level = 'MEDIUM';
  }

  return {
    score: finalScore,
    level,
    factors,
  };
}
