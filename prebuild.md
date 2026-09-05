# Change Firewall

> **Your AI can write the code. Change Firewall tells you what it actually changed.**

**Status:** Pre-MVP / Validation
**Version:** 0.1
**Target:** JavaScript / TypeScript projects
**Primary interface:** CLI + local browser dashboard
**Architecture:** Local-first, zero required AI API
**Initial distribution:** NPM
**Primary command:** `npx change-firewall`

---

# 1. Executive Summary

AI coding has made software development dramatically faster.

But there is a growing problem:

AI can modify dozens of files in seconds while giving the developer a short summary such as:

```text
✓ Authentication added
✓ Tests passing
✓ Build successful
```

The summary tells the developer **what the AI intended to do**.

It does not necessarily tell them:

* what behavior actually changed
* what existing behavior may have been affected
* which consumers depend on the changed code
* which API contracts changed
* which routes or permissions changed
* whether apparently harmless changes have a larger blast radius
* what should be tested before accepting the change

Change Firewall exists to answer one question:

# "What did this change actually do?"

It converts traditional code diffs into **behavior-aware change reports**.

---

# 2. The Core Problem

Traditional Git diff answers:

```text
What lines changed?
```

Change Firewall answers:

```text
What changed in the behavior of my software?
```

Example:

```diff
- return user;
+ return { user };
```

Git sees:

```text
1 line changed
```

Change Firewall should recognize:

```text
API CONTRACT CHANGE

GET /api/user

BEFORE
User

AFTER
{
  user: User
}

Potential consumers:
7

Risk:
HIGH
```

The product is not another Git diff viewer.

The product is a **change interpretation engine**.

---

# 3. Why This Exists

The rise of AI coding changes the economics of software development.

Previously:

```text
Developer
   ↓
writes code
   ↓
understands code
   ↓
reviews code
```

Increasingly:

```text
Developer
   ↓
describes intent
   ↓
AI writes code
   ↓
AI summarizes changes
   ↓
Developer approves
```

The bottleneck moves from:

> "How quickly can we write code?"

to:

> "How confidently can we understand AI-generated changes?"

Change Firewall is designed for this new workflow.

---

# 4. Product Thesis

## Do not help AI write more code.

There are already many tools doing that.

## Help humans understand what AI just did.

Change Firewall should become the **reality check between AI-generated code and developer approval.**

---

# 5. Target Users

## Primary

Developers who regularly use:

* Claude Code
* Codex
* Cursor
* GitHub Copilot
* Antigravity
* other AI coding agents

## Secondary

* indie hackers
* startup developers
* full-stack developers
* open-source maintainers
* engineering teams
* developers maintaining large JavaScript/TypeScript projects

## Initial scope

JavaScript and TypeScript.

Do not support every language initially.

---

# 6. The Golden User Experience

The ideal first experience:

```bash
npx change-firewall
```

Change Firewall automatically:

1. detects the project
2. inspects the Git working tree
3. analyzes changed files
4. builds relevant dependency relationships
5. identifies potential behavioral changes
6. calculates risk
7. generates a local report
8. opens a browser dashboard

The developer should not need:

* an account
* an API key
* a cloud account
* a database server
* complicated configuration

The first experience must be:

```text
Install
   ↓
Run
   ↓
Understand
```

---

# 7. The Killer Moment

A successful first experience should look like this:

```text
CHANGE FIREWALL

19 files changed.

However...

4 behavioral changes detected.

────────────────────────────────

🔴 HIGH

Authentication behavior changed.

Previously:
Authenticated users could access /dashboard.

Now:
Only users satisfying the new permission condition
can access /dashboard.

Affected:
• middleware
• dashboard
• navigation
• API

────────────────────────────────

🟠 MEDIUM

API response structure changed.

7 consumers detected.

────────────────────────────────

🟡 LOW

UI component structure changed.

────────────────────────────────

Overall Risk:
74 / 100
```

The user should think:

> "I would not have noticed that from the Git diff."

That is the product's most important success condition.

---

# 8. Product Principles

## Principle 1 — Consequences over lines

Never optimize primarily for:

```text
+124
-87
```

Optimize for:

```text
What does this change affect?
```

---

## Principle 2 — Deterministic first

The core engine should rely primarily on:

* AST analysis
* TypeScript compiler information
* import/export relationships
* dependency analysis
* Git history
* route analysis
* API structure
* configuration
* tests
* package metadata

