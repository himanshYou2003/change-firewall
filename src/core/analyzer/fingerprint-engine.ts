import type {
  ASTDiff,
  BlastRadius,
  BehavioralFingerprint,
  FingerprintVector,
} from '../../types/index.js';

export function computeBehavioralFingerprint(
  diffs: ASTDiff[],
  blastRadiusMap: Record<string, BlastRadius>,
  isAnyTestChanged: boolean
): BehavioralFingerprint {
  // Vector Accumulators
  let apiScore = 0;
  const apiEvidence: string[] = [];

  let authScore = 0;
  const authEvidence: string[] = [];

  let dataShapeScore = 0;
  const dataShapeEvidence: string[] = [];

  let nullabilityScore = 0;
  const nullabilityEvidence: string[] = [];

  let validationScore = 0;
  const validationEvidence: string[] = [];

  let dependencyScore = 0;
  const dependencyEvidence: string[] = [];

  let databaseScore = 0;
  const databaseEvidence: string[] = [];

  let eventFlowScore = 0;
  const eventFlowEvidence: string[] = [];

  let errorSemanticsScore = 0;
  const errorEvidence: string[] = [];

  let performanceScore = 0;
  const perfEvidence: string[] = [];

  let testCoverageScore = 0;
  const testEvidence: string[] = [];

  for (const diff of diffs) {
    const normPath = diff.filePath.replace(/\\/g, '/');
    const blast = blastRadiusMap[diff.filePath] || blastRadiusMap[normPath];
    const consumers = blast ? blast.totalConsumers : 0;

    // 1. API CONTRACT
    if (diff.returnShapeChanged && (normPath.includes('api') || normPath.includes('route') || normPath.includes('controller'))) {
      apiScore += 45;
      apiEvidence.push(
        `${diff.filePath}: Response return shape mutated ('${diff.beforeReturnShape}' -> '${diff.afterReturnShape}').`
      );
      if (consumers > 0) {
        apiScore += Math.min(35, consumers * 5);
        apiEvidence.push(`${consumers} consumer(s) depend on this endpoint contract.`);
      }
    }

    // 2. AUTHORIZATION
    if (diff.authConditionChanged) {
      authScore += 50;
      authEvidence.push(`${diff.filePath}: ${diff.authDetails || 'Authentication condition altered'}.`);
      if (consumers > 0) {
        authScore += Math.min(40, consumers * 8);
        authEvidence.push(`Guards ${consumers} downstream consumer(s) or protected route(s).`);
      }
    }

    // 3. DATA SHAPE & 4. NULLABILITY
    for (const sym of diff.symbols) {
      if (sym.changeType === 'modified') {
        dataShapeScore += 25;
        dataShapeEvidence.push(`${diff.filePath}: Symbol '${sym.name}' signature changed.`);

        const returnPart = sym.afterSignature?.includes(')')
          ? sym.afterSignature.slice(sym.afterSignature.lastIndexOf(')'))
          : (sym.afterSignature || '');
        const beforeReturnPart = sym.beforeSignature?.includes(')')
          ? sym.beforeSignature.slice(sym.beforeSignature.lastIndexOf(')'))
          : (sym.beforeSignature || '');

        const isNullWidened =
          (returnPart.includes('| null') || returnPart.includes('| undefined') || returnPart.includes('null')) &&
          (!beforeReturnPart.includes('| null') && !beforeReturnPart.includes('| undefined') && !beforeReturnPart.includes('null'));

        if (isNullWidened) {
          nullabilityScore += 45;
          nullabilityEvidence.push(
            `${diff.filePath}: Return type or field of '${sym.name}' widened to nullable/optional without verified caller guards.`
          );
        }
      } else if (sym.changeType === 'removed') {
        dataShapeScore += 50;
        dataShapeEvidence.push(`${diff.filePath}: Exported symbol '${sym.name}' was removed.`);
      }
    }

    // 5. VALIDATION
    if (diff.validationChanged) {
      validationScore += 40;
      validationEvidence.push(`${diff.filePath}: ${diff.validationDetails || 'Payload schema validation modified'}.`);
    }

    // 6. DEPENDENCY
    if (diff.callsAdded.length > 0 || diff.callsRemoved.length > 0) {
      const externalCalls = diff.callsAdded.filter((c) => c.includes('.') && !c.startsWith('this.'));
      if (externalCalls.length > 0) {
        dependencyScore += Math.min(40, externalCalls.length * 10);
        dependencyEvidence.push(`${diff.filePath}: Added ${externalCalls.length} cross-module or external invocation(s).`);
      }
    }

    // 7. DATABASE
    if (diff.databaseChanged || normPath.includes('/model') || normPath.includes('/schema') || normPath.includes('/prisma/')) {
      databaseScore += 45;
      databaseEvidence.push(`${diff.filePath}: ${diff.databaseDetails || 'Database model operation modified'}.`);
    }

    // 8. EVENT FLOW
    if (diff.eventFlowChanged || normPath.includes('worker') || normPath.includes('event')) {
      eventFlowScore += 45;
      eventFlowEvidence.push(`${diff.filePath}: ${diff.eventDetails || 'Event producer/consumer hooks modified'}.`);
    }

    // 9. ERROR SEMANTICS
    if (diff.errorHandlingChanged) {
      errorSemanticsScore += 35;
      errorEvidence.push(`${diff.filePath}: ${diff.errorDetails || 'Throw expressions / error propagation modified'}.`);
    }

    // 10. PERFORMANCE
    // Detect potential N+1 or heavy synchronous loops with calls
    if (diff.callsAdded.some((c) => c.includes('findMany') || c.includes('fetch') || c.includes('query'))) {
      performanceScore += 30;
      perfEvidence.push(`${diff.filePath}: Added database or network query calls in modified control paths.`);
    }
  }

  // 11. TEST COVERAGE
  const totalBehavioralDrift = apiScore + authScore + dataShapeScore + nullabilityScore + databaseScore;
  if (totalBehavioralDrift > 0 && !isAnyTestChanged) {
    testCoverageScore = Math.min(90, Math.round(totalBehavioralDrift * 0.4));
    testEvidence.push('Core behavioral logic mutated with ZERO test file changes in this commit/diff.');
  } else if (isAnyTestChanged) {
    testCoverageScore = 15;
    testEvidence.push('Test files were updated in this diff.');
  }

  // Normalize scores to 0-100
  const clamp = (v: number) => Math.min(100, Math.max(0, v));

  const vectors: BehavioralFingerprint['vectors'] = {
    apiContract: {
      score: clamp(apiScore),
      active: apiScore > 0,
      description: 'Mutations to public API payloads, endpoints, or response schemas',
      evidence: apiEvidence,
    },
    authorization: {
      score: clamp(authScore),
      active: authScore > 0,
      description: 'Shifts in permission checks, token validations, or session guards',
      evidence: authEvidence,
    },
    dataShape: {
      score: clamp(dataShapeScore),
      active: dataShapeScore > 0,
      description: 'Modifications to exported types, interfaces, or object schemas',
      evidence: dataShapeEvidence,
    },
    nullability: {
      score: clamp(nullabilityScore),
      active: nullabilityScore > 0,
      description: 'Return or parameter types widened to include null or undefined',
      evidence: nullabilityEvidence,
    },
    validation: {
      score: clamp(validationScore),
      active: validationScore > 0,
      description: 'Schema or payload validation rules added, loosened, or removed',
      evidence: validationEvidence,
    },
    dependency: {
      score: clamp(dependencyScore),
      active: dependencyScore > 0,
      description: 'External or cross-module invocation dependencies altered',
      evidence: dependencyEvidence,
    },
    database: {
      score: clamp(databaseScore),
      active: databaseScore > 0,
      description: 'ORM queries, database schema, or model interactions modified',
      evidence: databaseEvidence,
    },
    eventFlow: {
      score: clamp(eventFlowScore),
      active: eventFlowScore > 0,
      description: 'Event emission, queue dispatches, or message listener bindings modified',
      evidence: eventFlowEvidence,
    },
    errorSemantics: {
      score: clamp(errorSemanticsScore),
      active: errorSemanticsScore > 0,
      description: 'Thrown exceptions, catch blocks, or error propagation altered',
      evidence: errorEvidence,
    },
    performance: {
      score: clamp(performanceScore),
      active: performanceScore > 0,
      description: 'Query additions or structural patterns with runtime latency implications',
      evidence: perfEvidence,
    },
    testCoverage: {
      score: clamp(testCoverageScore),
      active: testCoverageScore > 20,
      description: 'Regression coverage gap on modified behavioral paths',
      evidence: testEvidence,
    },
  };

  // Determine Primary Mutation
  const vectorScores: Array<{ name: string; score: number }> = [
    { name: 'AUTHORIZATION', score: vectors.authorization.score },
    { name: 'API CONTRACT', score: vectors.apiContract.score },
    { name: 'DATABASE SHAPE', score: vectors.database.score },
    { name: 'NULLABILITY WIDENING', score: vectors.nullability.score },
    { name: 'DATA SHAPE', score: vectors.dataShape.score },
    { name: 'EVENT FLOW', score: vectors.eventFlow.score },
    { name: 'VALIDATION DRIFT', score: vectors.validation.score },
    { name: 'ERROR SEMANTICS', score: vectors.errorSemantics.score },
    { name: 'DEPENDENCY SHIFT', score: vectors.dependency.score },
    { name: 'PERFORMANCE', score: vectors.performance.score },
  ];

  vectorScores.sort((a, b) => b.score - a.score);

  const highest = vectorScores[0];
  const primaryMutation = highest.score > 0 ? highest.name : 'NO_BEHAVIORAL_MUTATION';

  // Calculate mathematical confidence score (based on evidence clarity)
  let confidenceScore = 90;
  if (highest.score > 50) confidenceScore = 95;
  if (vectors.testCoverage.active && highest.score > 40) confidenceScore = 97;
  if (highest.score === 0) confidenceScore = 99;

  return {
    vectors,
    primaryMutation,
    confidenceScore,
  };
}
