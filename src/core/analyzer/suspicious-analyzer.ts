import type {
  BehavioralFinding,
  BlastRadius,
  FileDiff,
  SuspiciousChange,
} from '../../types/index.js';

export function detectSuspiciousChanges(
  findings: BehavioralFinding[],
  blastMap: Record<string, BlastRadius>,
  changedFiles: FileDiff[],
  isAnyTestChanged: boolean
): SuspiciousChange[] {
  const suspicious: SuspiciousChange[] = [];
  let counter = 0;

  // 1. API changed without corresponding tests
  const apiFindings = findings.filter((f) => f.category === 'API_CONTRACT');
  if (apiFindings.length > 0 && !isAnyTestChanged) {
    for (const af of apiFindings) {
      suspicious.push({
        id: `suspicious-${++counter}`,
        title: 'API endpoint response modified without regression test updates',
        severity: 'HIGH',
        reason: 'The public/internal API contract was altered, but zero test files were modified in this diff.',
        evidence: [
          `Endpoint: ${af.filePath}`,
          `Changes detected: ${af.description}`,
          `Downstream consumers potentially affected: ${af.affectedFiles.length}`,
          'No test files (.test.ts / .spec.ts) were updated to reflect this new structure.',
        ],
        filePath: af.filePath,
      });
    }
  }

  // 2. Authentication logic changed in sensitive paths
  const authFindings = findings.filter((f) => f.category === 'AUTH');
  for (const auf of authFindings) {
    suspicious.push({
      id: `suspicious-${++counter}`,
      title: 'Authentication / Authorization logic modified',
      severity: 'HIGH',
      reason: 'Security-critical access condition or permission evaluation was altered by this change.',
      evidence: auf.evidence,
      filePath: auf.filePath,
    });
  }

  // 3. High Blast-Radius changes without test changes
  for (const [file, blast] of Object.entries(blastMap)) {
    if (blast.totalConsumers > 4 && !isAnyTestChanged) {
      suspicious.push({
        id: `suspicious-${++counter}`,
        title: 'High blast radius module modified with zero test changes',
        severity: 'MEDIUM',
        reason: `${blast.totalConsumers} consumers depend on '${file}', but no test updates were included.`,
        evidence: [
          `Direct dependents: ${blast.directDependents.join(', ')}`,
          blast.affectedRoutes.length > 0
            ? `Affects routes: ${blast.affectedRoutes.join(', ')}`
            : 'Internal core utility',
        ],
        filePath: file,
      });
    }
  }

  return suspicious;
}
