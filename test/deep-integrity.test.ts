import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { analyzeASTDiff } from '../src/core/parser/ast-parser.js';
import { computeBlastRadius, type ProjectDependencyGraph } from '../src/core/graph/dependency-graph.js';
import { startDashboardServer } from '../src/dashboard/server.js';
import { generateDemoReport } from '../src/core/demo/demo-runner.js';

describe('Deep Reliability & Edge Case Crucible', () => {
  it('handles circular dependencies in blast radius computation without infinite loops', () => {
    // A imports B, B imports C, C imports A
    const circularGraph: ProjectDependencyGraph = {
      allFiles: ['a.ts', 'b.ts', 'c.ts'],
      forwardGraph: new Map([
        ['a.ts', new Set(['b.ts'])],
        ['b.ts', new Set(['c.ts'])],
        ['c.ts', new Set(['a.ts'])],
      ]),
      reverseGraph: new Map([
        ['a.ts', new Set(['c.ts'])],
        ['b.ts', new Set(['a.ts'])],
        ['c.ts', new Set(['b.ts'])],
      ]),
      routeFiles: new Set(['c.ts']),
      serviceFiles: new Set(['b.ts']),
      modelFiles: new Set(),
      middlewareFiles: new Set(['a.ts']),
      testFiles: new Set(),
    };

    const blastA = computeBlastRadius('a.ts', circularGraph);
    expect(blastA.directDependents).toEqual(['c.ts']);
    expect(blastA.indirectDependents).toContain('b.ts');
    // Cycle must not duplicate nodes
    expect(blastA.totalConsumers).toBe(2);
    expect(blastA.level).toBe('HIGH'); // Because it's middleware and affects routes
  });

  it('handles completely malformed / syntax-error source files gracefully without crashing', () => {
    const invalidBefore = `function broken( { def !!! ??? === `;
    const invalidAfter = `class 1234 { invalid syntax syntax %%% `;

    expect(() => {
      const diff = analyzeASTDiff('broken.ts', invalidBefore, invalidAfter);
      expect(diff).toBeDefined();
    }).not.toThrow();
  });

  it('handles empty strings and undefined content gracefully', () => {
    const diff = analyzeASTDiff('empty.ts', '', '');
    expect(diff.returnShapeChanged).toBe(false);
    expect(diff.authConditionChanged).toBe(false);
    expect(diff.symbols).toEqual([]);
  });

  it('verifies embedded dashboard HTTP endpoints and SSE stream integrity', async () => {
    const report = generateDemoReport();
    const server = await startDashboardServer(report, 4899, false);

    try {
      // 1. Test GET / HTML endpoint
      const html = await new Promise<string>((resolve, reject) => {
        http.get('http://127.0.0.1:4899/', (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toContain('text/html');
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });

      expect(html).toContain('Change Firewall');
      expect(html).toContain('network-svg');
      expect(html).toContain('Interactive Impact & Consumer Graph');

      // 2. Test GET /api/report JSON endpoint
      const jsonStr = await new Promise<string>((resolve, reject) => {
        http.get('http://127.0.0.1:4899/api/report', (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toContain('application/json');
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });

      const parsed = JSON.parse(jsonStr);
      expect(parsed.totalFilesChanged).toBe(19);
      expect(parsed.risk.score).toBe(74);
      expect(parsed.findings.length).toBe(4);
    } finally {
      await server.close();
    }
  });
});
