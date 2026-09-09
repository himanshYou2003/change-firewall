import { describe, it, expect } from 'vitest';
import { startInteractiveInspector } from '../src/index.js';
import type { AnalysisReport } from '../src/types/index.js';

describe('Interactive Terminal Inspector', () => {
  it('gracefully handles non-TTY environments without hanging or crashing', async () => {
    const mockReport: AnalysisReport = {
      timestamp: new Date().toISOString(),
      projectPath: process.cwd(),
      totalFilesChanged: 1,
      linesAdded: 10,
      linesDeleted: 2,
      behavioralChangesCount: 1,
      risk: {
        score: 45,
        level: 'MEDIUM',
        factors: [],
      },
      findings: [
        {
          id: 'finding-1',
          category: 'FUNCTION_CONTRACT',
          title: 'Export Contract Changed: testFunc',
          description: 'Return type was widened.',
          severity: 'MEDIUM',
          confidence: 90,
          filePath: 'src/test.ts',
          evidence: ['return type modified'],
          affectedFiles: [],
          recommendation: 'Audit call sites',
        },
      ],
      suspiciousChanges: [],
      timeline: [],
      blastRadiusMap: {
        'src/test.ts': {
          filePath: 'src/test.ts',
          directDependents: ['src/caller.ts'],
          indirectDependents: [],
          affectedRoutes: [],
          affectedServices: [],
          affectedTests: [],
          totalConsumers: 1,
          level: 'LOW',
        },
      },
      changedFiles: [],
      recommendations: [],
    };

    // process.stdin.isTTY is false in test runner
    expect(process.stdin.isTTY).toBeFalsy();

    // Should complete without throwing
    await expect(startInteractiveInspector(mockReport)).resolves.not.toThrow();
  });
});
