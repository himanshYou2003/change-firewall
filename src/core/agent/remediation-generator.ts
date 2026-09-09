import type {
  ASTDiff,
  BehavioralFinding,
  BlastRadius,
  BrokenInvariant,
  SymbolicFailureTrace,
} from '../../types/index.js';

export interface RemediationPromptResult {
  safeFixPrompt: string;
  minimalFixPrompt: string;
  prDescription: string;
  hasIssues: boolean;
  totalIssuesCount: number;
}

/**
 * Deterministically generates high-precision, zero-hallucination prompts
 * for AI coding agents to remediate detected contract shifts and runtime crashes.
 */
export function generateRemediationPrompt(
  findings: BehavioralFinding[],
  symbolicTraces: SymbolicFailureTrace[] = [],
  blastRadiusMap: Record<string, BlastRadius> = {},
  brokenInvariants: BrokenInvariant[] = []
): RemediationPromptResult {
  const highOrCriticalFindings = findings.filter(
    (f) => f.severity === 'CRITICAL' || f.severity === 'HIGH'
  );

  const mediumFindings = findings.filter((f) => f.severity === 'MEDIUM');

  const totalIssuesCount =
    highOrCriticalFindings.length +
    symbolicTraces.length +
    brokenInvariants.length;

  if (totalIssuesCount === 0 && mediumFindings.length === 0) {
    const cleanPrompt = 'All changes conform to expected behavioral contracts. No remediation needed.';
    return {
      safeFixPrompt: cleanPrompt,
      minimalFixPrompt: cleanPrompt,
      prDescription: generateCleanPrDescription(),
      hasIssues: false,
      totalIssuesCount: 0,
    };
  }

  // 1. Group issues by file
  interface FileIssueSummary {
    filePath: string;
    missingDefaults: Array<{
      symbol: string;
      paramName?: string;
      beforeSig?: string;
      afterSig?: string;
      evidence?: string;
    }>;
    otherFindings: BehavioralFinding[];
    crashes: SymbolicFailureTrace[];
    invariants: BrokenInvariant[];
    callers: string[];
  }

  const issuesByFile: Record<string, FileIssueSummary> = {};

  function getOrCreateFileSummary(fp: string): FileIssueSummary {
    const norm = fp.replace(/\\/g, '/');
    if (!issuesByFile[norm]) {
      const blast = blastRadiusMap[fp] || blastRadiusMap[norm];
      issuesByFile[norm] = {
        filePath: norm,
        missingDefaults: [],
        otherFindings: [],
        crashes: [],
        invariants: [],
        callers: blast ? blast.directDependents : [],
      };
    }
    return issuesByFile[norm];
  }

  // Populate findings
  for (const f of [...highOrCriticalFindings, ...mediumFindings]) {
    const summary = getOrCreateFileSummary(f.filePath);

    // Detect if this is an export signature change with added parameters
    const signatureEvidence = f.evidence.find(
      (e) => e.includes('Exported signature') || e.includes('Before:') || e.includes('After:')
    );

    const isContractShift =
      f.category === 'FUNCTION_CONTRACT' ||
      f.title.includes('Contract Changed') ||
      f.title.includes('Signature');

    if (isContractShift && signatureEvidence) {
      const beforeLine = f.evidence.find((e) => e.includes('Before:')) || '';
      const afterLine = f.evidence.find((e) => e.includes('After:')) || '';

      const symName = f.title.replace(/.*:\s*/, '').trim();

      summary.missingDefaults.push({
        symbol: symName,
        beforeSig: beforeLine.replace(/.*Before:\s*/, '').trim(),
        afterSig: afterLine.replace(/.*After:\s*/, '').trim(),
        evidence: f.evidence.join('; '),
      });
    } else {
      summary.otherFindings.push(f);
    }
  }

  // Populate symbolic crashes
  for (const trace of symbolicTraces) {
    const summary = getOrCreateFileSummary(trace.sourceFile);
    summary.crashes.push(trace);
  }

  // Populate broken invariants
  for (const inv of brokenInvariants) {
    const summary = getOrCreateFileSummary(inv.symbolOrFile);
    summary.invariants.push(inv);
  }

  // 2. Build Safe Fix Prompt (Comprehensive)
  const safeLines: string[] = [];
  safeLines.push('You are pair-programming with me to resolve behavioral regressions and contract shifts detected by Change Firewall.');
  safeLines.push('Please apply the following surgical, backwards-compatible fixes:');
  safeLines.push('');

  let stepNumber = 1;

  for (const [filePath, summary] of Object.entries(issuesByFile)) {
    safeLines.push(`### Step ${stepNumber++}: Fix in \`${filePath}\``);

    if (summary.missingDefaults.length > 0) {
      safeLines.push('**Solution A: Make Added Parameters Optional with Default Values (Best Practice):**');
      safeLines.push('The following exported functions had new parameters added without default values. Provide default values (e.g. `= null`) so legacy callers do not break:');

      for (const item of summary.missingDefaults) {
        if (item.beforeSig && item.afterSig) {
          safeLines.push(`- **\`${item.symbol}\`**:`);
          safeLines.push(`  - Current signature: \`${item.afterSig}\``);
          safeLines.push(`  - Required fix: Provide safe default value (e.g. \`= null\`) so legacy callers matching \`${item.beforeSig}\` continue to work.`);
        } else {
          safeLines.push(`- **\`${item.symbol}\`**: Add default parameter values (\`= null\`) to preserve compatibility.`);
        }
      }

      safeLines.push('*(Once defaulted, Change Firewall classifies these as backwards-compatible extensions (LOW), dropping contract drift penalty to 0).*');

      if (summary.callers.length > 0) {
        const callerList = summary.callers.slice(0, 4).map((c) => `\`${c}\``).join(', ');
        safeLines.push(`  *Affected downstream callers that rely on backwards-compatibility:* ${callerList}${summary.callers.length > 4 ? '...' : ''}.`);
      }
      safeLines.push('');
    }

    if (summary.crashes.length > 0) {
      safeLines.push('**Prevent Runtime Exceptions / Crashes:**');
      for (const crash of summary.crashes) {
        safeLines.push(`- **Simulated Failure**: \`${crash.simulatedException}\` triggered in \`${crash.consumerFile}${crash.consumerLine ? `:${crash.consumerLine}` : ''}\`.`);
        if (crash.preventativeFix) {
          safeLines.push(`  - **Fix instruction**: ${crash.preventativeFix}.`);
        }
      }
      safeLines.push('');
    }

    if (summary.invariants.length > 0) {
      safeLines.push('**Restore Broken Contract Invariants:**');
      for (const inv of summary.invariants) {
        safeLines.push(`- Invariant \`${inv.rule}\` was broken for \`${inv.symbolOrFile}\` (${inv.mutation}). Restore the baseline contract.`);
      }
      safeLines.push('');
    }

    if (summary.otherFindings.length > 0) {
      safeLines.push('**Address Behavioral Finding(s):**');
      for (const ofind of summary.otherFindings) {
        safeLines.push(`- [${ofind.severity}] **${ofind.title}**: ${ofind.recommendation}`);
      }
      safeLines.push('');
    }
  }

  safeLines.push('### Strict Constraints:');
  safeLines.push('1. Do NOT modify the public export interfaces of files outside this scope.');
  safeLines.push('2. Do NOT remove existing functionality or change return types.');
  safeLines.push('3. Keep all modifications backwards-compatible with existing downstream consumers.');
  safeLines.push('4. Ensure all unit and integration tests continue to pass.');

  const safeFixPrompt = safeLines.join('\n');

  // 3. Build Minimal Fix Prompt (Compact 3-5 bullets)
  const minLines: string[] = [];
  minLines.push('Fix the following contract shifts to ensure 100% backwards compatibility:');
  for (const [filePath, summary] of Object.entries(issuesByFile)) {
    if (summary.missingDefaults.length > 0) {
      const symNames = summary.missingDefaults.map((m) => `\`${m.symbol}\``).join(', ');
      minLines.push(`- In \`${filePath}\`: Add safe default values (\`= null\`) to newly added parameters in ${symNames}.`);
    }
    for (const crash of summary.crashes) {
      minLines.push(`- In \`${crash.consumerFile}\`: Guard against \`${crash.simulatedException}\`.`);
    }
    for (const ofind of summary.otherFindings.slice(0, 2)) {
      minLines.push(`- In \`${filePath}\`: ${ofind.recommendation}`);
    }
  }
  minLines.push('- Do not alter unrelated files and keep all existing caller contracts intact.');
  const minimalFixPrompt = minLines.join('\n');

  // 4. Build Professional PR Description
  const prDescription = generatePrDescriptionFromData(issuesByFile, findings, symbolicTraces);

  return {
    safeFixPrompt,
    minimalFixPrompt,
    prDescription,
    hasIssues: true,
    totalIssuesCount,
  };
}

