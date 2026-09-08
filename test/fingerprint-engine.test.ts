import { describe, it, expect } from 'vitest';
import { computeBehavioralFingerprint } from '../src/core/analyzer/fingerprint-engine.js';
import type { ASTDiff, BlastRadius } from '../src/types/index.js';

describe('11-Dimensional Behavioral Fingerprint Engine', () => {
  it('identifies API contract mutation as primary mutation with high confidence', () => {
    const diffs: ASTDiff[] = [
      {
        filePath: 'src/routes/api/user.ts',
        symbols: [],
        returnShapeChanged: true,
        beforeReturnShape: 'user',
        afterReturnShape: '{ data: user }',
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    const blastMap: Record<string, BlastRadius> = {
      'src/routes/api/user.ts': {
        filePath: 'src/routes/api/user.ts',
        directDependents: ['src/client/api.ts'],
        indirectDependents: [],
        affectedRoutes: [],
        affectedServices: [],
        affectedTests: [],
        totalConsumers: 4,
        level: 'HIGH',
      },
    };

    const fingerprint = computeBehavioralFingerprint(diffs, blastMap, false);

    expect(fingerprint.primaryMutation).toBe('API CONTRACT');
    expect(fingerprint.vectors.apiContract.active).toBe(true);
    expect(fingerprint.vectors.apiContract.score).toBeGreaterThan(50);
    expect(fingerprint.confidenceScore).toBeGreaterThanOrEqual(90);
    expect(fingerprint.vectors.testCoverage.active).toBe(true);
  });

  it('detects nullability widening when return signatures widen to null or undefined', () => {
    const diffs: ASTDiff[] = [
      {
        filePath: 'src/services/billing.ts',
        symbols: [
          {
            name: 'getPlan',
            kind: 'function',
            changeType: 'modified',
            beforeSignature: 'getPlan(id: string): Plan',
            afterSignature: 'getPlan(id: string): Plan | null',
          },
        ],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    const fingerprint = computeBehavioralFingerprint(diffs, {}, true);

    expect(fingerprint.vectors.nullability.active).toBe(true);
    expect(fingerprint.vectors.nullability.score).toBeGreaterThan(0);
    expect(fingerprint.primaryMutation).toBe('NULLABILITY WIDENING');
  });

  it('detects database and event flow shifts in the fingerprint matrix', () => {
    const diffs: ASTDiff[] = [
      {
        filePath: 'src/services/order.ts',
        symbols: [],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        databaseChanged: true,
        databaseDetails: 'Added prisma.order.update call',
        eventFlowChanged: true,
        eventDetails: 'Added eventEmitter.emit call',
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    const fingerprint = computeBehavioralFingerprint(diffs, {}, true);

    expect(fingerprint.vectors.database.active).toBe(true);
    expect(fingerprint.vectors.eventFlow.active).toBe(true);
  });
});
