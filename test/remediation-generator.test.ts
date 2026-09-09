import { describe, it, expect } from 'vitest';
import { generateRemediationPrompt } from '../src/core/agent/remediation-generator.js';
import type { BehavioralFinding, BlastRadius, SymbolicFailureTrace, BrokenInvariant } from '../src/types/index.js';

describe('AI Agent Remediation & PR Prompt Generator', () => {
  it('generates surgical, backwards-compatible prompts for missing default parameter contract shifts', () => {
    const findings: BehavioralFinding[] = [
      {
        id: 'find-1',
        category: 'FUNCTION_CONTRACT',
        title: 'Export Contract Changed: getInsurers',
        description: 'Exported interface for getInsurers changed, altering parameters for downstream callers.',
        filePath: 'src/features/weightage/utils.js',
        severity: 'HIGH',
        confidence: 0.89,
        evidence: [
          'Exported signature getInsurers modified:',
          'Before: getInsurers(channel)',
          'After:  getInsurers(channel, customInsurers)',
        ],
        blastRadius: ['src/features/weightage/calculate.js', 'src/pages/weightage/WeightageCalculatorPage.jsx'],
        recommendation: 'Audit call-sites to verify compatibility with the new contract.',
      },
      {
        id: 'find-2',
        category: 'FUNCTION_CONTRACT',
        title: 'Export Contract Changed: getProducts',
        description: 'Exported interface for getProducts changed.',
        filePath: 'src/features/weightage/utils.js',
        severity: 'HIGH',
        confidence: 0.89,
        evidence: [
          'Exported signature getProducts modified:',
          'Before: getProducts(channel, insurerId)',
          'After:  getProducts(channel, insurerId, customInsurers)',
        ],
        blastRadius: ['src/features/weightage/calculate.js'],
        recommendation: 'Audit call-sites.',
      },
    ];

    const blastRadiusMap: Record<string, BlastRadius> = {
      'src/features/weightage/utils.js': {
        filePath: 'src/features/weightage/utils.js',
        directDependents: [
          'src/features/weightage/calculate.js',
          'src/pages/weightage/WeightageCalculatorPage.jsx',
          'tests/weightage/weightage-utils.test.js',
        ],
        affectedRoutes: [],
        totalConsumers: 3,
        maxDepth: 2,
      },
    };

    const result = generateRemediationPrompt(findings, [], blastRadiusMap);

    expect(result.hasIssues).toBe(true);
    expect(result.totalIssuesCount).toBe(2);

    // 1. Safe fix prompt verification
    expect(result.safeFixPrompt).toContain('src/features/weightage/utils.js');
    expect(result.safeFixPrompt).toContain('`getInsurers`');
    expect(result.safeFixPrompt).toContain('`getProducts`');
    expect(result.safeFixPrompt).toContain('default values');
    expect(result.safeFixPrompt).toContain('= null');
    expect(result.safeFixPrompt).toContain('WeightageCalculatorPage.jsx');
    expect(result.safeFixPrompt).toContain('Strict Constraints:');

    // 2. Minimal fix prompt verification
    expect(result.minimalFixPrompt).toContain('src/features/weightage/utils.js');
    expect(result.minimalFixPrompt).toContain('`getInsurers`');
    expect(result.minimalFixPrompt).toContain('`getProducts`');

    // 3. PR Description verification
    expect(result.prDescription).toContain('Behavioral Changes & Verification Summary');
    expect(result.prDescription).toContain('src/features/weightage/utils.js');
    expect(result.prDescription).toContain('Total Downstream Consumers Verified');
  });

  it('generates crash mitigation instructions when symbolic failure traces are detected', () => {
    const traces: SymbolicFailureTrace[] = [
      {
        id: 'trace-1',
        sourceFile: 'src/features/weightage/utils.js',
        sourceSymbol: 'getInsurers',
        consumerFile: 'src/pages/weightage/WeightageCalculatorPage.jsx',
        consumerLine: 45,
        consumerSymbol: 'WeightageCalculatorPage',
        failureType: 'UNCAUGHT_EXCEPTION',
        simulatedException: "TypeError: Missing required argument 'customInsurers' in call to 'getInsurers'",
        proofSteps: [
          "1. src/features/weightage/utils.js ➔ 'getInsurers' signature updated to require 'customInsurers'.",
          "2. src/pages/weightage/WeightageCalculatorPage.jsx:45 ➔ Invokes 'getInsurers' with 1 argument(s).",
          "3. Runtime Evaluation ➔ Parameter evaluates to undefined.",
        ],
        preventativeFix: "Provide default value 'customInsurers = null' in src/features/weightage/utils.js",
      },
    ];

    const result = generateRemediationPrompt([], traces);

    expect(result.hasIssues).toBe(true);
    expect(result.totalIssuesCount).toBe(1);
    expect(result.safeFixPrompt).toContain('Prevent Runtime Exceptions / Crashes');
    expect(result.safeFixPrompt).toContain('TypeError');
    expect(result.safeFixPrompt).toContain('WeightageCalculatorPage.jsx:45');
    expect(result.safeFixPrompt).toContain("customInsurers = null");
  });

  it('handles clean working trees with zero issues gracefully', () => {
    const result = generateRemediationPrompt([], [], {});

    expect(result.hasIssues).toBe(false);
    expect(result.totalIssuesCount).toBe(0);
    expect(result.safeFixPrompt).toContain('All changes conform to expected behavioral contracts');
    expect(result.prDescription).toContain('SAFE TO MERGE');
  });
});
