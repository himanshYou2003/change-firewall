<div align="center">
  <img src="./assets/icon.png" alt="Change Firewall Logo" width="120" height="120" />
  <h1>Change Firewall ⚡</h1>
  <p><strong>Your AI wrote the code. Change Firewall tells you what it actually broke.</strong></p>

  <p>
    <a href="https://change-firewall.vercel.app/"><strong>🌐 Live Web App & Simulator: change-firewall.vercel.app</strong></a>
  </p>

  [![Website](https://img.shields.io/badge/Website-change--firewall.vercel.app-06b6d4?style=flat-square&logo=vercel)](https://change-firewall.vercel.app/)
  [![npm version](https://img.shields.io/npm/v/change-firewall.svg?style=flat-square&color=3b82f6)](https://www.npmjs.com/package/change-firewall)
  [![npm downloads](https://img.shields.io/npm/dm/change-firewall.svg?style=flat-square&color=10b981)](https://www.npmjs.com/package/change-firewall)
  [![license](https://img.shields.io/npm/l/change-firewall.svg?style=flat-square)](https://github.com/himanshYou2003/change-firewall/blob/main/LICENSE)
  [![node version](https://img.shields.io/node/v/change-firewall.svg?style=flat-square)](https://nodejs.org)
</div>

A local-first developer tool, CLI, and TypeScript engine that translates raw Git diffs into **behavior-aware change reports, downstream blast-radius mapping, and deterministic risk scores (0–100)**. Native Model Context Protocol (MCP) server for Claude, Antigravity, Cursor, and Windsurf.

---

## 📑 Table of Contents
- [❓ Why Use Change Firewall?](#-why-use-change-firewall)
  - [The Core Problem (Intent vs Consequences)](#the-core-problem-intent-vs-consequences)
  - [Git Diff vs Change Firewall](#git-diff-vs-change-firewall)
- [🚀 Quick Start (Zero Install)](#-quick-start-zero-install)
- [📦 Installation Options](#-installation-options)
- [🛠️ CLI Command Reference & Flags](#️-cli-command-reference--flags)
  - [1. `change-firewall` (Default Analysis)](#1-change-firewall-default-analysis)
  - [2. `change-firewall interactive` (or `inspect`) (TUI Inspector)](#2-change-firewall-interactive-or-inspect-tui-inspector)
  - [3. `change-firewall preflight` (or `gate`) (CI/CD Merge Gate)](#3-change-firewall-preflight-or-gate-cicd-merge-gate)
  - [4. `change-firewall graph <file>` (Architectural Behavior Graph)](#4-change-firewall-graph-file-architectural-behavior-graph)
  - [5. `change-firewall memory` (Persistent Invariant Memory)](#5-change-firewall-memory-persistent-invariant-memory)
  - [6. `change-firewall audit-agent` (AI Intent vs Reality Verifier)](#6-change-firewall-audit-agent-ai-intent-vs-reality-verifier)
  - [7. `change-firewall impact <file>` (Blast Radius)](#7-change-firewall-impact-file-blast-radius)
  - [8. `change-firewall why <file>` (Architectural Role)](#8-change-firewall-why-file-architectural-role)
  - [9. `change-firewall watch` (Live Monitoring)](#9-change-firewall-watch-live-monitoring)
  - [10. `change-firewall open` (Dashboard Server)](#10-change-firewall-open-dashboard-server)
  - [11. `change-firewall demo` (Simulation Mode)](#11-change-firewall-demo-simulation-mode)
  - [12. `change-firewall mcp` (Model Context Protocol)](#12-change-firewall-mcp-model-context-protocol)
- [🧬 v0.3.0 Advanced Intelligence, Crash Simulation & Remediation Center](#-v030-advanced-intelligence-crash-simulation--remediation-center)
  - [11-Dimensional Behavioral Fingerprint Matrix](#11-dimensional-behavioral-fingerprint-matrix)
  - [Symbolic Runtime Crash Proof (Zero Guesswork)](#symbolic-runtime-crash-proof-zero-guesswork)
  - [Crash Simulation Sandbox & Live Impact Visualizer](#crash-simulation-sandbox--live-impact-visualizer)
  - [Deterministic AI Agent Remediation Command Center](#deterministic-ai-agent-remediation-command-center)
  - [Responsive Scrollable Tabs Navigation Bar](#responsive-scrollable-tabs-navigation-bar)
- [💻 Programmatic Node.js / TypeScript API](#-programmatic-nodejs--typescript-api)
  - [`analyzeChanges()`](#1-analyzechanges)
  - [`evaluatePreflight()`](#2-evaluatepreflight)
  - [`computeBlastRadius()`](#3-computeblastradius)
  - [`startWatchMode()`](#4-startwatchmode)
  - [`createMcpServer()` / `startMcpServer()`](#5-createmcpserver--startmcpserver)
- [🤖 AI Coding Agent Self-Correction Loop & MCP](#-ai-coding-agent-self-correction-loop--mcp)
  - [🔌 Model Context Protocol (MCP) Server Setup](#-model-context-protocol-mcp-server-setup)
  - [🤖 Direct Agent Instructions (Claude Code, OpenAI Codex, Copilot)](#-direct-agent-instructions-claude-code-openai-codex-copilot)
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

---

### 1. `change-firewall` (Default Analysis)
> **The instant behavioral diff sanity check.**

#### ❓ Why should I use this command?
Standard Git diffs only show lines added and removed (`+10 / -4`), concealing runtime breaking changes. Run `npx change-firewall` whenever an AI assistant (or teammate) finishes writing code to immediately translate raw diffs into **runtime consequences, caller blast radiuses, and a deterministic 0–100 risk score** before committing or running tests.

```bash
# Standard terminal report
npx change-firewall

# Analyze and automatically open browser dashboard (http://localhost:4783)
npx change-firewall --open

# Analyze only staged changes (git add)
npx change-firewall --staged

# Compare against a target branch (e.g., origin/main) before opening a PR
npx change-firewall --base origin/main

# Output machine-readable JSON (ideal for AI agents or scripts)
npx change-firewall --json
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

### 2. `change-firewall interactive` (or `inspect`) (TUI Inspector)
> **The keyboard-driven terminal inspector.**

#### ❓ Why should I use this command?
When you want to thoroughly investigate every finding, expand downstream call stacks, review symbolic crash proofs, and copy auto-fix code **without leaving your shell** and **without opening a browser**. Your terminal history and scrollback are 100% preserved upon exit.

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
| `↓` / `↑` (or `j` / `k`) | **Browse Findings** | Scroll through detected behavioral shifts |
| `Tab` | **Call Stacks & Blast Radius** | Expand direct & indirect downstream consumers |
| `g` | **Architecture Graph** | Displays Unicode Behavior Graph tree directly in the TUI |
| `p` | **Symbolic Crash Proof** | Deterministic exception proof at exact caller line numbers |
| `f` | **11-D Fingerprint Matrix** | Active mutation vectors and multi-dimensional scores |
| `a` | **Auto-Fix Suggestion** | Instant 1-line code fix and Vitest test stub |
| `q` / `Ctrl+C` | **Quit** | Cleanly exits and restores normal terminal cursor & screen |

---

### 3. `change-firewall audit-agent` (AI Intent vs Reality Verifier)
> **The AI hallucination, stealth mutation, and intent grounding detector.**

#### ❓ Why should I use this command?
AI coding agents (Cursor, Claude, Copilot, Antigravity) frequently claim one thing in their prompt or PR title (e.g. *"Fix button padding and header colors"*), but secretly modify authentication guards, change public TypeScript types, or touch 15+ backend files.
Conversely, agents might claim changes were made that don't match the actual code changes at all.

`audit-agent` performs **Bidirectional Semantic Grounding** between what the AI claimed (`-i "..."`) and the **real TypeScript AST deltas**. If a deceptive, out-of-scope, or ungrounded claim is detected, it flags a **`🚨 STEALTH MUTATION`** and exits with code `1` to block the PR!

```bash
# 1. Audit a truthful, backwards-compatible intent prompt (Drift: 0% ALIGNED)
npx change-firewall audit-agent -i "extend getInsurers with optional customInsurers default parameter"

# 2. Audit a feature change with declared signature changes
npx change-firewall audit-agent -i "add real data to weightage calculator and update exported signatures"

# 3. Detect ungrounded/gibberish claims (Zero semantic overlap -> 70% Drift STEALTH MUTATION)
npx change-firewall audit-agent -i "have i added chinta ta ta tit it"

# 4. Automated GitHub Actions usage (audits against the PR title)
npx change-firewall audit-agent -i "${{ github.event.pull_request.title }}"
```

#### 🎯 How to Prompt `audit-agent` the Right Way

##### 1. Understanding Bidirectional Semantic Grounding
`audit-agent` extracts **substantive tokens** by stripping away conversational filler and auxiliary verbs (`have`, `did`, `added`, `is`, `we`, `i`, `the`, etc.). The engine then verifies bidirectional alignment:
- **Grounding Verification**: The substantive tokens in your prompt **must** have semantic overlap with the modified files, exported symbols, or architectural roles. If an intent claim shares 0 substantive keywords with the actual changes, Change Firewall flags an **`Unrelated Intent Claim`** with a **+70 penalty**, instantly triggering `STEALTH_MUTATION` and blocking the merge.
- **Unannounced Contract Shifts**: If public export contracts or function signatures are modified, but the prompt does not declare contract or signature changes, each unannounced breaking change incurs a **+35 penalty**.

##### 2. Solution A: Best Practice for Adding Parameters to Existing Functions
When an agent or developer adds new parameters to an existing exported function, existing callers throughout the codebase can break if the new parameter is mandatory:

```typescript
// ❌ Dangerous (Breaking Contract Change - Triggers HIGH Contract Shift):
export function getInsurers(channel: string, customInsurers: string[])

// ✅ Solution A (Backwards-Compatible Extension - 0% Contract Drift Penalty):
export function getInsurers(channel: string, customInsurers: string[] = [])
```

> **Why Solution A Works**: Giving new parameters a default value (`= null`, `= []`, or `= {}`) ensures existing callers continue functioning without modification. Change Firewall classifies this as a `LOW` backwards-compatible extension, resulting in **zero contract drift penalty**.

##### 3. Prompting DOs and DON'Ts

| Pattern | Prompt Example | Result & Why |
| :--- | :--- | :--- |
| 🟢 **DO (Specific & Truthful)** | `npx change-firewall audit-agent -i "extend getInsurers with optional customInsurers default parameter"` | **ALIGNED (0% Drift)**: Declares the exact symbol modified and specifies backwards-compatible intent. |
| 🟢 **DO (Declare Contract Changes)** | `npx change-firewall audit-agent -i "refactor calculateWeightage and update public export signatures"` | **ALIGNED / MINOR DRIFT**: Acknowledges signature shifts, so unannounced contract penalties are bypassed. |
| 🔴 **DON'T (Gibberish or Unrelated)** | `npx change-firewall audit-agent -i "have i added chinta ta ta tit it"` | **STEALTH_MUTATION (70% Drift)**: Substantive tokens have zero overlap with changed code. Flagged as ungrounded hallucination. |
| 🔴 **DON'T (Conceal Breaking Changes)** | `npx change-firewall audit-agent -i "minor tweak to weightage calculator"` | **STEALTH_MUTATION (100% Drift)**: Claiming a minor tweak while mutating 9 public export contracts incurs 9 × 35 = 315 penalty points. |

#### 📊 Drift Score & Verdicts:
* **`ALIGNED` (0% Drift)**: Code mutations strictly match stated intent (exit `0`).
* **`MINOR_DRIFT` (1–39% Drift)**: Minor auxiliary adjustments detected, but conforms to intent (exit `0`).
* **`HIGH_DRIFT` (40–59% Drift)**: Changes exceed declared scope. Review required (exit `1`).
* **`STEALTH_MUTATION` (≥60% Drift)**: Unannounced security, auth, database, contract alterations, or ungrounded claims (exit `1`).

---

### 4. `change-firewall preflight` (or `gate`) (CI/CD Merge Gate)
> **The automated merge-readiness gate for CI/CD pipelines.**

#### ❓ Why should I use this command?
Use this command in GitHub Actions, GitLab CI, or pre-commit hooks to prevent breaking changes from reaching `main`. It produces a deterministic yes/no decision with clear exit codes:
* **Exit Code `0`**: Approved / Safe to merge.
* **Exit Code `1`**: Blocked / High risk or broken contracts detected.

```bash
# Standard preflight gate (fails if risk > 60 or high-risk findings exist)
npx change-firewall preflight

# Concise CI alias
npx change-firewall gate

# Set a custom risk score threshold (0-100)
npx change-firewall preflight --max-risk 75

# Ignore high severity findings if overall score is below threshold
npx change-firewall preflight --no-fail-on-high

# Compare PR against base branch in CI
npx change-firewall preflight --base origin/main

# Emit JSON result for CI parsing & bot comments
npx change-firewall preflight --json
```

---

### 5. `change-firewall graph <file>` (Architectural Behavior Graph)
> **The architectural Behavior Graph and caller visualizer.**

#### ❓ Why should I use this command?
When you want to understand what a file does in the broader architecture and see every single component that imports it. It automatically categorizes the architectural role (`API_ROUTE`, `AUTH_BOUNDARY`, `DATABASE_MODEL`, `SERVICE`, `TEST_SUITE`, `EVENT_CONSUMER`) and renders a clean Unicode tree of callers and critical execution paths.

```bash
# Inspect behavior graph and critical execution flows for a file
npx change-firewall graph src/index.ts

# Inspect callers and dependencies for core types or routes
npx change-firewall graph src/types/index.ts
```

---

### 6. `change-firewall impact <file>` (Blast Radius)
> **The downstream blast-radius inspector.**

#### ❓ Why should I use this command?
Before you refactor, rename, or edit a shared function or service, run `impact` to know **who will be affected if you break it**. It calculates exact direct callers and multi-hop indirect dependents up to 3 levels deep.

```bash
npx change-firewall impact src/middleware/auth.ts
```

#### What It Displays:
* Direct dependents list (1 hop away).
* Transitive / indirect downstream consumers (2–3 hops away).
* Protected API routes impacted.
* Blast severity rating (`HIGH`, `MEDIUM`, `LOW`).

---

### 7. `change-firewall memory` (Persistent Invariant Memory)
> **Persistent contract baseline memory engine.**

#### ❓ Why should I use this command?
To protect stable legacy code from being silently broken. Change Firewall saves verified function signatures and types into `.firewall/memory/invariants.json`. If an AI assistant refactors a symbol that has been stable for dozens of commits, Change Firewall immediately flags a **Broken Historical Invariant**.

```bash
# Inspect memory status and verified baseline contracts
npx change-firewall memory status

# Record verified baseline contract snapshot at HEAD
npx change-firewall memory record

# Reset persistent memory
npx change-firewall memory reset
```

---

### 8. `change-firewall watch` (Live Monitoring)
> **Live background monitoring with real-time browser streaming.**

#### ❓ Why should I use this command?
When you are actively pair programming with an AI coding assistant (Cursor, Devin, Claude Code). Keep `watch` running in a terminal or on a second monitor. As the AI edits files, Change Firewall debounces changes, recalculates risk in milliseconds, and live-streams updates to your browser via Server-Sent Events (SSE) without page reloads!

```bash
# Start watch mode with auto-opened dashboard
npx change-firewall watch

# Watch mode on custom port without auto-opening browser
npx change-firewall watch -p 5000 --no-open
```

---

### 9. `change-firewall open` (Dashboard Server)
> **The local interactive web dashboard.**

#### ❓ Why should I use this command?
When you want a rich, graphical user interface to explore your changes. It launches an embedded web dashboard at `http://localhost:4783` featuring an interactive SVG/Canvas node graph where you can click files, inspect blast radiuses, and view side-by-side AST contract diffs.

```bash
npx change-firewall open
```

---

### 10. `change-firewall why <file>` (Architectural Role)
> **Architectural role and Git churn analysis.**

#### ❓ Why should I use this command?
To understand a file's history and risk profile before editing it. Combines Git churn frequency, author count, and downstream blast radius to explain why a file is sensitive.

```bash
npx change-firewall why src/services/userService.ts
```

---

### 11. `change-firewall demo` (Simulation Mode)
> **Interactive simulation sandbox.**

#### ❓ Why should I use this command?
When you want to see Change Firewall in action without making uncommitted changes to your own code. It runs a pre-built simulation of a real-world API contract break and launches the dashboard.

```bash
npx change-firewall demo
```

---

### 12. `change-firewall mcp` (Model Context Protocol)
> **Model Context Protocol (MCP) server for AI assistants.**

#### ❓ Why should I use this command?
Connects Change Firewall directly to AI coding tools (Claude Desktop, Google Antigravity, Cursor, Windsurf) over standard I/O using JSON-RPC 2.0. This allows AI assistants to autonomously inspect their own diffs, evaluate preflight gates, and self-heal breaking changes before you ever review them!

```bash
npx change-firewall mcp
```

```bash
npx change-firewall demo
```

---

### 12. `change-firewall mcp` (Model Context Protocol)
Starts the standard JSON-RPC 2.0 Model Context Protocol (MCP) server over standard input/output. Enables native integration into Claude Desktop, Google Antigravity, Cursor, and Windsurf:

```bash
npx change-firewall mcp
```

#### Exposed MCP Tools:
* **`analyze_changes`**: Performs AST behavioral diffing, caller blast radius mapping, and deterministic risk scoring (0–100).
* **`evaluate_preflight`**: Determines whether current changes are safe to merge, blocking on high-risk mutations.
* **`compute_blast_radius`**: Inspects direct consumers, indirect dependents, and affected routes for a specific file.
* **`explain_file_impact`**: Explains architectural role (middleware, route, service, model), historical git churn, and callers.
* **`get_behavior_graph`**: Retrieves architectural roles and cross-boundary critical paths (`Route -> Auth -> DB`).
* **`audit_agent_intent`**: Verifies stated AI prompt intent against uncommitted AST mutations to catch stealth changes.

#### Exposed MCP Prompts:
* **`change_firewall_audit`**: Guided prompt for agents to audit diffs and propose self-corrections before committing.

---

## 🧬 v0.3.0 Advanced Intelligence, Crash Simulation & Remediation Center

Change Firewall v0.3.0 introduces next-generation interactive diagnostic tools and remediation systems specifically engineered to catch silent breaks introduced by autonomous AI coding assistants and resolve them with zero manual friction:

### 1. 11-Dimensional Behavioral Fingerprint Matrix
Rather than relying on vague linter warnings or nondeterministic LLM reviews, every code delta is evaluated across an 11-dimensional behavioral matrix:
1. **API Contract**: Public endpoint return expressions and request payload signatures.
2. **Authorization**: Auth guard statements, role checks, and permission middleware.
3. **Data Shape**: Structural interface and type alias mutations.
4. **Nullability Widening**: Widening non-null returns to include `| null` or `| undefined`.
5. **Validation**: Schema parsing changes (Zod, Yup, Joi) rejecting existing payloads.
6. **Dependency**: Cross-module invocations and external package coupling.
7. **Database**: ORM model operations, queries, and migrations (Prisma, TypeORM, Drizzle).
8. **Event Flow**: Background message queues, emitters, and listeners.
9. **Error Semantics**: Throw expressions and error propagation branches.
10. **Performance**: Query loops, N+1 patterns, and heavy synchronous calls.
11. **Test Coverage**: Presence or absence of updated regression test suites.

### 2. Symbolic Runtime Crash Proof (Zero Guesswork)
When an API contract or function return is widened to null, Change Firewall **symbolically traces the AST of all downstream consumers**. It checks whether the consumer dereferences the returned value without an optional chaining guard (`?.`) or `if (!obj)` check.

If unguarded, Change Firewall generates a **mathematical proof chain** predicting the exact runtime failure:

```text
[SYMBOLIC CRASH PROOF (Zero Guesswork)]
Simulated Exception: TypeError: Cannot read properties of null (reading 'balance')
Origin:    src/services/account.ts (fetchAccount)
Crash Site: src/routes/account.ts:4
Proof Steps:
  ➔ 1. src/services/account.ts ➔ 'fetchAccount' contract widened to return null/undefined.
  ➔ 2. src/routes/account.ts:3 ➔ Invokes 'fetchAccount()' expecting a valid non-null object.
  ➔ 3. src/routes/account.ts:4 ➔ Direct unguarded access on nullable result: .balance
Auto-Fix Advice: Add optional chaining 'fetchAccount()?.balance' or a null guard check in src/routes/account.ts:3
```

**Zero False Positives**: If the caller already guards the call using `account?.balance` or `if (!account) return`, Change Firewall recognizes the guard and suppresses the alert.

### 3. Crash Simulation Sandbox & Live Impact Visualizer
The live dashboard (`npx change-firewall open`) includes an interactive sandbox to simulate runtime failures before changes are committed or merged:
* **Interactive Node Selection**: Click any finding or blast radius node to project how errors ripple upstream.
* **Simulated Runtime Terminal**: Displays realistic stack traces and production exception dumps directly inside the UI.
* **Visual Call Ladder**: Interactive breadcrumb chain displaying propagation paths: `Modified Source ➔ Dependent Consumer ➔ API Route / High Blast`.
* **Symbolic Crash Proof Accordion**: Deep inspection of AST failure preconditions and suggested automated regression tests.

### 4. Deterministic AI Agent Remediation Command Center
Never waste time writing lengthy prompts explaining contract shifts or behavioral bugs back to your AI assistant:
* **1-Click Clipboard Ready**: Instantly copy surgical remediation blueprints formatted specifically for **Cursor Composer**, **Claude Code**, **Google Antigravity**, and **GitHub Copilot**.
* **Three Precision Modes**:
  1. **Safe Backwards-Compatible Fix**: Enforces default parameters and preserves existing consumer contracts.
  2. **Minimal AST Patch**: Produces the smallest possible diff targeting only the broken AST nodes.
  3. **PR Remediation Summary**: Formats an executive GitHub PR comment documenting all regressions and verification steps.

### 5. Responsive Scrollable Tabs Navigation Bar
The dashboard features an ultra-smooth, high-density tab navigation bar:
* **`<` and `>` Scroll Arrows**: Seamless horizontal scrolling on any display size.
* **Mouse-Wheel Horizontal Scrolling**: Natural left/right wheel trackpad support.
* **Sleek Custom Scrollbar**: High-visibility scrollbar styling that never hides tabs or clips risk metrics.
* **Auto-Centering**: Clicking any tab smoothly auto-scrolls it into view.

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

### 5. `createMcpServer()` / `startMcpServer()`
Embed or start the Model Context Protocol (MCP) server directly in your custom Node.js application or test harness:

```typescript
import { createMcpServer, startMcpServer } from 'change-firewall';

// Option A: Start standard stdio MCP server for AI clients
await startMcpServer();

// Option B: Create McpServer instance for custom transports (e.g. SSE / testing)
const server = createMcpServer({ name: 'custom-firewall', version: '0.1.3' });
```

---

## 🤖 AI Coding Agent Self-Correction Loop & MCP

Change Firewall provides two integration models for AI coding assistants:

1. **Native Model Context Protocol (MCP)**: AI assistants directly discover and execute Change Firewall tools without needing raw terminal/shell access.
2. **Direct Agent Instructions (CLI / JSON Mode)**: Terminal-enabled agents run Change Firewall CLI commands to verify and self-correct their own code.

---

### 🔌 Model Context Protocol (MCP) Server Setup

Change Firewall exposes 4 native MCP tools (`analyze_changes`, `evaluate_preflight`, `compute_blast_radius`, `explain_file_impact`) and the `change_firewall_audit` prompt.

#### 1. Claude Desktop
Add Change Firewall to your `claude_desktop_config.json`:
* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux**: `~/.config/Claude/claude_desktop_config.json`

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
Add to your global configuration at `~/.gemini/config/mcp_config.json` (or within your project's `.agents/` plugin):

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
1. Navigate to **Cursor Settings > Features > MCP** (or Windsurf Settings).
2. Click **+ Add New MCP Server**.
3. Fill in:
   - **Name**: `change-firewall`
   - **Type**: `command` (stdio)
   - **Command**: `npx -y change-firewall mcp`

---

### 🤖 Direct Agent Instructions (Claude Code, OpenAI Codex, Copilot)

For agents with terminal access (like **Claude Code**, **Antigravity IDE**, **Cursor Agent**, **Aider**, or **OpenAI Codex / Copilot**), you can instruct the agent to run Change Firewall as an automated self-correction loop.

Add the following rules to your repository's `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, or `.cursorrules`:

```markdown
### Change Verification & Safety Protocol:
Before committing or completing any code change:
1. Run `npx change-firewall preflight --json` to evaluate merge safety.
2. If `readyToMerge` is false, inspect the `blockers` and `highRiskCount` in the output.
3. Automatically self-correct any breaking API contract mutations or missing test coverage.
4. For targeted inspection of affected callers, run `npx change-firewall impact <modified-file>`.
```

#### Sample JSON Output (`npx change-firewall analyze --json`):
```json
{
  "risk": {
    "score": 74,
    "level": "HIGH"
  },
  "summary": {
    "totalFilesChanged": 3,
    "behavioralChangesCount": 1
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

---

## 🔄 CI/CD & GitHub Actions Integration

Add Change Firewall to your PR verification pipeline to prevent high-risk behavioral changes from merging and automatically drop rich behavior reports into PR reviews.

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

## 🌐 Links & Resources

- **Official Web App & Visual Simulator**: [change-firewall.vercel.app](https://change-firewall.vercel.app/)
- **Interactive Documentation & IDE**: [change-firewall.vercel.app/docs](https://change-firewall.vercel.app/docs)
- **NPM Package**: [npmjs.com/package/change-firewall](https://www.npmjs.com/package/change-firewall)
- **GitHub Repository**: [github.com/himanshYou2003/change-firewall](https://github.com/himanshYou2003/change-firewall)

---

## 📄 License

MIT © [Himanshu](https://github.com/himanshYou2003)

---