LLMs may explain findings.

LLMs must not be the source of truth.

---

## Principle 3 — Local-first

The core product should work without sending source code to a server.

No mandatory:

```text
API key
cloud account
external AI
```

---

## Principle 4 — Explain uncertainty

Never pretend the system knows something it does not know.

Use:

```text
Confidence: 94%
```

and explain why.

Example:

```text
Potential API contract change

Confidence:
87%

Evidence:
• return type changed
• 7 consumers detected
• existing tests expect previous structure
```

---

## Principle 5 — Never silently modify code

Change Firewall is initially an analyzer.

It should not automatically:

* delete code
* rewrite code
* commit changes
* install dependencies
* alter application behavior

The user remains in control.

---

# 9. Core Product

The product has four core capabilities.

## A. Change Detection

Determine what changed.

## B. Behavioral Interpretation

Determine what the changes mean.

## C. Impact Analysis

Determine what the changes could affect.

## D. Risk Analysis

Determine which changes deserve attention.

Everything else is secondary.

---

# 10. CLI

## Primary command

```bash
npx change-firewall
```

Equivalent to:

```bash
npx change-firewall analyze
```

---

## Analyze

```bash
npx change-firewall analyze
```

Analyzes the current Git working tree.

Output:

```text
Change Firewall

Analyzing project...

✓ Project detected
✓ Git diff analyzed
✓ Dependency relationships analyzed
✓ Routes analyzed
✓ API contracts analyzed
✓ Tests analyzed

19 files changed

Behavioral changes:
4

Risk:
HIGH

Open dashboard:
http://localhost:4783
```

---

# 11. Open Dashboard

```bash
npx change-firewall open
```

Starts the local dashboard.

The dashboard should be generated/served locally.

Do not require a hosted service.

---

# 12. Watch Mode

Later:

```bash
npx change-firewall watch
```

The system watches the project.

When an AI agent changes files:

```text
File changed
   ↓
Analyze
   ↓
Update report
   ↓
Dashboard refreshes
```

Example:

```text
AI modified 7 files.

Risk changed:

42 → 68

New behavioral change detected:

Authentication
```

This is a major future feature.

Do not build it before the basic analyzer works.

---

# 13. Preflight

Later:

```bash
npx change-firewall preflight
```

Purpose:

> Determine whether the current changes are reasonably safe to merge.

Example:

```text
READY TO MERGE?

68 / 100

🔴 1 high-risk behavioral change
🟠 2 medium-risk changes
🟡 1 missing regression test

Recommendation:

Review authentication behavior
before merging.
```

---

# 14. What Is a Behavioral Change?

This is the central technical problem.

The engine should identify meaningful changes such as:

### Authentication

```text
Before:
authenticated users

After:
authenticated + role condition
```

### Authorization

```text
Before:
any authenticated user

After:
admin users only
```

### API response

```text
Before:
User

After:
{ user: User }
```

### Function contract

```text
Before:
foo(id) → User

After:
foo(id) → User | null
```

### Route behavior

```text
Before:
GET /users

After:
GET /users requires authentication
```

### Database behavior

```text
Before:
insert

After:
upsert
```

### Validation

```text
Before:
email accepted without validation

After:
email format required
```

### Error behavior

```text
Before:
throws Error

After:
returns null
```

### State behavior

```text
Before:
global state update

After:
local state update
```

### UI behavior

Only detect UI behavior when confidence is sufficient.

Example:

```text
Responsive behavior changed.

Mobile breakpoint changed:
768px → 640px
```

Do not pretend to understand arbitrary visual changes in V1.

---

# 15. Impact Analysis

For every meaningful change, determine:

```text
Direct dependents
Indirect dependents
Routes
Components
Services
Database models
Tests
Configuration
External contracts
```

Example:

```text
PaymentService.ts

Direct dependents:
4

Indirect dependents:
13

API routes:
3

Database models:
2

Tests:
7

Potential blast radius:
HIGH
```

---

# 16. Risk Engine

Risk must not be a meaningless number.

Risk should be based on evidence.

Possible factors:

```text
+ authentication change
+ authorization change
+ public API contract change
+ database schema change
+ many dependents
+ missing tests
+ external integration
+ configuration change
+ historical instability
+ large blast radius
```

Potential output:

