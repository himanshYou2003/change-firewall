# Change Firewall — Complete Usage Guide & Command Reference

> **"Your AI can write the code. Change Firewall tells you what it actually changed."**

Change Firewall is a local-first, zero-AI-API developer tool and CLI for JavaScript/TypeScript projects. It analyzes Git diffs and translates raw syntax changes into **behavioral impact reports, downstream consumer blast radiuses, and deterministic risk scores**.

---

## Table of Contents
1. [Quick Start](#1-quick-start)
2. [Installation Options](#2-installation-options)
3. [Complete CLI Command Reference](#3-complete-cli-command-reference)
   - [`change-firewall analyze` (Default)](#a-change-firewall-analyze)
   - [`change-firewall interactive` / `inspect` (Terminal UI)](#b-change-firewall-interactive--inspect)
   - [`change-firewall preflight` / `gate` (Merge-Readiness Gate)](#c-change-firewall-preflight--gate)
   - [`change-firewall graph <file>` (Dependency & Caller Tree)](#d-change-firewall-graph-file)
   - [`change-firewall memory` (Architectural Invariant Baselines)](#e-change-firewall-memory)
   - [`change-firewall audit-agent` (AI Agent Intent vs Reality)](#f-change-firewall-audit-agent)
   - [`change-firewall watch` (Live AI Monitoring)](#g-change-firewall-watch)
   - [`change-firewall impact <file>` (Blast Radius Inspector)](#h-change-firewall-impact-file)
   - [`change-firewall why <file>` (Architectural Role & History)](#i-change-firewall-why-file)
   - [`change-firewall open` (Dashboard Server)](#j-change-firewall-open)
   - [`change-firewall demo` (Simulation Sandbox)](#k-change-firewall-demo)
   - [`change-firewall mcp` (Model Context Protocol Server)](#l-change-firewall-mcp)
4. [Programmatic Node.js / TypeScript API](#4-programmatic-nodejs--typescript-api)
5. [CI/CD & GitHub Actions Integration](#5-cicd--github-actions-integration)
6. [Git Pre-commit Hook (Husky)](#6-git-pre-commit-hook-husky)
7. [AI Coding Agent Self-Correction Loop & MCP](#7-ai-coding-agent-self-correction-loop--mcp)
8. [Real-World Testing Scenarios](#8-real-world-testing-scenarios)
9. [Symbolic Runtime Crash Proof Engine](#9-symbolic-runtime-crash-proof-engine)
10. [11-Dimensional Behavioral Fingerprint Matrix](#10-11-dimensional-behavioral-fingerprint-matrix)

---

## 1. Quick Start

Run this inside **any** JavaScript or TypeScript project with a Git repository:

```bash
# Analyze your working tree instantly
npx change-firewall
```

No account, no API key, and no configuration required.

---

## 2. Installation Options

### Option A: Zero-Install (`npx` — Recommended)
Always runs the latest published version on demand:
```bash
npx change-firewall
```

### Option B: Local Project Dependency
Install in your project to pin versioning for your team:
```bash
npm install --save-dev change-firewall
# or
pnpm add -D change-firewall
# or
yarn add -D change-firewall
```

Add convenience scripts to your `package.json`:
```json
"scripts": {
  "firewall": "change-firewall",
  "firewall:watch": "change-firewall watch",
  "preflight": "change-firewall preflight",
  "dashboard": "change-firewall open"
}
```

### Option C: Global Installation
```bash
npm install -g change-firewall
change-firewall
```

---

## 3. Complete CLI Command Reference

### A. `change-firewall analyze`
Analyzes uncommitted changes in your Git working tree. This is the default command.

```bash
# Basic terminal analysis
npx change-firewall

# Analyze and automatically open the interactive local dashboard
npx change-firewall --open

# Output machine-readable JSON for AI agents or scripts
npx change-firewall --json

# Analyze only staged changes (git add)
npx change-firewall --staged

# Compare against a specific base branch or commit (e.g., main or origin/main)
npx change-firewall --base origin/main

# Run dashboard on a custom port
npx change-firewall --open -p 5000
```

#### Flags:
| Flag | Description | Default |
|---|---|---|
| `--open` | Opens local browser dashboard automatically | `false` |
| `--json` | Outputs report as raw JSON | `false` |
| `-s, --staged` | Only inspect staged changes | `false` |
| `-b, --base <ref>` | Base commit or branch to compare against | `HEAD` |
| `-p, --port <number>`| Dashboard port | `4783` |

---

### B. `change-firewall interactive` / `inspect`
Launches an interactive, keyboard-navigated terminal inspector for reviewing behavioral findings and blast radiuses without opening a browser.

* **Navigation**: `↑` / `↓` or `j` / `k` to browse findings.
* **Inspect Details**: Press `Enter` on any finding to open evidence, recommendations, and blast radius.
* **Sort by Risk**: Press `s` to toggle between severity sorting and file path sorting.
* **Quit**: Press `q` or `Escape` to exit.

```bash
# Launch interactive terminal inspector
npx change-firewall interactive

# Alias
npx change-firewall inspect
```

---

### C. `change-firewall preflight` / `gate`
Evaluates whether current code changes are safe to merge. Enforces strict exit codes for CI/CD gates.

* **Exit Code `0`**: Approved / Safe to merge.
* **Exit Code `1`**: Blocked / Merge review required.

```bash
# Standard preflight gate (fails if risk > 60 or high-risk findings exist)
npx change-firewall preflight

# Alias
npx change-firewall gate

# Set a custom risk score threshold (0-100)
npx change-firewall preflight --max-risk 75

# Ignore high severity findings if overall score is below threshold
npx change-firewall preflight --no-fail-on-high

# Compare PR against base branch in CI
npx change-firewall preflight --base origin/main

# Emit JSON result for CI parsing
npx change-firewall preflight --json
```

#### Flags:
| Flag | Description | Default |
|---|---|---|
| `-m, --max-risk <number>` | Max acceptable risk score before blocking | `60` |
| `--no-fail-on-high` | Do not block solely on HIGH severity findings | `false` |
| `-b, --base <ref>` | Base branch/commit to diff against | `HEAD` |
| `-s, --staged` | Evaluate staged changes only | `false` |
| `--json` | Output preflight result as JSON | `false` |

---

### D. `change-firewall graph <file>`
Renders a Unicode ASCII call and dependency tree for a specific file. Visualizes both incoming callers (who consumes this file) and outgoing dependencies (what this file imports).

```bash
# Render call & dependency graph
npx change-firewall graph src/routes/user.ts
```

#### Example Output:
```text
┌── [DEPENDENCY GRAPH] ➔ src/routes/user.ts
│
├── ⬅️  CALLERS (Incoming dependents)
│   ├── src/server.ts
│   └── test/user-e2e.test.ts
│
└── ➡️  DEPENDENCIES (Outgoing imports)
    ├── src/services/account.ts
    └── src/middlewares/auth.ts
```

---

### E. `change-firewall memory`
Maintains an invariant memory baseline across Git commits. Detects if an AI coding assistant breaks a historically stable contract (e.g., modifying a function signature unchanged across 50+ commits).

```bash
# View current persistent invariant memory status
npx change-firewall memory status

# Record verified architectural baseline snapshot at HEAD
npx change-firewall memory record

# Reset persistent memory
npx change-firewall memory reset
```

---

### F. `change-firewall audit-agent`
Audits AI coding assistants by comparing their stated task intent prompt against actual AST code modifications to catch **stealth mutations**.

* **`ALIGNED` (0% Drift)**: Mutations precisely match declared prompt.
* **`MODERATE_DRIFT` (1–49% Drift)**: Minor ancillary changes detected.
* **`STEALTH_MUTATION` (≥50% Drift)**: Agent made unannounced contract or security changes. Exits with code `1`.

```bash
# Audit stated prompt against current uncommitted diffs
npx change-firewall audit-agent -i "Fix button padding and header colors"

# Machine-readable output for automated agent self-correction
npx change-firewall audit-agent -i "Refactor payment service" --json
```

---

### G. `change-firewall watch`
Runs in the background while you or an AI agent (Cursor, Claude Code, Copilot, Antigravity) edit code. 
* Automatically debounces rapid file modifications (350ms).
* Re-analyzes deltas (`Risk changed: 42 → 68`).
* Live-streams updates to your browser dashboard via **Server-Sent Events (SSE)** without refreshing.

```bash
# Start watch mode with auto-opened dashboard
npx change-firewall watch

# Watch mode on custom port without auto-opening browser
npx change-firewall watch -p 8080 --no-open
```

---

### H. `change-firewall impact <file>`
Performs deep blast-radius tracing for a specific file across the codebase.

```bash
npx change-firewall impact src/middleware/auth.ts
```

#### Output:
* Direct dependents list
* Transitive / indirect downstream consumers
* Protected API routes impacted
* Blast severity rating (`HIGH`, `MEDIUM`, `LOW`)

---

### I. `change-firewall why <file>`
Explains why a file matters to the system architecture and its historical stability.

```bash
npx change-firewall why src/services/userService.ts
```

#### Output:
* Architectural role (Authentication Middleware, Public Route, Service, Model, Test Suite)
* Consumer count & blast radius
* Git Churn analysis: total historical commits, high-churn warnings, unique contributors, and recent commits

---

### J. `change-firewall open`
Spins up the embedded local dashboard at `http://localhost:4783` loaded with the current working tree analysis.

```bash
npx change-firewall open
```

---

### K. `change-firewall demo`
Simulates the **Section 7 Golden Moment** scenario without needing a dirty Git tree.

```bash
# Launch demo with interactive browser dashboard
npx change-firewall demo

# Run demo in terminal only
npx change-firewall demo --no-open
```

---

### L. `change-firewall mcp`
Launches the native **Model Context Protocol (MCP)** server over standard input/output (`stdio`).

```bash
npx change-firewall mcp
```

Used by MCP hosts (**Claude Desktop**, **Google Antigravity**, **Cursor**, **Windsurf**) to discover and execute Change Firewall capabilities natively.

#### MCP Tools Provided:
* `analyze_changes`: Full Git working tree or staged diff behavioral analysis.
* `preflight`: Deterministic merge-readiness evaluation.
* `compute_blast_radius`: Downstream dependent and route mapping for a specific file.
* `explain_file_impact`: Architectural role, historical git churn, and callers.
* `get_behavior_graph`: Holistic call and dependency graph for any file.
* `audit_agent_intent`: Audits stated agent prompt against actual uncommitted diffs.
* `explain_file_impact`: Architectural role, historical git churn, and callers.

#### MCP Prompts Provided:
* `change_firewall_audit`: Direct guided prompt for models to audit diffs and propose self-corrections.

---

## 4. Programmatic Node.js / TypeScript API

You can integrate Change Firewall directly into your Node.js scripts, custom tools, or tests:

```typescript
import {
  analyzeChanges,
  evaluatePreflight,
  computeBlastRadius,
  buildDependencyGraph,
  startWatchMode,
} from 'change-firewall';

// 1. Analyze changes in current repository
const report = await analyzeChanges({
  cwd: process.cwd(),
  base: 'origin/main',
});

console.log(`Risk Score: ${report.risk.score} / 100 (${report.risk.level})`);
console.log(`Behavioral findings count: ${report.behavioralChangesCount}`);

for (const finding of report.findings) {
  console.log(`[${finding.severity}] ${finding.title} in ${finding.filePath}`);
  console.log(`  Evidence: ${finding.evidence.join(', ')}`);
  console.log(`  Consumers affected: ${finding.affectedFiles.length}`);
}

// 2. Evaluate preflight merge gate
const preflight = evaluatePreflight(report, { maxRisk: 60 });
if (!preflight.readyToMerge) {
  console.error('Merge blocked:', preflight.blockers);
  process.exit(1);
}

// 3. Inspect blast radius of a single file
const graph = await buildDependencyGraph(process.cwd());
const blast = computeBlastRadius('src/middleware/auth.ts', graph);
console.log(`Total downstream consumers: ${blast.totalConsumers}`);
```

---

## 5. CI/CD & GitHub Actions Integration

### Option A: Interactive PR Bot & Merge Gate (Recommended)

Creates an interactive branded PR summary comment on every pull request and halts the merge gate if high-risk regressions are detected:

Create `.github/workflows/change-firewall.yml`:

```yaml
name: Change Firewall

on:
  pull_request:
    branches: [ main, master, develop ]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  analyze-changes:
    name: Change Firewall
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history required to diff against target branch

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run Change Firewall Preflight
        id: firewall
        run: |
          set +e
          npx change-firewall preflight --base origin/${{ github.base_ref }} --json > change-firewall-report.json
          EXIT_CODE=$?
          echo "EXIT_CODE=$EXIT_CODE" >> "$GITHUB_ENV"
          exit 0

      - name: Post PR Summary Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            let reportData;
            try {
              reportData = JSON.parse(fs.readFileSync('change-firewall-report.json', 'utf8'));
            } catch (err) {
              console.log('No report generated:', err.message);
              return;
            }

            const { readyToMerge, score, highRiskCount, mediumRiskCount, blockers, recommendations } = reportData;

            const iconUrl = 'https://raw.githubusercontent.com/himanshYou2003/change-firewall/main/assets/icon.png';
            const statusBadge = readyToMerge
              ? '🟢 **PASS / READY TO MERGE**'
              : '🔴 **BLOCKED / REVIEW REQUIRED**';

            let comment = `### <img src="${iconUrl}" width="24" height="24" align="absmiddle" alt="Change Firewall" /> Change Firewall Report: ${statusBadge}\n\n`;

            comment += `| Metric | Value | Status |\n`;
            comment += `| :--- | :--- | :--- |\n`;
            comment += `| **Overall Risk Score** | \`${score} / 100\` | ${score > 60 ? '⚠️ High Risk' : score > 30 ? '🟡 Medium Risk' : '🟢 Safe'} |\n`;
            comment += `| **High-Risk Behavioral Shifts** | \`${highRiskCount}\` | ${highRiskCount > 0 ? '🚨 Attention Needed' : '✓ Clean'} |\n`;
            comment += `| **Medium-Risk Shifts** | \`${mediumRiskCount}\` | ${mediumRiskCount > 0 ? '⚠️ Review' : '✓ None'} |\n\n`;

            if (blockers && blockers.length > 0) {
              comment += `#### 🚨 Merge Blockers\n`;
              for (const b of blockers) {
                comment += `* ❌ ${b}\n`;
              }
              comment += '\n';
            }

            if (recommendations && recommendations.length > 0) {
              comment += `#### 💡 Recommendations\n`;
              for (const r of recommendations) {
                comment += `* ➔ ${r}\n`;
              }
              comment += '\n';
            }

            comment += `---\n`;
            comment += `<sub>⚡ Verified by <a href="https://change-firewall.vercel.app"><b>Change Firewall</b></a> • <i>Behavior-Aware Change Intelligence for AI-Generated Diffs</i></sub>`;

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: comment
            });

      - name: Enforce Merge Gate
        run: |
          if [ "$EXIT_CODE" -ne 0 ]; then
            echo "❌ Change Firewall blocked merge due to high-risk behavioral changes."
            exit 1
          fi
```

### Option B: Quick 1-Line Safety Check (Minimal)

For a minimal setup that simply fails the check without posting comments:

```yaml
name: Change Firewall Gate

on:
  pull_request:
    branches: [ main, master ]

jobs:
  firewall-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Run Preflight Gate
        run: npx change-firewall preflight --base origin/${{ github.base_ref }}
```

---

## 6. Git Pre-commit Hook (Husky)

Prevent risky or untested changes from being committed locally:

```bash
npx husky add .husky/pre-commit "npx change-firewall preflight --staged"
```

If an AI tool accidentally breaks an API contract or alters security middleware without adding tests, the commit is automatically blocked!

---

## 7. AI Coding Agent Self-Correction Loop & MCP

### A. Native MCP Setup (Claude Desktop, Google Antigravity, Cursor, Windsurf)

#### 1. Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}
```

#### 2. Google Antigravity
Add to `~/.gemini/config/mcp_config.json`:
```json
{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}
```

#### 3. Cursor & Windsurf
Add a new MCP server in your editor's MCP Settings:
* **Name**: `change-firewall`
* **Type**: `command` (stdio)
* **Command**: `npx -y change-firewall mcp`

---

### B. Direct Agent Instructions (Claude Code, OpenAI Codex, Copilot)

For agents with terminal access, add these instructions to your repository's `CLAUDE.md`, `AGENTS.md`, or `.cursorrules`:

```markdown
### Change Safety Verification:
Before finalizing code or asking for review:
1. Run `npx change-firewall preflight --json`.
2. If `readyToMerge` is false, inspect the blockers and self-correct any breaking API contracts or missing tests.
3. For specific caller impact, run `npx change-firewall impact <filepath>`.
```

#### Sample JSON Output (`npx change-firewall analyze --json`):
```json
{
  "risk": {
    "score": 74,
    "level": "HIGH"
  },
  "behavioralChangesCount": 1,
  "findings": [
    {
      "category": "API_CONTRACT",
      "title": "API Response Contract Mutated",
      "filePath": "src/routes/user.ts",
      "severity": "HIGH",
      "evidence": [
        "Return statement changed: return user -> return { user }",
        "7 client consumers depend on previous structure."
      ],
      "recommendation": "Update client response deserializers or revert wrapper."
    }
  ]
}
```

---

## 8. Real-World Testing Scenarios

Try these in your project to see Change Firewall in action:

| Scenario | Code Change | What Change Firewall Detects |
|---|---|---|
| **API Contract Wrap** | `return user` ➔ `return { user }` | Flags **API_CONTRACT** change, lists all client callers, warns of runtime breakage. |
| **Auth Guard Narrowing** | `if (!req.user)` ➔ `if (!req.user \|\| req.user.role !== 'admin')` | Flags **AUTH** shift, maps all affected downstream routes, checks for missing regression tests. |
| **Nullability Widening** | `getUser(id): User` ➔ `getUser(id): User \| null` | Flags **FUNCTION_CONTRACT** widening, warns that callers lack null guards. |
| **Validation Drift** | Added `zod.parse(req.body)` | Flags **VALIDATION** schema check, warns that previously accepted client payloads might now fail. |
| **Deleted Export** | Removed `export function legacyAuth()` | Flags **CRITICAL** deleted export, lists all files importing that symbol. |

---

## 9. Symbolic Runtime Crash Proof Engine

Unlike static linters or probabilistic LLMs, Change Firewall's symbolic engine mathematically proves runtime crashes before code is committed.

### How It Works:
1. **Source Widening Detection**: Detects when a function, API endpoint, or database query changes its return type from a non-nullable object to `T | null` or `T | undefined`.
2. **Backward-Slice Data Flow Walk**: Symbolically traverses the AST of all downstream consumers up to 3 hops deep.
3. **Guard Evaluation**: Checks whether each consumer uses optional chaining (`?.`), an `if (!res)` guard, or ternary checks.
4. **Crash Proof Chain**: If an unguarded property dereference or method invocation is detected, Change Firewall synthesizes the deterministic proof chain with exact file and line numbers.

#### Example Crash Proof:
```text
══════════════════════════════════════════════════════════════════
  SYMBOLIC RUNTIME CRASH PROOF (Zero Guesswork)
══════════════════════════════════════════════════════════════════
  Proven Exception: TypeError: Cannot read properties of null (reading 'balance')
  Origin:           src/services/account.ts:12 (fetchAccount)
  Crash Site:       src/routes/account.ts:4

  Proof Chain:
   1. src/services/account.ts:12  export const fetchAccount = () => null
   2. src/routes/account.ts:3     const account = fetchAccount();
   3. src/routes/account.ts:4     account.balance  ➔ 💥 Unguarded access on null

  Remediation:
   Add optional chaining 'account?.balance' or a guard 'if (!account) return;' in src/routes/account.ts:3
══════════════════════════════════════════════════════════════════
```

---

## 10. 11-Dimensional Behavioral Fingerprint Matrix

Every file change is projected across an 11-dimensional behavioral matrix to compute a deterministic confidence score (0–100%):

| Vector Dimension | Evaluation Criterion | Real-World Risk Mitigated |
| :--- | :--- | :--- |
| **API Contract** | Exported function signatures, route payloads, return shapes | Breaking mobile apps, frontend clients, and SDKs |
| **Authorization** | Auth guards, session checks, role requirements | Unauthenticated route exposure & privilege escalation |
| **Nullability** | Return type widening (`T \| null`, `T \| undefined`) | Production `TypeError` and unhandled exceptions |
| **Database & ORM** | Schema models, query filters, migration files | Missing columns, unindexed queries, data loss |
| **Event Flow** | EventEmitter, message brokers, pub/sub hooks | Dangling listeners, dropped jobs, silent message loss |
| **Data Validation** | Zod, Yup, Joi schema mutations | Rejecting valid client payloads or accepting malformed data |
| **State & Cache** | Redis keys, global stores, cache TTLs | Stale cache read errors or invalidated sessions |
| **Network & I/O** | HTTP clients, timeouts, fetch retry logic | Hanging connections, connection pool exhaustion |
| **Concurrency** | `async/await`, `Promise.all`, shared mutations | Race conditions, deadlock, unhandled promise rejections |
| **Resource Lifecycle**| Streams, file descriptors, child processes | Memory leaks and OS file descriptor exhaustion |
| **Secret Exposure** | Token formats, entropy analysis, `.env` references | Accidental commit of API keys or private credentials |

---

**NPM Package:** [https://www.npmjs.com/package/change-firewall](https://www.npmjs.com/package/change-firewall)  
**GitHub Repository:** [https://github.com/himanshYou2003/change-firewall](https://github.com/himanshYou2003/change-firewall)
