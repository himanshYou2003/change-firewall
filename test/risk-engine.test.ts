import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from '../src/core/risk/risk-engine.js';
import type { BehavioralFinding, BlastRadius } from '../src/types/index.js';

describe('Risk Scoring Engine', () => {
  it('assigns LOW risk when there are no findings', () => {
    const risk = calculateRiskScore([], {}, false);
    expect(risk.level).toBe('LOW');
    expect(risk.score).toBeLessThanOrEqual(25);
  });

  it('assigns HIGH / CRITICAL risk when auth changes are combined with untested routes and high blast radius', () => {
    const findings: BehavioralFinding[] = [
      {
        id: 'f-1',
        category: 'AUTH',
        title: 'Authentication Logic Changed',
        description: 'Role check added',
        severity: 'HIGH',
        confidence: 95,
        filePath: 'src/middleware/auth.ts',
        evidence: ['Role check added'],
        affectedFiles: ['src/routes/admin.ts'],
        recommendation: 'Test auth',
      },
    ];

    const blastMap: Record<string, BlastRadius> = {
      'src/middleware/auth.ts': {
        filePath: 'src/middleware/auth.ts',
        directDependents: ['src/routes/a.ts', 'src/routes/b.ts', 'src/routes/c.ts', 'src/routes/d.ts'],
        indirectDependents: ['src/routes/e.ts', 'src/routes/f.ts', 'src/routes/g.ts'],
        affectedRoutes: ['src/routes/a.ts', 'src/routes/b.ts'],
        affectedServices: [],
        affectedTests: [],
        totalConsumers: 7,
        level: 'HIGH',
      },
    };

    const risk = calculateRiskScore(findings, blastMap, false);
    expect(risk.score).toBeGreaterThanOrEqual(70);
    expect(risk.level).toMatch(/HIGH|CRITICAL/);
    expect(risk.factors.some((f) => f.factor.includes('Authentication'))).toBe(true);
    expect(risk.factors.some((f) => f.factor.includes('Blast Radius'))).toBe(true);
  });
});
