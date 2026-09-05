# Change Firewall — Complete Usage Guide & Command Reference

> **"Your AI can write the code. Change Firewall tells you what it actually changed."**

Change Firewall is a local-first, zero-AI-API developer tool and CLI for JavaScript/TypeScript projects. It analyzes Git diffs and translates raw syntax changes into **behavioral impact reports, downstream consumer blast radiuses, and deterministic risk scores**.

---

## Table of Contents
1. [Quick Start](#1-quick-start)
2. [Installation Options](#2-installation-options)
3. [Complete CLI Command Reference](#3-complete-cli-command-reference)
   - [`change-firewall analyze` (Default)](#a-change-firewall-analyze)
   - [`change-firewall preflight` (Merge-Readiness Gate)](#b-change-firewall-preflight)
   - [`change-firewall watch` (Live AI Monitoring)](#c-change-firewall-watch)
   - [`change-firewall impact <file>` (Blast Radius Inspector)](#d-change-firewall-impact-file)
   - [`change-firewall why <file>` (Architectural Role & History)](#e-change-firewall-why-file)
   - [`change-firewall open` (Dashboard Server)](#f-change-firewall-open)
   - [`change-firewall demo` (Golden Moment Simulation)](#g-change-firewall-demo)
   - [`change-firewall mcp` (Model Context Protocol Server)](#h-change-firewall-mcp)
4. [Programmatic Node.js / TypeScript API](#4-programmatic-nodejs--typescript-api)
5. [CI/CD & GitHub Actions Integration](#5-cicd--github-actions-integration)
6. [Git Pre-commit Hook (Husky)](#6-git-pre-commit-hook-husky)
7. [AI Coding Agent Self-Correction Loop & MCP](#7-ai-coding-agent-self-correction-loop--mcp)
8. [Real-World Testing Scenarios](#8-real-world-testing-scenarios)

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

### B. `change-firewall preflight`
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

### C. `change-firewall watch`
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

### D. `change-firewall impact <file>`
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

### E. `change-firewall why <file>`
Explains why a file matters to the system architecture and its historical stability.

```bash
npx change-firewall why src/services/userService.ts
```

#### Output:
* Architectural role (Authentication Middleware, Public Route, Service, Model, Test Suite)
* Consumer count & blast radius
* Git Churn analysis: total historical commits, high-churn warnings, unique contributors, and recent commits

---

### F. `change-firewall open`
Spins up the embedded local dashboard at `http://localhost:4783` loaded with the current working tree analysis.

```bash
npx change-firewall open
```

---

### G. `change-firewall demo`
Simulates the **Section 7 Golden Moment** scenario without needing a dirty Git tree.

```bash
# Launch demo with interactive browser dashboard
npx change-firewall demo

# Run demo in terminal only
npx change-firewall demo --no-open
```

---

### H. `change-firewall mcp`
Launches the native **Model Context Protocol (MCP)** server over standard input/output (`stdio`).

```bash
npx change-firewall mcp
```

Used by MCP hosts (**Claude Desktop**, **Google Antigravity**, **Cursor**, **Windsurf**) to discover and execute Change Firewall capabilities natively.

#### MCP Tools Provided:
* `analyze_changes`: Full Git working tree or staged diff behavioral analysis.
* `evaluate_preflight`: Deterministic merge-readiness evaluation.
* `compute_blast_radius`: Downstream dependent and route mapping for a specific file.
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

Create `.github/workflows/change-firewall.yml` in your repository:

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
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run Change Firewall Preflight
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

**NPM Package:** [https://www.npmjs.com/package/change-firewall](https://www.npmjs.com/package/change-firewall)  
**GitHub Repository:** [https://github.com/himanshYou2003/change-firewall](https://github.com/himanshYou2003/change-firewall)
