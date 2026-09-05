# Change Firewall ⚡

[![npm version](https://img.shields.io/npm/v/change-firewall.svg?style=flat-square&color=3b82f6)](https://www.npmjs.com/package/change-firewall)
[![npm downloads](https://img.shields.io/npm/dm/change-firewall.svg?style=flat-square&color=10b981)](https://www.npmjs.com/package/change-firewall)
[![license](https://img.shields.io/npm/l/change-firewall.svg?style=flat-square)](https://github.com/himanshYou2003/change-firewall/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/change-firewall.svg?style=flat-square)](https://nodejs.org)

> **"Your AI wrote the code. Change Firewall tells you what it actually broke."**

A local-first developer tool, CLI, and TypeScript engine that translates raw Git diffs into **behavior-aware change reports, downstream blast-radius mapping, and deterministic risk scores (0–100)**.

---

## 📑 Table of Contents
- [❓ Why Use Change Firewall?](#-why-use-change-firewall)
  - [The Core Problem (Intent vs Consequences)](#the-core-problem-intent-vs-consequences)
  - [Git Diff vs Change Firewall](#git-diff-vs-change-firewall)
- [🚀 Quick Start (Zero Install)](#-quick-start-zero-install)
- [📦 Installation Options](#-installation-options)
- [🛠️ CLI Command Reference & Flags](#️-cli-command-reference--flags)
  - [1. `change-firewall` (Default Analysis)](#1-change-firewall-default-analysis)
  - [2. `change-firewall preflight` (Merge Gate)](#2-change-firewall-preflight-merge-gate)
  - [3. `change-firewall watch` (Live Monitoring)](#3-change-firewall-watch-live-monitoring)
  - [4. `change-firewall impact <file>` (Blast Radius)](#4-change-firewall-impact-file-blast-radius)
  - [5. `change-firewall why <file>` (Architectural Role)](#5-change-firewall-why-file-architectural-role)
  - [6. `change-firewall open` (Dashboard Server)](#6-change-firewall-open-dashboard-server)
  - [7. `change-firewall demo` (Simulation Mode)](#7-change-firewall-demo-simulation-mode)
- [💻 Programmatic Node.js / TypeScript API](#-programmatic-nodejs--typescript-api)
  - [`analyzeChanges()`](#1-analyzechanges)
  - [`evaluatePreflight()`](#2-evaluatepreflight)
  - [`computeBlastRadius()`](#3-computeblastradius)
  - [`startWatchMode()`](#4-startwatchmode)
- [🤖 AI Coding Agent Self-Correction Loop](#-ai-coding-agent-self-correction-loop)
- [🔄 CI/CD & GitHub Actions Integration](#-cicd--github-actions-integration)
- [🪝 Git Pre-Commit Hook (Husky)](#-git-pre-commit-hook-husky)
- [🧪 Real-World Behavioral Scenarios](#-real-world-behavioral-scenarios)
- [🛡️ Architecture & Deterministic Guarantees](#️-architecture--deterministic-guarantees)
- [🔒 Privacy & Local-First Philosophy](#-privacy--local-first-philosophy)
- [📄 License](#-license)

---

## ❓ Why Use Change Firewall?

### The Core Problem (Intent vs Consequences)

AI coding assistants (Cursor, Claude Code, GitHub Copilot, Devin, Antigravity) are rewriting software development. They can modify 20 files in under 5 seconds and report:

```text
✓ Authentication added
✓ Tests passing
✓ Build successful
```

**The summary tells you what the AI intended to do.** It does **not** tell you:
* What existing behavior secretly mutated?
* What API response contracts silently broke for downstream consumers?
* Which database models, routes, or callers depend on the changed code?
* What permissions or security assumptions shifted?

Tests only verify what they were originally written to test. Standard Git diffs only show line additions and deletions (`+1, -1`), concealing architectural ripple effects.

### Git Diff vs Change Firewall

Consider this innocent-looking change:

```diff
- return user;
+ return { user };
```

| Tool | What It Sees | Result |
|---|---|---|
| **Git Diff** | `1 line modified (+1, -1)` | Looks tiny and harmless. Developer approves PR. |
| **Change Firewall** | **🔴 HIGH RISK: API Response Contract Mutated**<br>• Endpoint: `GET /api/user`<br>• Before: `User`<br>• After: `{ user: User }`<br>• Blast Radius: `7 client consumers depend on this endpoint structure!`<br>• Action: Update client response deserializers or revert wrapper. | **Catches the breaking change before staging or production crashes!** |

---

## 🚀 Quick Start (Zero Install)

You do **not** need an account, an API key, or a cloud server. Run Change Firewall directly in **any** JavaScript or TypeScript Git repository:

```bash
npx change-firewall
```

Or analyze changes and open the interactive visual browser dashboard in one step:

```bash
npx change-firewall --open
```

---

## 📦 Installation Options

### Option A: Zero-Install (`npx` — Recommended)
Always runs the latest version on demand without polluting `node_modules`:
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
{
  "scripts": {
    "firewall": "change-firewall",
    "firewall:watch": "change-firewall watch",
    "preflight": "change-firewall preflight",
    "dashboard": "change-firewall open"
  }
}
```

### Option C: Global Installation
```bash
npm install -g change-firewall
change-firewall
```

---

## 🛠️ CLI Command Reference & Flags

### 1. `change-firewall` (Default Analysis)
Analyzes uncommitted changes in your Git working tree.

```bash
# Standard terminal report
npx change-firewall

# Analyze and automatically open browser dashboard (http://localhost:4783)
npx change-firewall --open

# Analyze only staged changes (git add)
npx change-firewall --staged

# Compare against a specific base branch or commit (e.g., origin/main)
npx change-firewall --base origin/main

# Output machine-readable JSON (great for AI agents or scripts)
npx change-firewall --json

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
| `-p, --port <number>` | Dashboard port | `4783` |

---

### 2. `change-firewall preflight` (Merge Gate)
Evaluates whether current code changes are safe to merge. Enforces strict exit codes for CI/CD gates.

* **Exit Code `0`**: Approved / Safe to merge.
* **Exit Code `1`**: Blocked / Merge review required.

```bash
# Standard preflight gate (fails if risk > 60 or high-risk findings exist)
npx change-firewall preflight

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

### 3. `change-firewall watch` (Live Monitoring)
Runs in the background while you or an AI agent (Cursor, Claude Code, Copilot, Antigravity) edit code:
* Automatically debounces rapid file modifications (350ms).
* Re-analyzes deltas on the fly (`Risk changed: 42 → 68`).
* Live-streams updates to your browser dashboard via **Server-Sent Events (SSE)** without page reloads.

```bash
# Start watch mode with auto-opened dashboard
npx change-firewall watch

# Watch mode on custom port without auto-opening browser
npx change-firewall watch -p 8080 --no-open
```

---

### 4. `change-firewall impact <file>` (Blast Radius)
Performs deep blast-radius tracing for a specific file across the codebase.

```bash
npx change-firewall impact src/middleware/auth.ts
```

#### What It Displays:
* Direct dependents list (1 hop away).
* Transitive / indirect downstream consumers (2–3 hops away).
* Protected API routes impacted.
* Blast severity rating (`HIGH`, `MEDIUM`, `LOW`).

---

### 5. `change-firewall why <file>` (Architectural Role)
Explains why a file matters to the system architecture and its historical stability.

```bash
npx change-firewall why src/services/userService.ts
```

#### What It Displays:
* Architectural role (Authentication Middleware, Public Route, Service, Model, Test Suite).
* Caller count & downstream consumers.
* Git Churn analysis: total historical commits, high-churn warnings, unique contributors, and recent commits.

---

### 6. `change-firewall open` (Dashboard Server)
Spins up the embedded local dashboard at `http://localhost:4783` loaded with the current working tree analysis.

```bash
npx change-firewall open
```

---

### 7. `change-firewall demo` (Simulation Mode)
Launches an interactive simulation of the Golden Moment scenario without requiring any uncommitted Git changes. Great for exploring the tool and dashboard features immediately:

```bash
npx change-firewall demo
```

---

## 💻 Programmatic Node.js / TypeScript API

Change Firewall exports a fully-typed JavaScript / TypeScript API for use in your custom tools, scripts, testing suites, or backend servers.

```typescript
import {
  analyzeChanges,
  evaluatePreflight,
  computeBlastRadius,
  buildDependencyGraph,
  startWatchMode,
} from 'change-firewall';
```

---

### 1. `analyzeChanges()`
Runs full behavioral analysis, AST diffing, and risk scoring on the repository.

```typescript
import { analyzeChanges } from 'change-firewall';

async function run() {
  const report = await analyzeChanges({
    cwd: process.cwd(),      // Project root path (defaults to process.cwd())
    // base: 'origin/main',  // Base ref to compare against (defaults to HEAD)
    // staged: false,        // True to analyze only staged files
  });

  console.log(`Repository: ${report.repoName} (${report.branch})`);
  console.log(`Risk Score: ${report.risk.score}/100 [${report.risk.level}]`);
  console.log(`Files Changed: ${report.summary.totalFilesChanged}`);
  console.log(`Behavioral Shifts: ${report.summary.behavioralChangeCount}`);

  // Inspect specific behavioral findings
  for (const finding of report.findings) {
    console.log(`\n[${finding.severity}] ${finding.title}`);
    console.log(`File: ${finding.filePath}`);
    console.log(`Confidence: ${finding.confidence}%`);
    console.log(`Evidence:`, finding.evidence);
    console.log(`Recommendation: ${finding.recommendation}`);
  }
}

run();
```

---

### 2. `evaluatePreflight()`
Evaluates an analysis report against merge safety rules.

```typescript
import { analyzeChanges, evaluatePreflight } from 'change-firewall';

async function checkMerge() {
  const report = await analyzeChanges({ cwd: process.cwd() });

  const preflight = evaluatePreflight(report, {
    maxRisk: 60,          // Maximum allowed risk score (0-100, default: 60)
    blockOnHighRisk: true, // Block if any HIGH severity finding exists (default: true)
    allowWarnings: true,   // Allow medium/low warnings if risk <= maxRisk
  });

  if (preflight.readyToMerge) {
    console.log('✅ Changes are safe to merge! Risk score:', preflight.riskScore);
    process.exit(0);
  } else {
    console.error('❌ MERGE BLOCKED:');
    preflight.blockers.forEach((b) => console.error(`  - 🛑 ${b}`));

    if (preflight.recommendations.length > 0) {
      console.log('\nRecommendations:');
      preflight.recommendations.forEach((r) => console.log(`  - 💡 ${r}`));
    }

    process.exit(1);
  }
}

checkMerge();
```

---

### 3. `computeBlastRadius()`
Calculates the downstream blast radius and caller hierarchy for any specific file.

```typescript
import { buildDependencyGraph, computeBlastRadius } from 'change-firewall';

async function checkImpact(targetFilePath: string) {
  // 1. Build project reverse import graph
  const { reverse } = await buildDependencyGraph(process.cwd());

  // 2. Traverse BFS up to 3 hops deep
  const blast = computeBlastRadius(targetFilePath, reverse, 3);

  console.log(`File: ${targetFilePath}`);
  console.log(`Total Consumers Affected: ${blast.totalDependents}`);
  console.log(`Direct Dependents:`, blast.directDependents);
  console.log(`Indirect Dependents (2-3 hops):`, blast.indirectDependents);

  if (blast.totalDependents > 5) {
    console.warn(`⚠️ High blast radius: ${blast.totalDependents} files depend on this!`);
  }
}

checkImpact('src/services/auth.ts');
```

---

### 4. `startWatchMode()`
Starts a debounced file watcher that serves live-streaming updates over SSE to the local dashboard.

```typescript
import { startWatchMode } from 'change-firewall';

async function runLiveWatcher() {
  const handle = await startWatchMode({
    cwd: process.cwd(),
    port: 4783,          // Dashboard port
    open: true,          // Automatically open browser
    debounceMs: 350,     // Debounce delay for rapid edits
    onUpdate: (report) => {
      // Triggered whenever code is modified
      console.log(`[${new Date().toLocaleTimeString()}] Tree updated!`);
      console.log(`Risk Score: ${report.risk.score}/100`);
      console.log(`Modified: ${report.diffs.map((d) => d.filePath).join(', ')}`);
    },
  });

  console.log(`Watcher active on port ${handle.port}`);

  // Clean shutdown
  process.on('SIGINT', async () => {
    await handle.stop();
    process.exit(0);
  });
}

runLiveWatcher();
```

---

## 🤖 AI Coding Agent Self-Correction Loop

AI coding tools (Cursor, Claude Code, GitHub Copilot, Antigravity) can consume Change Firewall's `--json` mode to **automatically audit and self-correct their own code** before asking for human approval:

```bash
npx change-firewall analyze --json
```

### Sample JSON Output:
```json
{
  "risk": {
    "score": 74,
    "level": "HIGH"
  },
  "summary": {
    "totalFilesChanged": 3,
    "behavioralChangeCount": 1
  },
  "findings": [
    {
      "category": "API_CONTRACT",
      "title": "API Response Contract Mutated",
      "filePath": "src/controllers/user.ts",
      "severity": "HIGH",
      "confidence": 92,
      "evidence": [
        "Return statement modified: return user -> return { user }",
        "7 client consumers depend on root-level User object structure."
      ],
      "affectedFiles": [
        "src/client/userClient.ts",
        "src/views/profile.tsx"
      ],
      "recommendation": "Update client response deserializers or revert wrapper."
    }
  ]
}
```

**How to prompt your AI agent:**
> *"Run `npx change-firewall analyze --json`. If any findings are returned with HIGH or MEDIUM severity, adjust the code to fix the contract mutations or update affected callers before completing the task."*

---

## 🔄 CI/CD & GitHub Actions Integration

Add Change Firewall to your PR verification pipeline to prevent high-risk behavioral changes from merging.

Create `.github/workflows/change-firewall.yml`:

```yaml
name: Change Firewall

on:
  pull_request:
    branches: [ main, master, develop ]

permissions:
  contents: read
  pull-requests: write

jobs:
  verify-changes:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history needed to compare against base branch

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Preflight Check
        run: npx change-firewall preflight --base origin/${{ github.base_ref }}
```

---

## 🪝 Git Pre-Commit Hook (Husky)

Catch accidental API contract breaks or relaxed permissions before they are even committed to Git:

```bash
npx husky add .husky/pre-commit "npx change-firewall preflight --staged"
```

If an AI tool breaks an API response contract or alters security middleware without adding tests, the commit is safely intercepted!

---

## 🧪 Real-World Behavioral Scenarios

| Scenario | Code Change | What Change Firewall Detects |
|---|---|---|
| **API Contract Wrapper** | `- return user;`<br>`+ return { user };` | Flags **API_CONTRACT** shift, lists all client callers, warns of runtime response shape mismatch. |
| **Auth Guard Relaxation** | `- if (user.role === 'admin')`<br>`+ if (user.role !== 'guest')` | Flags **AUTH** shift, maps all affected downstream routes, checks for missing regression tests. |
| **Nullability Widening** | `- function get(id: string): User`<br>`+ function get(id?: string): User \| null` | Flags **FUNCTION_CONTRACT** widening, warns that downstream callers lack null checks. |
| **Validation Drift** | `+ z.object({ email: z.string().email() }).parse(body)` | Flags **VALIDATION** schema check, warns that previously accepted client payloads might now fail. |
| **Deleted Export** | `- export function legacyAuth()` | Flags **CRITICAL** deleted export, lists all files importing that symbol. |

---

## 🛡️ Architecture & Deterministic Guarantees

Unlike tools that rely on remote LLMs to "guess" what changed, Change Firewall is **100% deterministic and grounded in compiler truth**:

```text
+-----------------------+     +--------------------------+     +-------------------------+
|   Working Tree Diff   | --> | TypeScript AST Analysis  | --> | Reverse Dependency Graph|
+-----------------------+     +--------------------------+     +-------------------------+
                                                                             │
                                                                             ▼
                                                               +-------------------------+
                                                               | Deterministic Risk Score|
                                                               |       (0 - 100)         |
                                                               +-------------------------+
```

1. **In-Memory Git Dual-Tree Inspection:** Directly compares your working tree files against `HEAD` in memory.
2. **Native TypeScript AST Diffing:** Uses the official TypeScript Compiler API (`ts.createSourceFile`) to inspect syntax trees, type signatures, return statements, and guard conditions.
3. **Static Reverse Dependency Graph:** Scans project imports and builds a reverse caller graph using BFS traversal to pinpoint the exact blast radius.
4. **Deterministic Risk Formula:** Combines behavioral severity, downstream caller counts, and historical Git churn into a transparent 0–100 score.

$$\text{Finding} + \text{Evidence} + \text{Blast Radius} + \text{Confidence} + \text{Actionable Recommendation}$$

---

## 🔒 Privacy & Local-First Philosophy

- 🚫 **No API Keys Required** — Works completely offline.
- 🚫 **Zero Code Uploads** — Your source code never leaves your computer.
- 🚫 **Zero External AI Hallucinations** — Analysis is backed by real compiler syntax trees and Git history.
- 💻 **Self-Contained** — Dashboard is served locally at `http://localhost:4783` with zero external dependencies.

---

## 📄 License

MIT © [Himanshu](https://github.com/himanshYou2003)