function generateCleanPrDescription(): string {
  return [
    '## 🚀 Behavioral Changes & Verification Summary',
    '',
    '### Executive Summary',
    'All code modifications were analyzed by Change Firewall and verified to be safe with zero breaking contract regressions.',
    '',
    '### Verification Status',
    '- **Runtime Crashes Proven**: 0',
    '- **Contract Invariants**: All intact',
    '- **Downstream Blast Radius**: Localized without breaks',
    '- **Merge Status**: ✅ SAFE TO MERGE',
  ].join('\n');
}

function generatePrDescriptionFromData(
  issuesByFile: Record<string, any>,
  findings: BehavioralFinding[],
  symbolicTraces: SymbolicFailureTrace[]
): string {
  const prLines: string[] = [];
  prLines.push('## 🚀 Behavioral Changes & Verification Summary');
  prLines.push('');
  prLines.push('### Overview');
  prLines.push('This PR includes updates evaluated by **Change Firewall** behavior and blast radius analysis.');
  prLines.push('');

  prLines.push('### 📋 Contract & Interface Updates');
  for (const [file, summary] of Object.entries(issuesByFile)) {
    if (summary.missingDefaults.length > 0) {
      prLines.push(`- **\`${file}\`**: Extended exported signatures for: ${summary.missingDefaults.map((m: any) => `\`${m.symbol}\``).join(', ')}.`);
    }
  }
  if (findings.length > 0) {
    for (const f of findings.slice(0, 5)) {
      prLines.push(`- **${f.filePath}**: ${f.title} (${f.severity} severity)`);
    }
  }
  prLines.push('');

  prLines.push('### 🛡️ Downstream Impact & Blast Radius');
  const allCallers = new Set<string>();
  for (const summary of Object.values(issuesByFile)) {
    for (const c of summary.callers) {
      allCallers.add(c);
    }
  }

  if (allCallers.size > 0) {
    prLines.push(`- **Total Downstream Consumers Verified**: ${allCallers.size} caller module(s).`);
    prLines.push(`- **Affected Consumer Files**: ${Array.from(allCallers).slice(0, 6).map((c) => `\`${c}\``).join(', ')}${allCallers.size > 6 ? '...' : ''}.`);
  } else {
    prLines.push('- **Blast Radius**: Localized module changes with zero external consumers affected.');
  }
  prLines.push('');

  prLines.push('### ⚠️ Action Required Before Merge');
  if (symbolicTraces.length > 0) {
    prLines.push(`- Resolve ${symbolicTraces.length} runtime crash scenario(s) identified in consumer call sites.`);
  } else {
    prLines.push('- Ensure newly added function parameters default gracefully to maintain backwards compatibility.');
  }
  prLines.push('- Run local test suites to verify integration stability.');

  return prLines.join('\n');
}