```text
Risk: HIGH

Reasons:

• authentication logic changed
• 8 dependents detected
• no regression test detected
• related file changed frequently
```

---

# 17. Confidence Engine

Every non-trivial finding should have confidence.

Example:

```text
Confidence: 93%

Evidence:
• return type changed
• 7 consumers detected
• 3 tests reference previous structure
```

Confidence is not the same as risk.

Example:

```text
Confidence: 98%
Risk: LOW
```

means:

> We are very confident a harmless change occurred.

And:

```text
Confidence: 76%
Risk: HIGH
```

means:

> We aren't completely certain, but the possible consequence is serious enough to investigate.

---

# 18. Git Intelligence

Git history should eventually become an important source of context.

Example:

```text
File:
auth.ts

History:

Created:
May 14

Modified:
17 times

Previous regression:
August 14

Related commit:
Authentication migration

Current change:
Permission logic modified
```

This allows the product to discover context that static analysis cannot.

---

# 19. The "Why" Feature

Later:

```bash
npx change-firewall why src/auth.ts
```

Output:

```text
WHY THIS FILE MATTERS

Purpose:
Authentication orchestration.

Dependents:
14

Historical notes:
• introduced during authentication migration
• modified during permission refactor
• previous change caused regression

Current risk:
HIGH

Confidence:
91%
```

This is useful, but it is not the primary V1 feature.

---

# 20. The "Impact" Feature

Later:

```bash
npx change-firewall impact src/auth.ts
```

Output:

```text
CHANGE IMPACT

Direct dependents:
8

Indirect dependents:
19

Routes:
5

Services:
4

Tests:
11

Potential blast radius:
HIGH
```

This should become one of the core capabilities.

---

# 21. The "Simulate" Feature

Future feature:

```bash
npx change-firewall simulate "replace MongoDB with PostgreSQL"
```

The engine predicts:

```text
SIMULATION

Potentially affected:

47 files
18 models
13 services
9 API routes
6 test suites

High-risk areas:

Authentication
Payments
Background workers

Detected MongoDB-specific behavior:

14 locations

Migration complexity:
HIGH
```

This is potentially a major differentiator.

It should NOT be part of V1.

---

# 22. Local Dashboard

The dashboard is the visual layer.

The CLI is the engine.

The dashboard must not become the product's reason for existence.

The product's value is the analysis.

The dashboard makes the analysis understandable.

---

# 23. Dashboard — Overview

Primary page:

```text
CHANGE FIREWALL

Project
────────────────────────────

Risk
74 / 100
HIGH

Files changed
19

Behavior changes
4

High-risk
1

Medium-risk
2

Low-risk
1
```

---

# 24. Dashboard — Behavioral Changes

```text
WHAT ACTUALLY CHANGED?

🔴 Authentication
Authorization behavior changed.

🟠 API Contract
Response structure changed.

🟡 Component Behavior
Responsive behavior changed.

🟢 Dependency
Package usage changed.
```

Each finding should be clickable.

---

# 25. Dashboard — Impact Map

Interactive visual map:

```text
                AUTH
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
   Middleware  Session   User
        │        │        │
        └────────┼────────┘
                 ↓
             Dashboard
                 │
          ┌──────┴──────┐
          ↓             ↓
         API          Store
```

Clicking a node should reveal:

```text
File
Dependents
Dependencies
Risk
Recent changes
Related findings
```

The graph exists to explain impact.

Do not build a generic graph visualization just because graphs look impressive.

---

# 26. Dashboard — Timeline

Show recent changes:

```text
September 1
    │
September 2
    │
September 3
    │
September 4
    │
September 5
```

Each change should expose:

```text
Files changed
Behavior changes
Risk
Author
Commit
```

Later distinguish:

```text
Human
AI
Unknown
```

only when reliable evidence exists.

---

# 27. Dashboard — Suspicious Changes

Potential findings:

```text
🔴 API changed without corresponding tests

🟠 New component appears to duplicate existing component

🟠 Authentication logic changed unexpectedly

🟡 Dependency added despite existing equivalent utility
```

Every finding needs evidence.

Never produce vague AI-style warnings.

---

# 28. Dashboard — AI Activity

Future feature.

Show:

```text
AI-assisted changes

Today:
31 files

This week:
147 files
```

Possible classification:

```text
Claude
Codex
Cursor
Human
Unknown
```

Only include this if reliable attribution is possible.

