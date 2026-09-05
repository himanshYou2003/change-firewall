import { describe, it, expect } from 'vitest';
import { generateDemoReport } from '../src/core/demo/demo-runner.js';

describe('Demo Simulation Report', () => {
  it('generates the Section 7 Golden Moment report with exact metrics and findings', () => {
    const report = generateDemoReport();

    expect(report.totalFilesChanged).toBe(19);
    expect(report.behavioralChangesCount).toBe(4);
    expect(report.risk.score).toBe(74);
    expect(report.risk.level).toBe('HIGH');

    expect(report.findings.some((f) => f.category === 'AUTH' && f.severity === 'HIGH')).toBe(true);
    expect(report.findings.some((f) => f.category === 'API_CONTRACT')).toBe(true);

    expect(report.suspiciousChanges.length).toBeGreaterThan(0);
    expect(report.timeline.length).toBeGreaterThan(0);

    expect(report.blastRadiusMap['src/middleware/auth.ts'].totalConsumers).toBe(7);
    expect(report.blastRadiusMap['src/middleware/auth.ts'].level).toBe('HIGH');
  });
});
