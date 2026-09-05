import { describe, it, expect } from 'vitest';
import { evaluatePreflight } from '../src/core/preflight/preflight-checker.js';
import type { AnalysisReport } from '../src/types/index.js';

describe('Preflight Merge-Readiness Gate', () => {
  it('approves a safe report under threshold', () => {
    const report: AnalysisReport = {
      timestamp: new Date().toISOString(),
      projectPath: '/demo',
      totalFilesChanged: 2,
      linesAdded: 10,
      linesDeleted: 2,
      behavioralChangesCount: 0,
      risk: {
        score: 15,
        level: 'LOW',
        factors: [],
      },
      findings: [],
      blastRadiusMap: {},
      changedFiles: [],
      recommendations: [],
    };

    const result = evaluatePreflight(report, { maxRisk: 60 });
    expect(result.readyToMerge).toBe(true);
    expect(result.blockers.length).toBe(0);
    expect(result.highRiskCount).toBe(0);
  });

  it('blocks merge when risk score exceeds maximum risk threshold', () => {
    const report: AnalysisReport = {
      timestamp: new Date().toISOString(),
      projectPath: '/demo',
      totalFilesChanged: 8,
      linesAdded: 150,
      linesDeleted: 80,
      behavioralChangesCount: 3,
      risk: {
        score: 75,
        level: 'HIGH',
        factors: [
          {
            factor: 'Authentication Shift',
            scoreContribution: 35,
            reason: 'Auth logic changed',
          },
        ],
      },
      findings: [],
      blastRadiusMap: {},
      changedFiles: [],
      recommendations: [],
    };

    const result = evaluatePreflight(report, { maxRisk: 60 });
    expect(result.readyToMerge).toBe(false);
    expect(result.blockers.some((b) => b.includes('exceeds maximum'))).toBe(true);
  });

  it('blocks merge when HIGH severity findings exist', () => {
    const report: AnalysisReport = {
      timestamp: new Date().toISOString(),
      projectPath: '/demo',
      totalFilesChanged: 3,
      linesAdded: 25,
      linesDeleted: 10,
      behavioralChangesCount: 1,
      risk: {
        score: 50,
        level: 'MEDIUM',
        factors: [],
      },
      findings: [
        {
          id: 'f-1',
          category: 'API_CONTRACT',
          title: 'API Response Contract Mutated',
          description: 'Response wrapped in object',
          severity: 'HIGH',
          confidence: 95,
          filePath: 'src/routes/user.ts',
          evidence: ['Return statement changed'],
          affectedFiles: ['src/client/api.ts'],
          recommendation: 'Update consumers',
        },
      ],
      blastRadiusMap: {},
      changedFiles: [],
      recommendations: ['Update consumers'],
    };

    const result = evaluatePreflight(report, { maxRisk: 60, failOnHigh: true });
    expect(result.readyToMerge).toBe(false);
    expect(result.highRiskCount).toBe(1);
    expect(result.blockers.some((b) => b.includes('API_CONTRACT'))).toBe(true);
  });
});