Do not manufacture attribution.

---

# 29. Architecture

Initial architecture:

```text
                 CLI
                  │
                  ▼
          Project Detector
                  │
                  ▼
           Change Collector
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
       AST       Git       Tests
        │         │         │
        └─────────┼─────────┘
                  ▼
          Dependency Graph
                  │
                  ▼
          Behavior Analyzer
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
      Impact     Risk    Confidence
        │         │         │
        └─────────┼─────────┘
                  ▼
            Report Engine
                  │
          ┌───────┴────────┐
          ▼                ▼
       Terminal         Dashboard
```

---

# 30. Suggested Technical Stack

## Runtime

Node.js

## Language

TypeScript

## AST

Start with TypeScript compiler APIs.

Evaluate later:

* ts-morph
* Babel parser
* SWC
* tree-sitter

Do not introduce multiple parsers unnecessarily in V1.

## Git

Use Git CLI or a mature Git library.

## Local storage

Start simple.

Possible:

```text
JSON
```

Then move to:

```text
SQLite
```

when persistent indexing becomes necessary.

Do NOT introduce a vector database in V1.

---

# 31. AI Integration

AI is optional.

Core analysis must work without:

```text
OpenAI
Anthropic
Google
OpenRouter
```

AI may later be used for:

```text
Natural-language explanation
Summarization
Complex change interpretation
Interactive questions
```

But the underlying evidence should come from deterministic analysis.

---

# 32. AI Agent Integration

Future:

```text
Claude Code
Codex
Cursor
Copilot
```

should be able to consume:

```bash
npx change-firewall analyze --json
```

Example:

```json
{
  "risk": "high",
  "confidence": 0.94,
  "behaviorChanges": [
    {
      "type": "authorization",
      "affected": [
        "src/middleware/auth.ts",
        "src/routes/dashboard.ts"
      ]
    }
  ],
  "recommendations": [
    "Run authentication regression tests"
  ]
}
```

This is strategically important.

The package should be useful to **AI agents themselves**, not just humans.

---

# 33. NPM API

The CLI is the initial product.

Later expose a programmatic API:

```ts
import { analyzeChanges } from "change-firewall";

const result = await analyzeChanges({
  cwd: process.cwd()
});
```

Possible result:

```ts
{
  risk: "high",
  confidence: 0.91,
  changes: [],
  affectedFiles: [],
  recommendations: []
}
```

This allows integration into:

* CI
* GitHub Actions
* IDE extensions
* AI agents
* other developer tools

---

# 34. CI Integration

Future:

```yaml
change-firewall:
  run: npx change-firewall preflight
```

Possible behavior:

```text
PR #182

Change Firewall:

Risk: HIGH

1 high-risk behavior change
2 API contract changes
1 missing regression test
```

It should comment on the PR rather than merely fail the build.

Build failure should be configurable.

---

# 35. What NOT to Build

This is critical.

Do NOT initially build:

```text
❌ SaaS dashboard
❌ user accounts
❌ cloud synchronization
❌ team management
❌ billing
❌ vector database
❌ custom LLM
❌ AI chat
❌ 20 language support
❌ 50 framework integrations
❌ automatic code rewriting
❌ automatic code deletion
❌ giant architecture visualization
❌ meaningless health scores
```

These are distractions until the core engine proves value.

---

# 36. V0 — The Brutal Validation

Before building the full NPM package, create a prototype.

Input:

```text
Git diff
```

Output:

```text
Behavioral changes
Impact
Risk
Confidence
```

Test it against real AI-generated changes.

Use:

```text
Claude Code
Codex
Cursor
```

Create realistic changes:

```text
Add authentication
Add dark mode
Refactor payments
Change API response
Improve mobile responsiveness
Change authorization
Add database field
Change validation
```

The goal is not beauty.

The goal is:

# Can the engine catch something the developer would otherwise miss?

---

# 37. The Seven-Day Validation Rule

Spend approximately one week on the core proof.

At the end of the week you should have:

```bash
npx change-firewall analyze
```

producing a useful report.

Do NOT spend the week building the dashboard.

Do NOT spend the week designing logos.

Do NOT spend the week building a website.

Do NOT spend the week integrating five AI providers.

Prove the engine.

---

# 38. Validation Experiment

Recruit approximately 10 developers who use AI coding tools.

Give them the prototype.

