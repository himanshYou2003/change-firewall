import type { AnalysisReport } from '../../types/index.js';

export function renderJsonReport(report: AnalysisReport): string {
  return JSON.stringify(report, null, 2);
}
