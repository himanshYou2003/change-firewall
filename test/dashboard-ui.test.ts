import { describe, it, expect } from 'vitest';
import { getDashboardHtml } from '../src/dashboard/ui.js';
import type { AnalysisReport } from '../src/types/index.js';

describe('Dashboard UI HTML Generation', () => {
  it('renders Crash Simulation Sandbox and AI Agent Remediation Command Center', () => {
    const mockReport: AnalysisReport = {
      timestamp: new Date().toISOString(),
      projectPath: '/test/project',
      totalFilesChanged: 1,
      linesAdded: 15,
      linesDeleted: 2,
      behavioralChangesCount: 1,
      risk: { score: 45, level: 'MEDIUM', factors: [] },
      findings: [],
      suspiciousChanges: [],
      timeline: [],
      blastRadiusMap: {},
      changedFiles: [],
      recommendations: [],
      symbolicTraces: [
        {
          id: 'trace-1',
          sourceFile: 'src/features/weightage/utils.js',
          sourceSymbol: 'getInsurers',
          consumerFile: 'src/pages/WeightageCalculatorPage.jsx',
          consumerLine: 45,
          failureType: 'UNCAUGHT_EXCEPTION',
          simulatedException: "TypeError: Missing required argument 'customInsurers' in call to 'getInsurers'",
          proofSteps: [
            "1. src/features/weightage/utils.js ➔ Added required parameter.",
            "2. src/pages/WeightageCalculatorPage.jsx:45 ➔ Invokes getInsurers without 2nd argument.",
          ],
          preventativeFix: "Provide default value 'customInsurers = null' in src/features/weightage/utils.js",
        },
      ],
      remediation: {
        safeFixPrompt: 'Fix in src/features/weightage/utils.js: Provide default value customInsurers = null',
        minimalFixPrompt: '- In utils.js: Add default customInsurers = null',
        prDescription: '## 🚀 Behavioral Changes & Verification Summary',
        hasIssues: true,
        totalIssuesCount: 1,
      },
    };

    const html = getDashboardHtml(mockReport);

    // Verify Crash Simulation Sandbox Elements
    expect(html).toContain('Crash Simulator');
    expect(html).toContain('id="crashes-count-badge"');
    expect(html).toContain('id="tab-crashes"');
    expect(html).toContain('id="crash-sandbox-container"');

    // Verify AI Agent Remediation Command Center Elements
    expect(html).toContain('remediation-command-center');
    expect(html).toContain('AI Agent Remediation Command Center');
    expect(html).toContain('id="btn-remed-safe"');
    expect(html).toContain('id="btn-remed-minimal"');
    expect(html).toContain('id="btn-remed-pr"');
    expect(html).toContain('id="copy-prompt-btn"');
    expect(html).toContain('id="remediation-prompt-text"');
    expect(html).toContain('id="cf-toast"');

    // Verify Script Functions & Handlers are Present
    expect(html).toContain('function renderCrashSandbox(');
    expect(html).toContain('function renderRemediationCommandCenter(');
    expect(html).toContain('window.copyActivePrompt = function(');
    expect(html).toContain('window.switchRemediationMode = function(');
  });
});