Ask them to use it during normal development.

Do not over-explain the product.

Measure:

### Metric 1

Did they run it again without being reminded?

### Metric 2

Did it catch something they would have missed?

### Metric 3

Did they investigate a warning?

### Metric 4

Would they notice if the tool disappeared?

### Metric 5

Would they install it in another project?

The most important metric:

# "Would you be annoyed if this tool disappeared?"

---

# 39. Go / No-Go Criteria

## GO

Continue if users repeatedly say:

> "It caught something I wouldn't have noticed."

or:

> "I want this running after every AI change."

or:

> "I don't trust the AI summary without this anymore."

---

## NO-GO

Stop or radically change direction if users say:

> "Cool visualization."

but:

> "I don't really need it."

A beautiful dashboard is not product-market fit.

---

# 40. V1 Scope

V1 should contain only:

```text
✓ JavaScript
✓ TypeScript
✓ Git diff analysis
✓ AST analysis
✓ Dependency relationships
✓ Basic behavior detection
✓ Basic impact analysis
✓ Risk engine
✓ Confidence
✓ CLI
✓ Local browser dashboard
✓ JSON output
```

That's enough.

---

# 41. V1 Commands

```bash
npx change-firewall analyze
```

```bash
npx change-firewall open
```

```bash
npx change-firewall impact <file>
```

```bash
npx change-firewall why <file>
```

Only ship commands that work extremely well.

---

# 42. The Core Differentiator

Change Firewall should NOT say:

> "We understand your codebase."

Many tools can claim that.

It should say:

# "We tell you what your AI-generated changes actually changed."

The distinction is critical.

---

# 43. Competitive Positioning

The product should not compete directly with:

```text
ESLint
TypeScript
Git
dependency analyzers
generic code graphs
AI coding assistants
```

Those tools answer different questions.

Change Firewall's question is:

> **What are the consequences of this change?**

---

# 44. Product Loop

The ideal workflow:

```text
Developer asks AI to build something
             ↓
AI modifies project
             ↓
Change Firewall analyzes changes
             ↓
Behavior changes detected
             ↓
Impact calculated
             ↓
Risk calculated
             ↓
Developer investigates
             ↓
Tests / fixes
             ↓
Developer approves
```

Eventually:

```text
AI
 ↓
Change Firewall
 ↓
AI receives analysis
 ↓
AI corrects itself
 ↓
Developer approves
```

This creates a powerful future direction:

# AI → analysis → AI correction → human approval

---

# 45. Long-Term Vision

The long-term product is not merely a diff viewer.

It becomes a **Change Intelligence Layer** for AI-driven software development.

Potential architecture:

```text
                    AI AGENTS
              ┌────────┼────────┐
              ↓        ↓        ↓
           Claude    Codex    Cursor
              │        │        │
              └────────┼────────┘
                       ↓
              CHANGE FIREWALL
                       │
         ┌─────────────┼─────────────┐
         ↓             ↓             ↓
      PROJECT       HISTORY       BEHAVIOR
       GRAPH          GRAPH         MODEL
         │             │             │
         └─────────────┼─────────────┘
                       ↓
                CHANGE INTELLIGENCE
                       │
              ┌────────┼────────┐
              ↓        ↓        ↓
            IMPACT    RISK     EXPLANATION
```

---

# 46. Potential Future Features

Only after the core product proves itself:

### Change Simulation

```bash
change-firewall simulate "replace MongoDB"
```

### Live Watch

```bash
change-firewall watch
```

### AI Agent Protocol

Allow agents to query Change Firewall directly.

### CI / GitHub integration

Analyze pull requests.

### Historical regression detection

Identify similar changes that previously caused problems.

### Project memory

Remember important architectural decisions.

### Visual architecture

Build an interactive system map based on actual evidence.

### Team intelligence

Aggregate change risk across repositories.

---

# 47. Monetization

Do not monetize V1.

First build adoption.

Possible future model:

## Free / Open Source

```text
Local analysis
CLI
Dashboard
JSON output
Basic rules
```

## Pro

```text
Advanced analysis
Historical intelligence
AI explanations
Advanced simulations
IDE integrations
```

## Team

```text
CI integration
PR analysis
Team policies
Shared configuration
Organization analytics
```

But monetization is not a V1 concern.

---

# 48. Open Source Strategy

The core engine should strongly consider being open source.

Why?

