import { describe, it, expect } from 'vitest';
import { auditAgentIntent } from '../src/core/agent/intent-verifier.js';
import type { BehavioralFinding, ASTDiff } from '../src/types/index.js';

describe('AI Agent Intent vs Reality Verifier', () => {
  it('detects STEALTH_MUTATION when agent claims UI fix but alters security/auth logic', () => {
    const findings: BehavioralFinding[] = [
      {
        id: 'f-1',
        category: 'AUTH',
        title: 'Authentication Guard Bypassed',
        description: 'Session condition removed',
        severity: 'HIGH',
        confidence: 94,
        filePath: 'src/middlewares/auth.ts',
        evidence: ['Removed if (!session) check'],
        affectedFiles: ['src/routes/api.ts'],
        recommendation: 'Restore session check',
      },
    ];

    const diffs: ASTDiff[] = [];

    const audit = auditAgentIntent('Fix button padding and header color in CSS', findings, diffs);

    expect(audit.verdict).toBe('STEALTH_MUTATION');
    expect(audit.driftScore).toBeGreaterThanOrEqual(60);
    expect(audit.unannouncedMutations.length).toBeGreaterThan(0);
    expect(audit.unannouncedMutations[0]).toContain('Unannounced Security Mutation');
  });

  it('verifies ALIGNED when code modifications match stated intent', () => {
    const findings: BehavioralFinding[] = [
      {
        id: 'f-2',
        category: 'AUTH',
        title: 'Authentication Logic Changed',
        description: 'Token verification updated',
        severity: 'MEDIUM',
        confidence: 90,
        filePath: 'src/middlewares/auth.ts',
        evidence: ['Updated JWT algorithm'],
        affectedFiles: [],
        recommendation: 'Verify tokens',
      },
    ];

    const diffs: ASTDiff[] = [];

    const audit = auditAgentIntent('Update auth token verification logic', findings, diffs);

    expect(audit.verdict).toBe('ALIGNED');
    expect(audit.driftScore).toBe(0);
    expect(audit.unannouncedMutations.length).toBe(0);
  });

  it('detects STEALTH_MUTATION when agent claims UI styling but changes type contracts and backend files', () => {
    const findings: BehavioralFinding[] = [
      {
        id: 'f-3',
        category: 'FUNCTION_CONTRACT',
        title: 'Export Contract Changed: BehaviorRole',
        description: 'Exported signature changed',
        severity: 'HIGH',
        confidence: 89,
        filePath: 'src/types/index.ts',
        evidence: ['Added SERVICE to union'],
        affectedFiles: ['src/core/agent/intent-verifier.ts'],
        recommendation: 'Audit call-sites',
      },
    ];

    const diffs: ASTDiff[] = [
      {
        filePath: 'src/types/index.ts',
        symbols: [],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
      {
        filePath: 'src/core/analyzer/behavior-analyzer.ts',
        symbols: [],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    const audit = auditAgentIntent('Fix button padding and header colors', findings, diffs);

    expect(audit.verdict).toBe('STEALTH_MUTATION');
    expect(audit.driftScore).toBeGreaterThanOrEqual(60);
    expect(audit.unannouncedMutations.length).toBeGreaterThanOrEqual(2);
    expect(audit.unannouncedMutations.some((m) => m.includes('Contract Shift'))).toBe(true);
    expect(audit.unannouncedMutations.some((m) => m.includes('Non-UI Modifications'))).toBe(true);
  });

  it('correctly attributes in-scope feature contract changes without falsely triggering STEALTH_MUTATION', () => {
    const fnNames = [
      'getInsurers', 'getInsurer', 'getProducts', 'getProduct',
      'getPptOptions', 'getPtOptions', 'getInsurerName', 'getProductName'
    ];

    const findings: BehavioralFinding[] = fnNames.map((name, idx) => ({
      id: `f-${idx + 10}`,
      category: 'FUNCTION_CONTRACT',
      title: `Export Contract Changed: ${name}`,
      description: `Exported signature '${name}' added parameter without default`,
      severity: 'HIGH',
      confidence: 90,
      filePath: 'src/features/weightage/utils.js',
      evidence: [`Before: ${name}(channel)`, `After: ${name}(channel, customInsurers)`],
      affectedFiles: ['src/features/weightage/calculate.js'],
      recommendation: `Provide default value 'customInsurers = null'`,
    }));

    const diffs: ASTDiff[] = [
      {
        filePath: 'src/features/weightage/utils.js',
        symbols: [],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    // Natural informal conversational prompt
    const audit = auditAgentIntent('did we added weightage calculator with real data', findings, diffs);

    // Should recognize the feature scope and NOT flag a 100% malicious stealth backdoor
    expect(audit.verdict).not.toBe('STEALTH_MUTATION');
    expect(audit.driftScore).toBeLessThan(60);
    expect(audit.statedChanges).toContain('FEATURE_IMPLEMENTATION');
    expect(audit.unannouncedMutations.some((m) => m.includes('Declared Scope'))).toBe(true);
    expect(audit.unannouncedMutations.some((m) => m.includes('= null'))).toBe(true);
  });

  it('rejects unrelated gibberish intent (e.g. "have i added chinta ta ta tit it") when actual code changes do not match', () => {
    const findings: BehavioralFinding[] = [];
    const diffs: ASTDiff[] = [
      {
        filePath: 'src/dashboard/ui.ts',
        symbols: [{ name: 'getDashboardHtml', kind: 'function', changeType: 'modified' }],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
      {
        filePath: 'src/core/parser/ast-parser.ts',
        symbols: [{ name: 'analyzeASTDiff', kind: 'function', changeType: 'modified' }],
        returnShapeChanged: false,
        authConditionChanged: false,
        errorHandlingChanged: false,
        validationChanged: false,
        callsAdded: [],
        callsRemoved: [],
        details: [],
      },
    ];

    const audit = auditAgentIntent('have i added chinta ta ta tit it', findings, diffs);

    expect(audit.verdict).toBe('STEALTH_MUTATION');
    expect(audit.driftScore).toBeGreaterThanOrEqual(60);
    expect(audit.summary).toContain('zero correlation');
    expect(audit.unannouncedMutations.some((m) => m.includes('Unrelated Intent Claim'))).toBe(true);
  });
});


