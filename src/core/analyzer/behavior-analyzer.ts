import type {
  ASTDiff,
  BlastRadius,
  BehavioralFinding,
  FindingCategory,
  SeverityLevel,
} from '../../types/index.js';

let findingCounter = 0;
function nextId(): string {
  return `finding-${++findingCounter}`;
}

export function detectBehavioralChanges(
  diff: ASTDiff,
  blastRadius: BlastRadius,
  isRoute: boolean,
  isMiddleware: boolean,
  isTestChanged: boolean
): BehavioralFinding[] {
  const findings: BehavioralFinding[] = [];

  // 1. AUTHENTICATION & AUTHORIZATION MUTATIONS
  if (diff.authConditionChanged || (isMiddleware && diff.details.length > 0)) {
    const affectedCount = blastRadius.totalConsumers;
    const severity: SeverityLevel = affectedCount > 3 || isMiddleware ? 'HIGH' : 'MEDIUM';

    const evidence: string[] = [];
    if (diff.authDetails) {
      evidence.push(diff.authDetails);
    }
    evidence.push(
      `${affectedCount} consumer(s) depend on this file directly or downstream.`
    );
    if (blastRadius.affectedRoutes.length > 0) {
      evidence.push(
        `Affects protected routes: ${blastRadius.affectedRoutes.slice(0, 3).join(', ')}${
          blastRadius.affectedRoutes.length > 3 ? '...' : ''
        }`
      );
    }
    if (!isTestChanged) {
      evidence.push('No corresponding authorization/auth test modified in this change.');
    }

    findings.push({
      id: nextId(),
      category: 'AUTH',
      title: 'Authentication / Authorization Logic Changed',
      description:
        diff.authDetails ||
        'Authentication condition or role verification logic was modified, potentially altering access permissions.',
      severity,
      confidence: 92,
      filePath: diff.filePath,
      beforeSnippet: diff.beforeReturnShape,
      afterSnippet: diff.afterReturnShape,
      evidence,
      affectedFiles: blastRadius.directDependents.concat(blastRadius.affectedRoutes),
      recommendation:
        'Verify permission checks and run end-to-end authentication regression tests before approving.',
    });
  }

  // 2. API CONTRACT MUTATIONS (Response Structure & Route Signatures)
  if (diff.returnShapeChanged && (isRoute || diff.filePath.includes('api') || diff.filePath.includes('controller'))) {
    const consumers = blastRadius.totalConsumers;
    const severity: SeverityLevel = consumers > 0 ? 'HIGH' : 'MEDIUM';

    const evidence: string[] = [
      `Response return expression changed: '${diff.beforeReturnShape}' -> '${diff.afterReturnShape}'`,
    ];
    if (consumers > 0) {
      evidence.push(
        `${consumers} client consumer(s) or downstream services depend on this endpoint structure.`
      );
    }
    if (!isTestChanged) {
      evidence.push('Existing tests for this endpoint were not updated with the new structure.');
    }

    findings.push({
      id: nextId(),
      category: 'API_CONTRACT',
      title: 'API Response Contract Mutated',
      description: `The return payload structure of endpoint '${diff.filePath}' was modified. Consumers expecting the previous shape may fail at runtime.`,
      severity,
      confidence: 94,
      filePath: diff.filePath,
      beforeSnippet: diff.beforeReturnShape,
      afterSnippet: diff.afterReturnShape,
      evidence,
      affectedFiles: blastRadius.directDependents,
      recommendation:
        'Inspect API consumers and update API client bindings and integration tests to match the new payload.',
    });
  }

  // 3. FUNCTION CONTRACT & EXPORT SIGNATURE MUTATIONS (Type Nullability, Parameter Shifts)
  for (const sym of diff.symbols) {
    if (sym.changeType === 'modified') {
      const isNullWidened =
        sym.afterSignature?.includes('| null') ||
        sym.afterSignature?.includes('| undefined') ||
        sym.afterSignature?.includes('?') ||
        (sym.beforeSignature && !sym.beforeSignature.includes('| null') && sym.afterSignature?.includes('null'));

      const isSeverityHigh = blastRadius.totalConsumers > 4 || isNullWidened;
      const severity: SeverityLevel = isSeverityHigh ? 'HIGH' : 'MEDIUM';

      const evidence: string[] = [
        `Exported signature '${sym.name}' modified:`,
        `Before: ${sym.beforeSignature}`,
        `After:  ${sym.afterSignature}`,
        `${blastRadius.directDependents.length} direct caller(s) detected.`,
      ];

      if (isNullWidened) {
        evidence.push('Return type widened to include nullable/undefined value without verified caller guards.');
      }

      findings.push({
        id: nextId(),
        category: 'FUNCTION_CONTRACT',
        title: `Export Contract Changed: ${sym.name}`,
        description: isNullWidened
          ? `The return contract for '${sym.name}' was widened to nullable/optional. Existing callers may encounter unhandled null references.`
          : `The exported interface/signature of '${sym.name}' changed, altering parameters or types for downstream callers.`,
        severity,
        confidence: 89,
        filePath: diff.filePath,
        evidence,
        affectedFiles: blastRadius.directDependents,
        recommendation: `Audit call-sites in ${blastRadius.directDependents.slice(0, 3).join(', ')} to verify compatibility with the new contract.`,
      });
    } else if (sym.changeType === 'removed') {
      const severity: SeverityLevel = blastRadius.totalConsumers > 0 ? 'CRITICAL' : 'MEDIUM';

      findings.push({
        id: nextId(),
        category: 'FUNCTION_CONTRACT',
        title: `Export Deleted: ${sym.name}`,
        description: `Exported symbol '${sym.name}' was removed from '${diff.filePath}'.`,
        severity,
        confidence: 99,
        filePath: diff.filePath,
        evidence: [
          `Symbol '${sym.name}' is no longer exported.`,
          `${blastRadius.directDependents.length} consumer(s) previously imported from this file.`,
        ],
        affectedFiles: blastRadius.directDependents,
        recommendation: `Ensure no downstream modules rely on '${sym.name}' or provide a deprecation migration path.`,
      });
    }
  }

  // 4. ERROR HANDLING ALTERATIONS
  if (diff.errorHandlingChanged) {
    findings.push({
      id: nextId(),
      category: 'ERROR_HANDLING',
      title: 'Error Handling Semantics Altered',
      description: diff.errorDetails || 'Throw expressions or error propagation control flow changed.',
      severity: 'MEDIUM',
      confidence: 85,
      filePath: diff.filePath,
      evidence: [
        diff.errorDetails || 'Throw statements altered in control flow.',
        `${blastRadius.totalConsumers} consumer(s) might experience changed exception behavior.`,
      ],
      affectedFiles: blastRadius.directDependents,
      recommendation: 'Verify error codes and ensure calling layers catch or handle the modified error states.',
    });
  }

  // 5. VALIDATION DRIFT
  if (diff.validationChanged) {
    findings.push({
      id: nextId(),
      category: 'VALIDATION',
      title: 'Payload Validation Logic Updated',
      description: diff.validationDetails || 'Input validation schema was added, removed, or altered.',
      severity: 'MEDIUM',
      confidence: 88,
      filePath: diff.filePath,
      evidence: [
        diff.validationDetails || 'Schema parsing logic detected in modified file.',
        'Request payloads failing the new schema will now be rejected before handler execution.',
      ],
      affectedFiles: blastRadius.directDependents,
      recommendation: 'Confirm that valid existing client payloads are not rejected by the stricter schema.',
    });
  }

  return findings;
}