Developers are more likely to trust a local code-analysis tool when they can inspect:

```text
what it analyzes
what it sends
how risk is calculated
```

Trust matters enormously when analyzing source code.

Potential model:

```text
Open-source core
        +
optional hosted services
```

---

# 49. Privacy

Default behavior:

```text
Source code stays local.
```

No source code should leave the machine unless the user explicitly enables an external integration.

The dashboard should be local.

This should be prominently documented.

---

# 50. Security

The tool will potentially inspect:

```text
source code
Git history
configuration
dependency metadata
environment variable names
routes
database models
```

Therefore:

* never upload secrets
* never expose `.env` values
* never log secret values
* sanitize reports
* bind local server safely
* document data flow clearly

---

# 51. Performance Requirement

The tool must be fast enough to run frequently.

Target:

```text
Small project:
< 2 seconds

Medium project:
< 5 seconds

Large project:
incremental analysis
```

Do not re-analyze the entire repository after every change.

Build an incremental architecture.

---

# 52. The Most Important Technical Challenge

The hardest problem is not:

```text
making a graph
```

or:

```text
creating a dashboard
```

or:

```text
running an NPM CLI
```

The hardest problem is:

# **Correctly identifying meaningful behavioral changes without producing useless noise.**

If the tool reports:

```text
Everything changed!
```

developers will disable it.

The product lives or dies by signal-to-noise ratio.

---

# 53. Anti-Noise Strategy

Every warning should have:

```text
Finding
Evidence
Affected area
Confidence
Risk
Recommendation
```

Bad:

```text
⚠ Something might break.
```

Good:

```text
🔴 HIGH

Authorization condition changed.

Evidence:
• middleware condition changed
• 5 protected routes depend on middleware
• no corresponding authorization test changed

Confidence:
91%

Recommendation:
Run authorization regression tests.
```

---

# 54. Product North Star

Do not measure:

```text
Number of graphs generated
Number of files analyzed
Number of lines analyzed
```

Measure:

# **Meaningful surprises caught.**

A meaningful surprise is:

> A behavior-impacting change that the developer or AI did not explicitly recognize.

This should become the most important product metric.

---

# 55. Success Scenario

The ideal user workflow becomes:

```text
1. Install Change Firewall.

2. Start using AI normally.

3. AI makes changes.

4. Change Firewall analyzes them automatically.

5. It catches a hidden consequence.

6. Developer realizes the value.

7. Developer enables watch mode.

8. Developer adds it to other projects.

9. Developer adds it to CI.

10. Change Firewall becomes part of the normal AI development workflow.
```

---

# 56. Failure Scenario

Avoid this:

```text
Install
 ↓
Beautiful dashboard
 ↓
Developer explores graph
 ↓
"Cool."
 ↓
Never runs it again
```

If this happens, the product failed.

---

# 57. The Brutal Product Rule

Whenever a proposed feature is discussed, ask:

> **Does this help detect or explain a meaningful consequence of a software change?**

If no:

# Do not build it yet.

---

# 58. Final Product Definition

Change Firewall is:

> **A local-first NPM developer tool that analyzes code changes and translates them into behavioral impact, risk, and actionable explanations — specifically designed for the age of AI-generated software.**

It is not:

* another AI coding assistant
* another code graph
* another linter
* another Git client
* another code formatter
* another generic AI wrapper

Its job is simple:

# **AI writes. Change Firewall checks what actually happened.**

---

# 59. First Milestone

The first milestone is NOT:

```text
beautiful dashboard
```

The first milestone is:

```text
Given a real AI-generated Git diff,

Change Firewall correctly identifies
at least one meaningful behavioral consequence
that is not obvious from the raw diff.
```

If that works reliably:

**Build the dashboard.**

If that does not work:

**Do not build the dashboard. Reconsider the core engine.**

---

# 60. Final Brutal Verdict

## Should this be built?

**Yes — as an experiment.**

## Should you commit months to it today?

**No.**

## Should you build the entire platform first?

**Absolutely not.**

## What should you build first?

A tiny analyzer that answers:

# "What did this AI change actually affect?"

If developers repeatedly find value in that answer, then the rest of the product becomes worth building.

If they don't, kill it early.

That is not failure.

That is exactly what good product development looks like.

---

# FINAL TAGLINE

> **Your AI can write the code.
> Change Firewall tells you what it actually changed.**
