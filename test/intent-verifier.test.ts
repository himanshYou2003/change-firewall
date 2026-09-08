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
});
