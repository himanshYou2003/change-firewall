import { describe, it, expect } from 'vitest';
import { detectBehavioralChanges } from '../src/core/analyzer/behavior-analyzer.js';
import type { ASTDiff, BlastRadius } from '../src/types/index.js';

describe('Behavioral Rules Analyzer', () => {
  it('classifies auth condition mutations as HIGH risk with blast radius evidence', () => {
    const astDiff: ASTDiff = {
      filePath: 'src/middleware/auth.ts',
      symbols: [],
      returnShapeChanged: false,
      authConditionChanged: true,
      authDetails: 'Modified authentication logic from "!req.user" to "!req.user || req.user.role !== \'admin\'"',
      errorHandlingChanged: false,
      validationChanged: false,
      callsAdded: [],
      callsRemoved: [],
      details: [],
    };

    const blast: BlastRadius = {
      filePath: 'src/middleware/auth.ts',
      directDependents: ['src/routes/dashboard.ts', 'src/routes/settings.ts'],
      indirectDependents: ['src/app.ts'],
      affectedRoutes: ['src/routes/dashboard.ts', 'src/routes/settings.ts'],
      affectedServices: [],
      affectedTests: [],
      totalConsumers: 3,
      level: 'HIGH',
    };

    const findings = detectBehavioralChanges(astDiff, blast, false, true, false);

    expect(findings.length).toBeGreaterThan(0);
    const authFinding = findings.find((f) => f.category === 'AUTH');
    expect(authFinding).toBeDefined();
    expect(authFinding?.severity).toBe('HIGH');
    expect(authFinding?.confidence).toBeGreaterThanOrEqual(90);
    expect(authFinding?.evidence.some((e) => e.includes('admin'))).toBe(true);
  });

  it('classifies API response contract changes as HIGH risk when consumers exist', () => {
    const astDiff: ASTDiff = {
      filePath: 'src/routes/user.ts',
      symbols: [],
      returnShapeChanged: true,
      beforeReturnShape: 'user',
      afterReturnShape: '{ user }',
      authConditionChanged: false,
      errorHandlingChanged: false,
      validationChanged: false,
      callsAdded: [],
      callsRemoved: [],
      details: [],
    };

    const blast: BlastRadius = {
      filePath: 'src/routes/user.ts',
      directDependents: ['src/client/api.ts', 'src/views/profile.ts'],
      indirectDependents: [],
      affectedRoutes: ['src/routes/user.ts'],
      affectedServices: [],
      affectedTests: [],
      totalConsumers: 2,
      level: 'MEDIUM',
    };

    const findings = detectBehavioralChanges(astDiff, blast, true, false, false);
    const apiFinding = findings.find((f) => f.category === 'API_CONTRACT');
    expect(apiFinding).toBeDefined();
    expect(apiFinding?.severity).toBe('HIGH');
    expect(apiFinding?.beforeSnippet).toBe('user');
    expect(apiFinding?.afterSnippet).toBe('{ user }');
  });
});
