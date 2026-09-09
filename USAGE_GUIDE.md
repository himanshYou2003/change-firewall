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

---

### A. `change-firewall analyze` (Default Command)
> **The instant behavioral diff sanity check.**

#### ❓ Why should I use this command?
When an AI coding assistant (or teammate) finishes writing code, Git diff only shows lines added and removed (`+10 / -4`). It cannot tell you if an API contract broke or if 25 other files suddenly lost a required parameter. 
Run `npx change-firewall` to instantly translate raw code diffs into **runtime behavioral consequences, consumer blast radius, and a deterministic 0–100 risk score** before you test or commit.

#### 💻 How to Run It:
```bash
# Analyze uncommitted changes against Git HEAD
npx change-firewall

# Analyze and automatically open the visual web dashboard in your browser
npx change-firewall --open

# Only analyze files in the Git staging area (git add)
npx change-firewall --staged

# Compare against a target branch (e.g. main) before opening a PR
npx change-firewall --base origin/main

# Output raw JSON (for piping into AI agents or CI scripts)
npx change-firewall --json
```

#### 📊 How to Read the Output:
* **`Overall Risk: 20 / 100 [LOW RISK]`**: Deterministic risk score based on blast radius, contract shifts, and sensitivity.
* **`Behavioral Mutation`**: The primary classification of what happened (e.g., `DEPENDENCY SHIFT`, `CONTRACT MUTATION`, `PURE REFACTOR`).
* **`Consumers Affected`**: Total number of downstream files and routes that depend on the files you touched.
* **`BEHAVIORAL FINDINGS`**:
  * `🔴 HIGH`: Breaking change (removed parameter, altered return shape, deleted export).
  * `🟠 MEDIUM`: Widened types or altered error handling.
  * `🟡 LOW`: Non-breaking extension (e.g., optional parameter added).
* **`Recommended Action`**: Plain English advice on whether it's safe to merge or what downstream files to audit.

---

### B. `change-firewall interactive` (or `inspect`)
> **The keyboard-driven terminal inspector.**

#### ❓ Why should I use this command?
When you want to thoroughly investigate every finding, inspect downstream call stacks, and review mathematical crash proofs **without leaving your terminal** and **without opening a browser**. It uses an alternate screen buffer, meaning your shell history and scrollback are completely preserved when you exit.

#### 💻 How to Run It:
```bash
# Launch interactive terminal inspector
npx change-firewall inspect

# Or use the full command name
npx change-firewall interactive

# Inspect only staged changes
npx change-firewall inspect --staged
```

#### ⌨️ Keyboard Controls:
| Key | Tab View | What It Shows |
|---|---|---|
| `↓` / `↑` or `j` / `k` | **Browse Findings** | Scroll through detected behavioral shifts |
| `Tab` | **Call Stacks** | Expands full downstream caller list and blast radius |
| `g` | **Architecture Graph** | Displays Unicode Behavior Graph tree directly in the TUI |
| `p` | **Symbolic Crash Proof** | Traces deterministic runtime exception paths to exact line numbers |
| `f` | **11-D Fingerprint** | Shows the 11-dimensional behavioral matrix radar |
| `a` | **Auto-Fix & Test Stub** | Generates copy-pasteable TypeScript repair code & test stub |
| `q` or `Ctrl+C` | **Quit** | Cleanly exits and restores your terminal screen |

---

### C. `change-firewall audit-agent`
> **The AI intent vs reality verifier.**

#### ❓ Why should I use this command?
AI coding agents frequently claim one thing in their PR title (e.g. *"Fix button padding and header colors"*), but secretly modify authentication guards, change public TypeScript types, or touch 15+ backend files.
`audit-agent` parses what the AI claimed it did (`-i "..."`) and compares it against the **real TypeScript AST diffs**. If a deceptive or out-of-scope mutation occurred, it flags a **`🚨 STEALTH MUTATION`** and exits with code `1` to block the PR!

#### 💻 How to Run It:
```bash
# Audit an AI agent's stated intent against current uncommitted changes
npx change-firewall audit-agent -i "Fix button padding and header colors"

# Audit a truthful task prompt
npx change-firewall audit-agent -i "Update firewall contract memory and BehaviorRole type"

# Automated GitHub Actions usage (audits against the PR title)
npx change-firewall audit-agent -i "${{ github.event.pull_request.title }}"
```

#### 📊 How to Read the Output:
* **`Verdict: ✓ ALIGNED (Drift Score: 0%)`**: The code modifications strictly correspond to the stated task. Safe to proceed.
* **`Verdict: ℹ️ MINOR_DRIFT (1–39%)`**: Minor peripheral adjustments detected, but largely conforms to intent.
* **`Verdict: ⚠️ HIGH_DRIFT (40–59%)`**: Changes exceed the declared scope. Review required.
* **`Verdict: 🚨 STEALTH MUTATION (≥60%)`**: Critical mismatch! The agent claimed a safe task (like styling) but touched backend types, databases, or auth logic. Exits with code `1`.

---

### D. `change-firewall preflight` (or `gate`)
> **The automated merge-readiness gate for CI/CD pipelines.**

#### ❓ Why should I use this command?
Use this command in your GitHub Actions workflow, GitLab CI, or pre-commit hooks. It acts as an automated security and contract gate:
* **Exit Code `0`**: Approved / Safe to merge.
* **Exit Code `1`**: Blocked / High risk or broken contracts detected.

