# Change Firewall ⚡

[![npm version](https://img.shields.io/npm/v/change-firewall.svg?style=flat-square&color=3b82f6)](https://www.npmjs.com/package/change-firewall)
[![npm downloads](https://img.shields.io/npm/dm/change-firewall.svg?style=flat-square&color=10b981)](https://www.npmjs.com/package/change-firewall)
[![license](https://img.shields.io/npm/l/change-firewall.svg?style=flat-square)](https://github.com/himanshYou2003/change-firewall/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/change-firewall.svg?style=flat-square)](https://nodejs.org)

> **Your AI wrote the code. Change Firewall tells you what it actually broke.**

A local-first developer tool and CLI for JavaScript & TypeScript that translates raw Git diffs into **behavior-aware change reports, downstream blast-radius mapping, and deterministic risk scores (0–100)**.

---

## ❓ Why Use Change Firewall?

AI coding assistants (Cursor, Claude Code, GitHub Copilot, Devin, Antigravity) are incredibly fast. They can rewrite 20 files in seconds and assure you:
```text
✓ Authentication added
✓ Tests passing
✓ Build successful
```

**The problem:** AI summaries only describe **intent**, not **consequences**.
Tests only check what they were written to test. Standard Git diffs only show line modifications (`+1, -1`), completely hiding architectural ripple effects:

| What Git Shows | What Actually Happened | What Breaks |
|---|---|---|
| `- return user;`<br>`+ return { user };` | API response contract mutated | Breaks 7 frontend clients expecting `{ id, name }` |
| `- req.user.role === 'admin'`<br>`+ req.user.role !== 'guest'` | Auth condition relaxed | Any logged-in user can access admin routes |
| `- function get(id: string)`<br>`+ function get(id?: string)` | Nullability widened | Causes unhandled `undefined` crashes 3 layers downstream |
| `// deleted validateSchema(body)` | Input validation bypassed | SQL / NoSQL injection vulnerability opened |

**Change Firewall acts as your safety net.** It intercepts AI modifications before you commit or merge them, parsing your code's **Abstract Syntax Tree (AST)** and **Reverse Dependency Graph** to tell you the exact behavioral blast radius.

---

## 🚀 Easy Steps: How to Use

No account, no API key, and no installation required. Change Firewall runs 100% locally on your machine.

### Step 1: Run Instant Check (Zero Install)

Whenever your AI finishes modifying files in your project, open your terminal and run:

```bash
npx change-firewall
```

You get an immediate, behavior-aware terminal summary:

```text
  CHANGE FIREWALL v0.1.0
  Analyzing 3 modified files...

  RISK SCORE: 74/100 (HIGH RISK)
  ============================================================
  🔴 HIGH    src/services/auth.ts:42
             Relaxed authorization check in 'requireRole'
             Evidence: Changed '=== "admin"' to '!== "guest"'
             Blast Radius: 4 downstream routes affected

  🟠 MEDIUM  src/controllers/user.ts:18
             API response wrapper mutated
             Evidence: Return value wrapped in '{ user }'
             Blast Radius: 7 consumers affected

  Safe to merge? NO. Run 'npx change-firewall preflight' for details.
```

---

### Step 2: Open the Interactive Visual Dashboard

Want to visually trace which files and consumers are affected? Run:

```bash
npx change-firewall --open
```

This launches a local dashboard at `http://localhost:4783` with:
- 🌐 **Interactive SVG Dependency Graph:** Click on modified nodes to view incoming/outgoing dependency links and downstream blast radius.
- 🚨 **Suspicious Changes Tab:** Flags untested changes to sensitive security and auth files.
- 💥 **Blast Radius Inspector:** Traces every dependent module up to 3 hops deep.
- 📜 **Git History & Churn:** Correlates today's edits with historical commit frequency and author count.

---

### Step 3: Use Live Watch Mode While AI Writes Code

Keep Change Firewall running in a side-by-side terminal split while your AI generates code:

```bash
npx change-firewall watch
```

- Automatically debounces rapid file edits.
- Instantly re-calculates the risk score as files change (`Risk changed: 35 → 78`).
- Live-streams updates to your open browser dashboard in real time using Server-Sent Events (SSE).

---

### Step 4: Block Risky PRs in CI / Preflight Gate

Prevent bad AI-generated code from ever merging into `main`. Run:

```bash
npx change-firewall preflight
```

- Returns **Exit code `0`**: Safe to merge.
- Returns **Exit code `1`**: Risky behavioral mutations detected (blocks the PR).

#### Add to GitHub Actions (`.github/workflows/change-firewall.yml`):
```yaml
name: Change Firewall
on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npx change-firewall preflight --base origin/${{ github.base_ref }}
```

---

## 💻 CLI Commands Cheat Sheet

| Command | When to Use |
|---|---|
| `npx change-firewall` | Quick scan of all uncommitted working tree changes |
| `npx change-firewall --open` | Scan changes and automatically open the visual dashboard |
| `npx change-firewall watch` | Live watch mode with real-time browser dashboard updates |
| `npx change-firewall preflight` | CI/CD gate with strict exit codes (`0` or `1`) |
| `npx change-firewall impact <file>` | Inspect blast radius & downstream consumers of a specific file |
| `npx change-firewall why <file>` | Explain architectural role, callers, and historical churn |
| `npx change-firewall analyze --json` | Output machine-readable JSON (great for feeding into AI agents) |
| `npx change-firewall demo` | Run an interactive simulation of the "Golden Moment" |

---

## 🛡️ How It Works Under the Hood

Unlike other tools that ask a remote LLM to "guess" what changed, Change Firewall is **100% deterministic and local**:

1. **In-Memory Git Dual-Tree Inspection:** Directly compares your working tree files against `HEAD` in memory.
2. **Native TypeScript AST Diffing:** Uses the TypeScript Compiler API (`ts.createSourceFile`) to inspect syntax trees, type signatures, return values, and guard conditions.
3. **Static Reverse Dependency Graph:** Scans project imports and builds a reverse caller graph using BFS traversal to pinpoint the exact blast radius.
4. **Deterministic Risk Formula:** Combines behavioral severity, downstream caller counts, and historical Git churn into a transparent 0–100 score.

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

---

## 🔒 Privacy & Local First

- 🚫 **No API Keys Needed** — Works completely offline.
- 🚫 **No Source Code Uploads** — Your code never leaves your computer.
- 🚫 **Zero External AI Hallucinations** — Analysis is backed by real compiler syntax trees and Git history.

---

## 📦 Programmatic API

You can also import Change Firewall into your own Node.js or TypeScript scripts:

```typescript
import { analyzeChanges, evaluatePreflight } from 'change-firewall';

// 1. Analyze changes in current repository
const report = await analyzeChanges({ cwd: process.cwd() });
console.log(`Risk Score: ${report.risk.score}/100`);

// 2. Evaluate merge readiness
const preflight = evaluatePreflight(report, { maxRisk: 60 });
if (!preflight.readyToMerge) {
  console.error('Merge Blocked:', preflight.blockers);
  process.exit(1);
}
```

---

## 📄 License

MIT © [Himanshu](https://github.com/himanshYou2003)