#### 💻 How to Run It:
```bash
# Standard preflight gate (fails if risk > 60 or high-severity findings exist)
npx change-firewall preflight

# Concise CI alias
npx change-firewall gate

# Set a custom risk threshold (e.g. strict threshold of 40)
npx change-firewall preflight --max-risk 40

# Compare pull request branch against main branch in CI
npx change-firewall preflight --base origin/main

# Output JSON report for automated bot comments
npx change-firewall preflight --json
```

---

### E. `change-firewall graph <file>`
> **The architectural Behavior Graph and caller visualizer.**

#### ❓ Why should I use this command?
When you want to understand what a file does in the broader architecture and see every single component that imports it. It automatically categorizes the architectural role (`API_ROUTE`, `AUTH_BOUNDARY`, `DATABASE_MODEL`, `SERVICE`, `TEST_SUITE`, `EVENT_CONSUMER`) and renders a clean Unicode tree of callers and critical execution paths.

#### 💻 How to Run It:
```bash
# Inspect architecture, incoming callers, and outgoing dependencies for a file
npx change-firewall graph src/index.ts

# Inspect callers for core types or routes
npx change-firewall graph src/types/index.ts
```

#### 📊 How to Read the Output:
* **`TARGET & ROLE`**: The file being analyzed and its architectural role (e.g., `INTERNAL LOGIC`, `API ROUTE`, `AUTH BOUNDARY`).
* **`CALLERS / CONSUMERS (Incoming)`**: Every file across your project that imports this file, complete with semantic role badges.
* **`DEPENDENCIES / BOUNDARIES (Outgoing)`**: What external boundaries and modules this file depends on.

---

### F. `change-firewall impact <file>`
> **The downstream blast-radius inspector.**

#### ❓ Why should I use this command?
Before you refactor, rename, or edit a shared function or service, run `impact` to know **who will be affected if you break it**. It calculates exact direct callers and multi-hop indirect dependents up to 3 levels deep.

#### 💻 How to Run It:
```bash
# Check blast radius before refactoring a core module
npx change-firewall impact src/core/parser/ast-parser.ts
```

#### 📊 What It Displays:
* **`Blast Severity`**: `HIGH`, `MEDIUM`, or `LOW`.
* **`Total Consumers`**: Total downstream files impacted.
* **`Direct Dependents`**: Files that directly import this target.
* **`Indirect Dependents`**: Transitive consumers affected downstream.
* **`Affected Routes`**: Any public HTTP endpoints impacted by changes to this file.

---

### G. `change-firewall memory`
> **Persistent contract baseline memory engine.**

#### ❓ Why should I use this command?
To protect stable legacy code from being silently broken. Change Firewall saves verified function signatures and types into `.firewall/memory/invariants.json`. If an AI assistant refactors a symbol that has been stable for dozens of commits, Change Firewall immediately flags a **Broken Historical Invariant**.

#### 💻 How to Run It:
```bash
# Check how many verified contracts are recorded and baseline commit
npx change-firewall memory status

# Record a verified baseline snapshot of all active exports at HEAD
npx change-firewall memory record

# Reset and purge memory to start fresh
npx change-firewall memory reset
```

---

### H. `change-firewall watch`
> **Live background monitoring with real-time browser streaming.**

#### ❓ Why should I use this command?
When you are actively pair programming with an AI coding assistant (Cursor, Devin, Claude Code). Keep `watch` running in a terminal or on a second monitor. As the AI edits files, Change Firewall debounces changes, recalculates risk in milliseconds, and live-streams updates to your browser via Server-Sent Events (SSE) without page reloads!

#### 💻 How to Run It:
```bash
# Start watch mode and open browser dashboard
npx change-firewall watch

# Custom port without auto-opening browser
npx change-firewall watch -p 5000 --no-open
```

---

### I. `change-firewall open`
> **The local interactive web dashboard.**

#### ❓ Why should I use this command?
When you want a rich, graphical user interface to explore your changes. It launches an embedded web dashboard at `http://localhost:4783` featuring an interactive SVG/Canvas node graph where you can click files, inspect blast radiuses, and view side-by-side AST contract diffs.

#### 💻 How to Run It:
```bash
npx change-firewall open
```

---

### J. `change-firewall why <file>`
> **Architectural role and Git churn analysis.**

#### ❓ Why should I use this command?
To understand a file's history and risk profile before editing it. Combines Git churn frequency, author count, and downstream blast radius to explain why a file is sensitive.

#### 💻 How to Run It:
```bash
npx change-firewall why src/index.ts
```

---

### K. `change-firewall demo`
> **Interactive simulation sandbox.**

#### ❓ Why should I use this command?
When you want to see Change Firewall in action without making uncommitted changes to your own code. It runs a pre-built simulation of a real-world API contract break and launches the dashboard.

#### 💻 How to Run It:
```bash
npx change-firewall demo
```

---

### L. `change-firewall mcp`
> **Model Context Protocol (MCP) server for AI assistants.**

#### ❓ Why should I use this command?
Connects Change Firewall directly to AI coding tools (Claude Desktop, Google Antigravity, Cursor, Windsurf) over standard I/O using JSON-RPC 2.0. This allows AI assistants to autonomously inspect their own diffs, evaluate preflight gates, and self-heal breaking changes before you ever review them!

#### 💻 How to Run It:
```bash
# Spawns stdio MCP server (normally invoked by AI tool configuration)
npx change-firewall mcp
```
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
