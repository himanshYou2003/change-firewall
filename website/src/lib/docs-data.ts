export interface DocItem {
  id: string;
  folderId: string;
  folderTitle: string;
  fileName: string;
  title: string;
  description: string;
  readingTime: string;
  badge?: string;
  content: {
    overview: string;
    callout?: {
      type: 'tip' | 'warning' | 'info';
      text: string;
    };
    codeExample?: string;
    codeLanguage?: string;
    table?: {
      headers: string[];
      rows: string[][];
    };
    bulletPoints?: string[];
    nextDocId?: string;
    prevDocId?: string;
  };
}

export interface DocFolder {
  id: string;
  title: string;
  icon?: string;
  files: DocItem[];
}

export const DOCS_TREE: DocFolder[] = [
  {
    id: 'overview',
    title: 'Overview & Architecture',
    files: [
      {
        id: 'why-change-firewall',
        folderId: 'overview',
        folderTitle: 'Overview & Architecture',
        fileName: 'why-change-firewall.md',
        title: 'Why Raw Diffs Fail in AI Coding',
        description: 'Why line-based git diffs are blind to semantic breakage caused by autonomous coding agents.',
        readingTime: '2 min read',
        badge: 'Core Problem',
        content: {
          overview:
            'AI coding assistants (Cursor, Claude Code, Antigravity, Devin, Copilot) write code in bursts across multiple files. A standard git diff only sees character additions and subtractions (+1 / -1). It has no awareness of syntax trees, method signatures, return type mutations, or downstream callers. Change Firewall acts as an intelligent AST gate between AI code output and your main repository.',
          callout: {
            type: 'warning',
            text: 'A 1-line return type change (e.g., returning { user } instead of user) looks innocent in git diff, but breaks every single client component at runtime.',
          },
          table: {
            headers: ['Analysis Vector', 'Traditional Git Diff', 'Change Firewall AST Engine'],
            rows: [
              ['Contract Mutations', 'Hidden as plain text change', 'Analyzed against AST function contracts'],
              ['Downstream Blast Radius', '0% caller awareness', 'Reverse import graph traversal up to 3 hops'],
              ['Merge Readiness', 'Requires human deciphering', 'Deterministic 0-100 score + blocking gate'],
              ['AI Self-Healing', 'Manual review cycles', 'Stdio JSON-RPC MCP server for autonomous fix'],
            ],
          },
          bulletPoints: [
            '100% offline & local execution (zero token costs, zero telemetry)',
            'Instant TypeScript Compiler API AST traversal in milliseconds',
            'Full reverse dependency graph mapping across your entire repository',
          ],
          nextDocId: 'quick-start',
        },
      },
      {
        id: 'quick-start',
        folderId: 'overview',
        folderTitle: 'Overview & Architecture',
        fileName: 'quick-start.md',
        title: 'Quick Start (Zero Install)',
        description: 'Run Change Firewall inside any JavaScript or TypeScript repository with no installation required.',
        readingTime: '1 min read',
        badge: 'Zero Config',
        content: {
          overview:
            'Change Firewall requires zero project configuration or cloud credentials. You can run it directly using npx inside any local Git repository.',
          codeLanguage: 'bash',
          codeExample: `# 1. Run instant terminal behavioral analysis
npx change-firewall

# 2. Launch live web dashboard visualizer
npx change-firewall --open

# 3. Output JSON for AI assistant prompts
npx change-firewall --json`,
          bulletPoints: [
            'Requires Node.js 18+ and a local Git repository',
            'Works seamlessly with TypeScript, React, Next.js, Node.js, and Express',
            'Respects .gitignore and excludes node_modules automatically',
          ],
          prevDocId: 'why-change-firewall',
          nextDocId: 'core-concepts',
        },
      },
      {
        id: 'core-concepts',
        folderId: 'overview',
        folderTitle: 'Overview & Architecture',
        fileName: 'core-concepts.md',
        title: 'Core Concepts: AST, Blast Radius & Risk Score',
        description: 'Understand the three foundational pillars of Change Firewall.',
        readingTime: '3 min read',
        badge: 'Mental Model',
        content: {
          overview:
            'Change Firewall evaluates code changes using a tripartite analysis pipeline: AST Behavioral Diffing, Downstream Graph Traversal, and Deterministic Scoring.',
          table: {
            headers: ['Pillar', 'Responsibility', 'Metric'],
            rows: [
              ['1. AST Diff Engine', 'Inspects semantic changes to exported signatures, functions, types, and JSX props', 'Mutations detected'],
              ['2. Blast Radius', 'Traces reverse module dependencies to discover all callers affected by the change', 'Direct & transitive consumers'],
              ['3. Risk Scoring', 'Computes a deterministic score from 0 to 100 based on contract sensitivity and consumer count', 'Score 0-100 & Preflight Gate'],
            ],
          },
          callout: {
            type: 'info',
            text: 'The risk formula is deterministic: it produces the exact same score for the same diff every time, making it ideal for CI/CD gates.',
          },
          prevDocId: 'quick-start',
          nextDocId: 'cli-analyze',
        },
      },
    ],
  },
  {
    id: 'cli-commands',
    title: 'CLI Command Reference',
    files: [
      {
        id: 'cli-analyze',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'analyze.md',
        title: 'change-firewall (analyze)',
        description: 'Deep behavioral diff analysis of your uncommitted working tree or staged commits.',
        readingTime: '2 min read',
        badge: 'Default Command',
        content: {
          overview:
            'The default command parses all modified code files using the TypeScript AST engine, constructs the reverse dependency graph, and produces an actionable terminal report.',
          codeLanguage: 'bash',
          codeExample: `# Inspect uncommitted changes against Git HEAD
npx change-firewall

# Inspect only staged changes (git add)
npx change-firewall --staged

# Compare against a base branch (e.g. main or develop)
npx change-firewall --base origin/main

# Emit machine-readable JSON for agents and CI pipelines
npx change-firewall --json`,
          bulletPoints: [
            '--staged: Analyzes files in the Git staging area before commit',
            '--base <ref>: Calculates diff against a specific Git commit or branch',
            '--json: Produces structured output for AI tools and scripts',
          ],
          prevDocId: 'core-concepts',
          nextDocId: 'cli-preflight',
        },
      },
      {
        id: 'cli-preflight',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'preflight.md',
        title: 'change-firewall preflight',
        description: 'Automated merge readiness gate for pre-commit hooks, CI/CD pipelines, and AI self-correction.',
        readingTime: '2 min read',
        badge: 'Merge Gate',
        content: {
          overview:
            'Evaluates whether the current changeset is safe to merge. Exits with status code 0 if safe, or code 1 if blocked by high-risk contract breaks or threshold breaches.',
          codeLanguage: 'bash',
          codeExample: `# Run preflight gate with default risk threshold (60/100)
npx change-firewall preflight

# Specify custom risk tolerance (e.g., maximum score of 40)
npx change-firewall preflight --max-risk 40

# JSON output for automated agent decision loops
npx change-firewall preflight --json`,
          callout: {
            type: 'tip',
            text: 'AI assistants can parse the preflight JSON blockers list to automatically rewrite and repair breaking changes without human intervention.',
          },
          prevDocId: 'cli-analyze',
          nextDocId: 'cli-impact',
        },
      },
      {
        id: 'cli-impact',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'impact.md',
        title: 'change-firewall impact <file>',
        description: 'Calculates the downstream ripple effect, affected routes, and consumer components for any file.',
        readingTime: '1 min read',
        badge: 'Blast Radius',
        content: {
          overview:
            'Traverses the reverse import dependency graph using breadth-first search to find all direct and transitive consumers up to 3 hops deep.',
          codeLanguage: 'bash',
          codeExample: `# Inspect downstream impact of changing auth service
npx change-firewall impact src/services/auth.ts

# Inspect impact of modifying a core UI component
npx change-firewall impact src/components/Button.tsx`,
          bulletPoints: [
            'Displays total consumer count and depth breakdown',
            'Highlights critical API routes and controller endpoints',
            'Shows exact imported symbols per consumer file',
          ],
          prevDocId: 'cli-preflight',
          nextDocId: 'cli-watch',
        },
      },
      {
        id: 'cli-watch',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'watch.md',
        title: 'change-firewall watch',
        description: 'Live file watcher that streams real-time updates over Server-Sent Events (SSE) to your browser.',
        readingTime: '1 min read',
        badge: 'Live Dashboard',
        content: {
          overview:
            'Launches an embedded file watcher and HTTP server. Whenever an AI agent writes or modifies code in your workspace, the dashboard updates instantly.',
          codeLanguage: 'bash',
          codeExample: `# Start watch mode on default port 4783
npx change-firewall watch

# Custom port without auto-opening the browser
npx change-firewall watch -p 5000 --no-open`,
          prevDocId: 'cli-impact',
          nextDocId: 'cli-mcp',
        },
      },
      {
        id: 'cli-mcp',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'mcp.md',
        title: 'change-firewall mcp',
        description: 'Starts the Model Context Protocol (MCP) server over standard I/O for native AI integration.',
        readingTime: '2 min read',
        badge: 'Stdio MCP',
        content: {
          overview:
            'Starts a standard JSON-RPC 2.0 MCP server over stdio. Connects natively with Claude Desktop, Google Antigravity, Cursor, and Windsurf.',
          codeLanguage: 'bash',
          codeExample: `# Start MCP server process (normally managed by the AI client)
npx change-firewall mcp`,
          callout: {
            type: 'info',
            text: 'All diagnostics and logs are written to stderr, preserving stdout exclusively for MCP JSON-RPC protocol frames.',
          },
          prevDocId: 'cli-watch',
          nextDocId: 'cli-interactive',
        },
      },
      {
        id: 'cli-interactive',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'interactive.md',
        title: 'change-firewall interactive (inspect)',
        description: 'Keyboard-driven terminal inspector with call stacks, symbolic crash proof, and 11-D fingerprint.',
        readingTime: '2 min read',
        badge: 'Interactive TUI',
        content: {
          overview:
            'Launches an interactive fullscreen terminal inspector preserving your terminal scrollback. Navigate findings with arrow keys, toggle call stacks, view mathematical runtime crash proofs, and generate instant test stubs.',
          codeLanguage: 'bash',
          codeExample: `# Launch interactive terminal inspector
npx change-firewall interactive

# Alias shortcut
npx change-firewall inspect

# Inspect staged changes only
npx change-firewall inspect --staged`,
          table: {
            headers: ['Key / Shortcut', 'Action', 'Description'],
            rows: [
              ['↓ / ↑ or j / k', 'Scroll Findings', 'Navigate between detected behavioral shifts'],
              ['Tab', 'Call Stacks & Blast Radius', 'Expand direct and indirect downstream callers'],
              ['p', 'Symbolic Crash Proof', 'Inspect deterministic runtime exception trace'],
              ['f', '11-D Fingerprint Matrix', 'Inspect active behavioral mutation vectors'],
              ['a', 'Auto-Fix & Test Stub', 'Generate 1-line code fix and Vitest test stub'],
              ['q / Ctrl+C', 'Quit', 'Cleanly exit and restore original terminal buffer'],
            ],
          },
          prevDocId: 'cli-mcp',
          nextDocId: 'cli-graph',
        },
      },
      {
        id: 'cli-graph',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'graph.md',
        title: 'change-firewall graph <file>',
        description: 'Renders an ASCII architectural behavior graph and multi-hop critical execution paths.',
        readingTime: '1 min read',
        badge: 'Behavior Graph',
        content: {
          overview:
            'Classifies the architectural role of target files (API_ROUTE, AUTH_BOUNDARY, DATABASE_MODEL, TEST_SUITE, EVENT_PRODUCER, EVENT_CONSUMER) and displays incoming callers, outgoing dependencies, and protected data flows.',
          codeLanguage: 'bash',
          codeExample: `# Render behavior graph for core entrypoint
npx change-firewall graph src/index.ts

# Inspect API route critical flow (Route ➔ Auth Guard ➔ DB Model)
npx change-firewall graph src/routes/user.ts`,
          bulletPoints: [
            'Classifies semantic architectural roles with zero configuration',
            'Uncovers unprotected data access paths (missing auth guards)',
            'Displays multi-hop downstream execution flows',
          ],
          prevDocId: 'cli-interactive',
          nextDocId: 'cli-memory',
        },
      },
      {
        id: 'cli-memory',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'memory.md',
        title: 'change-firewall memory [status|record|reset]',
        description: 'Persistent contract memory engine tracking stability invariants across git commits.',
        readingTime: '2 min read',
        badge: 'Temporal Memory',
        content: {
          overview:
            'Persists verified symbol contracts and endpoint schemas in .firewall/memory/. Detects broken invariants when code that has been stable for dozens of commits is unexpectedly altered.',
          codeLanguage: 'bash',
          codeExample: `# View persistent memory status & verified invariants count
npx change-firewall memory status

# Record verified baseline contract snapshot at HEAD
npx change-firewall memory record

# Reset persistent memory
npx change-firewall memory reset`,
          callout: {
            type: 'info',
            text: 'When an AI agent modifies a function with 50+ commits of historical stability, Change Firewall flags a Broken Historical Invariant.',
          },
          prevDocId: 'cli-graph',
          nextDocId: 'cli-audit-agent',
        },
      },
      {
        id: 'cli-audit-agent',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'audit-agent.md',
        title: 'change-firewall audit-agent',
        description: 'Audits AI agent prompt intent vs actual code mutations to detect stealth changes.',
        readingTime: '2 min read',
        badge: 'Agent Safety',
        content: {
          overview:
            'Compares the stated prompt or task given to an AI coding assistant against the uncommitted AST mutations. Flags STEALTH_MUTATION with high drift scores if the agent touched auth guards, deleted contracts, or altered databases without declaring it.',
          codeLanguage: 'bash',
          codeExample: `# Audit stated intent against current uncommitted diffs
npx change-firewall audit-agent -i "Fix button padding and header colors"

# Output machine-readable audit report for CI gates
npx change-firewall audit-agent -i "Refactor payment service" --json`,
          bulletPoints: [
            'ALIGNED (0% Drift): Code mutations match declared intent',
            'MODERATE_DRIFT (1-49% Drift): Minor auxiliary adjustments detected',
            'STEALTH_MUTATION (≥50% Drift): Unannounced security or contract shifts (blocks merge)',
          ],
          prevDocId: 'cli-memory',
          nextDocId: 'cli-why',
        },
      },
      {
        id: 'cli-why',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'why.md',
        title: 'change-firewall why <file>',
        description: 'Explains why a file matters to the architecture, its role, git churn, and contributors.',
        readingTime: '1 min read',
        badge: 'Context',
        content: {
          overview:
            'Combines git commit history, churn frequency, author count, and downstream consumer blast radius to explain why a file is sensitive.',
          codeLanguage: 'bash',
          codeExample: `npx change-firewall why src/middlewares/auth.ts`,
          prevDocId: 'cli-audit-agent',
          nextDocId: 'mcp-claude',
        },
      },
    ],
  },
  {
    id: 'mcp-integration',
    title: 'Model Context Protocol (MCP)',
    files: [
      {
        id: 'mcp-claude',
        folderId: 'mcp-integration',
        folderTitle: 'Model Context Protocol (MCP)',
        fileName: 'claude-desktop.md',
        title: 'Claude Desktop (Anthropic)',
        description: 'Native tool execution inside Claude Desktop chat interface.',
        readingTime: '2 min read',
        badge: 'Anthropic',
        content: {
          overview:
            'Configure Claude Desktop to spawn Change Firewall as a local process. Claude displays a hammer icon with all 4 tools ready to invoke.',
          codeLanguage: 'json',
          codeExample: `// macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
// Windows: %APPDATA%\\Claude\\claude_desktop_config.json
{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
          bulletPoints: [
            'Restart Claude Desktop after updating the configuration file',
            'Claude chat displays the hammer icon with analyze_changes, evaluate_preflight, compute_blast_radius, explain_file_impact',
            'Prompt Claude: "Review my staged changes and verify merge readiness"',
          ],
          prevDocId: 'cli-mcp',
          nextDocId: 'mcp-antigravity',
        },
      },
      {
        id: 'mcp-antigravity',
        folderId: 'mcp-integration',
        folderTitle: 'Model Context Protocol (MCP)',
        fileName: 'google-antigravity.md',
        title: 'Google Antigravity (Google)',
        description: 'Empower Antigravity agents with deterministic AST verification tools.',
        readingTime: '2 min read',
        badge: 'Google',
        content: {
          overview:
            'Add Change Firewall to your global Antigravity configuration or workspace .agents directory to enable agentic self-correction during pair programming.',
          codeLanguage: 'json',
          codeExample: `// Global: ~/.gemini/config/mcp_config.json
// Workspace: .agents/mcp_config.json
{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
          callout: {
            type: 'tip',
            text: 'Antigravity automatically discovers the server and enables tools without requiring workspace restarts.',
          },
          prevDocId: 'mcp-claude',
          nextDocId: 'mcp-cursor',
        },
      },
      {
        id: 'mcp-cursor',
        folderId: 'mcp-integration',
        folderTitle: 'Model Context Protocol (MCP)',
        fileName: 'cursor-composer.md',
        title: 'Cursor Composer & Chat',
        description: 'Connect Change Firewall into Cursor for multi-file verification.',
        readingTime: '2 min read',
        badge: 'Composer',
        content: {
          overview:
            'In Cursor: open Settings > Features > MCP > Add New MCP Server. Configure the server with command type.',
          codeLanguage: 'json',
          codeExample: `{
  "name": "change-firewall",
  "type": "command",
  "command": "npx -y change-firewall mcp"
}`,
          bulletPoints: [
            'Cursor Composer (Cmd+I) automatically invokes evaluate_preflight before finalizing multi-file diffs',
            'Green status indicator confirms successful MCP connection',
          ],
          prevDocId: 'mcp-antigravity',
          nextDocId: 'mcp-windsurf',
        },
      },
      {
        id: 'mcp-windsurf',
        folderId: 'mcp-integration',
        folderTitle: 'Model Context Protocol (MCP)',
        fileName: 'windsurf-cascade.md',
        title: 'Windsurf Cascade (Codeium)',
        description: 'Integrate Change Firewall with Windsurf Cascade agent.',
        readingTime: '1 min read',
        badge: 'Cascade',
        content: {
          overview:
            'Windsurf uses an MCP config file in the user directory to register custom servers.',
          codeLanguage: 'json',
          codeExample: `// ~/.codeium/windsurf/mcp_config.json
{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
          prevDocId: 'mcp-cursor',
          nextDocId: 'ast-diffing',
        },
      },
    ],
  },
  {
    id: 'engine-internals',
    title: 'Engine & Architecture',
    files: [
      {
        id: 'ast-diffing',
        folderId: 'engine-internals',
        folderTitle: 'Engine & Architecture',
        fileName: 'ast-diffing.md',
        title: 'AST Behavioral Diffing vs Line Diffs',
        description: 'How Change Firewall parses AST nodes to detect semantic contract changes.',
        readingTime: '3 min read',
        badge: 'TypeScript AST',
        content: {
          overview:
            'Change Firewall uses the official TypeScript compiler AST parser (ts.createSourceFile) to analyze before and after versions of modified files. It classifies mutations into semantic tiers: Export Alterations, Signature Changes, Return Type Mutations, and React Prop Breakages.',
          bulletPoints: [
            'Zero regex guesswork: true AST node traversal',
            'Detects added/removed/renamed function parameters',
            'Tracks type alias mutations and interface property removals',
          ],
          prevDocId: 'mcp-windsurf',
          nextDocId: 'blast-radius-graph',
        },
      },
      {
        id: 'blast-radius-graph',
        folderId: 'engine-internals',
        folderTitle: 'Engine & Architecture',
        fileName: 'blast-radius-graph.md',
        title: 'Reverse Dependency Graph Traversal',
        description: 'How caller blast radiuses are mapped across file systems.',
        readingTime: '2 min read',
        badge: 'Graph Engine',
        content: {
          overview:
            'The engine scans project source files to construct a reverse import map. When a file is modified, breadth-first search traverses outward up to 3 hops, tagging every downstream caller.',
          callout: {
            type: 'info',
            text: 'Special prioritization is applied to API routes (pages/api, app/api) and UI entrypoints to reflect real user impact.',
          },
          prevDocId: 'ast-diffing',
          nextDocId: 'risk-formula',
        },
      },
      {
        id: 'risk-formula',
        folderId: 'engine-internals',
        folderTitle: 'Engine & Architecture',
        fileName: 'risk-formula.md',
        title: 'Deterministic Risk Scoring Formula',
        description: 'How the 0-100 risk score is computed with no AI randomness.',
        readingTime: '2 min read',
        badge: 'Deterministic',
        content: {
          overview:
            'The risk score is a deterministic composite of Mutation Severity (0-40 pts), Caller Blast Radius (0-30 pts), File Criticality (0-20 pts), and Test Coverage Presence (0-10 pts).',
          table: {
            headers: ['Score Range', 'Risk Tier', 'Preflight Default Gate'],
            rows: [
              ['0 – 25', 'Low Risk', 'PASSED: Safe to merge'],
              ['26 – 59', 'Moderate Risk', 'PASSED: Review recommended'],
              ['60 – 100', 'High Risk', 'BLOCKED: Requires manual override or self-correction'],
            ],
          },
          prevDocId: 'blast-radius-graph',
          nextDocId: 'github-actions',
        },
      },
    ],
  },
  {
    id: 'ci-automation',
    title: 'CI/CD & Git Automation',
    files: [
      {
        id: 'github-actions',
        folderId: 'ci-automation',
        folderTitle: 'CI/CD & Git Automation',
        fileName: 'github-actions.md',
        title: 'GitHub Actions PR Gate',
        description: 'Block high-risk pull requests automatically in GitHub Actions.',
        readingTime: '2 min read',
        badge: 'CI Pipeline',
        content: {
          overview:
            'Add Change Firewall to your pull request workflow. It blocks merges whenever the risk score exceeds threshold and automatically posts an interactive branded report to the PR.',
          codeLanguage: 'yaml',
          codeExample: `name: Change Firewall

on:
  pull_request:
    branches: [main, master, develop]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  analyze-changes:
    name: Change Firewall
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run Change Firewall Preflight
        id: firewall
        run: |
          set +e
          npx change-firewall preflight --base origin/\${{ github.base_ref }} --json > change-firewall-report.json
          EXIT_CODE=$?
          echo "EXIT_CODE=$EXIT_CODE" >> "$GITHUB_ENV"
          exit 0

      - name: Post PR Summary Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('change-firewall-report.json', 'utf8'));
            const icon = 'https://raw.githubusercontent.com/himanshYou2003/change-firewall/main/assets/icon.png';
            const badge = report.readyToMerge ? '🟢 **PASS / READY TO MERGE**' : '🔴 **BLOCKED / REVIEW REQUIRED**';
            let comment = \`### <img src="\${icon}" width="24" height="24" align="absmiddle" /> Change Firewall: \${badge}\\n\\n\`;
            comment += \`* **Risk Score:** \\\`\${report.score} / 100\\\`\\n\`;
            comment += \`* **High-Risk Shifts:** \\\`\${report.highRiskCount}\\\`\\n\`;
            if (report.blockers && report.blockers.length > 0) {
              comment += \`\\n#### 🚨 Merge Blockers\\n\` + report.blockers.map(b => \`* ❌ \${b}\`).join('\\n') + '\\n';
            }
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
          fi\``,
          prevDocId: 'risk-formula',
          nextDocId: 'programmatic-api',
        },
      },
      {
        id: 'programmatic-api',
        folderId: 'ci-automation',
        folderTitle: 'CI/CD & Git Automation',
        fileName: 'programmatic-api.md',
        title: 'TypeScript / Node.js Programmatic API',
        description: 'Integrate Change Firewall directly into your custom tools, bots, and test harnesses.',
        readingTime: '2 min read',
        badge: 'Full TypeScript',
        content: {
          overview:
            'Change Firewall exports fully-typed TypeScript functions for programmatic invocation in custom scripts and services.',
          codeLanguage: 'typescript',
          codeExample: `import { analyzeChanges, evaluatePreflight, computeBlastRadius } from 'change-firewall';

// 1. Run behavioral analysis on the current workspace
const report = await analyzeChanges({ cwd: process.cwd() });
console.log('Risk Score:', report.risk.score);

// 2. Evaluate preflight safety gate
const gate = evaluatePreflight(report, { maxRisk: 50 });
if (!gate.readyToMerge) {
  console.error('Blocked reasons:', gate.blockers);
}`,
          prevDocId: 'github-actions',
          nextDocId: 'symbolic-crash-proof',
        },
      },
    ],
  },
  {
    id: 'advanced-intelligence',
    title: 'Behavioral Intelligence Architecture',
    files: [
      {
        id: 'four-genius-pillars',
        folderId: 'advanced-intelligence',
        folderTitle: 'Behavioral Intelligence Architecture',
        fileName: 'four-genius-pillars.md',
        title: 'The 4 Genius Pillars for Change Firewall',
        description: 'The master architectural blueprint engineered to deliver 100% trusted behavioral intelligence.',
        readingTime: '3 min read',
        badge: 'Core Blueprint',
        content: {
          overview:
            'Conventional linters and scanners fail because they cry wolf with vague warnings, hallucinate false positives, and have zero memory of the codebase history or intent. Change Firewall solves this with 4 Genius Pillars: The Behavior Graph & 11-D Fingerprint, The Behavioral Memory Store, Symbolic Crash Trace & Proof, and the AI Agent Intent vs Reality Guard.',
          codeLanguage: 'text',
          codeExample: `┌──────────────────────────────────────────────┐
│       THE CHANGE FIREWALL GENIUS CORE        │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────┼──────────────────────┬──────────────────────┐
▼                      ▼                      ▼                      ▼
1. BEHAVIOR GRAPH &    2. BEHAVIORAL          3. SYMBOLIC            4. "AGENT INTENT
   11-D FINGERPRINT       MEMORY STORE           CRASH TRACE            VS REALITY"
   (The Brain)            (.firewall/memory)     (Zero-Guesswork)       VERIFIER`,
          bulletPoints: [
            'Pillar 1 (The Brain): Living boundary classification across API, Database, Event, Auth, and Test boundaries evaluated over an 11-D matrix',
            'Pillar 2 (The Memory): Zero-config persistent cache in .firewall/memory/ tracking contract invariant history over time',
            'Pillar 3 (The Proof): Mathematical proof chains simulating unhandled TypeErrors at caller line numbers with zero false alarms',
            'Pillar 4 (The Agent Guard): Compares Natural Language intent against AST mutations to catch stealth changes and compute Intent Drift',
          ],
          prevDocId: 'programmatic-api',
          nextDocId: 'symbolic-crash-proof',
        },
      },
      {
        id: 'symbolic-crash-proof',
        folderId: 'advanced-intelligence',
        folderTitle: 'Behavioral Intelligence Architecture',
        fileName: 'symbolic-crash-proof.md',
        title: 'Symbolic Runtime Crash Proof',
        description: 'Mathematical proof chains that simulate unhandled runtime exceptions at caller line numbers.',
        readingTime: '2 min read',
        badge: 'Zero Guesswork',
        content: {
          overview:
            'When an API contract or function return is widened to null or undefined, Change Firewall symbolically walks the AST of all downstream consumers. It traces whether the consumer dereferences the return without an optional chaining (?.) or null guard, proving the exact TypeError before runtime.',
          codeLanguage: 'text',
          codeExample: `[SYMBOLIC CRASH PROOF (Zero Guesswork)]
Simulated Exception: TypeError: Cannot read properties of null (reading 'balance')
Origin:    src/services/account.ts (fetchAccount)
Crash Site: src/routes/account.ts:4
Proof Steps:
  ➔ 1. src/services/account.ts ➔ 'fetchAccount' contract widened to return null/undefined.
  ➔ 2. src/routes/account.ts:3 ➔ Invokes 'fetchAccount()' expecting a valid non-null object.
  ➔ 3. src/routes/account.ts:4 ➔ Direct unguarded access on nullable result: .balance
Auto-Fix Advice: Add optional chaining 'fetchAccount()?.balance' or a null guard check in src/routes/account.ts:3`,
          bulletPoints: [
            'Zero false alarms: omits warnings if the caller uses ?. or if (!obj) guards',
            'Identifies exact source line and downstream crash site file:line',
            'Outputs immediate copy-paste auto-fix advice',
          ],
          prevDocId: 'four-genius-pillars',
          nextDocId: 'fingerprint-matrix',
        },
      },
      {
        id: 'fingerprint-matrix',
        folderId: 'advanced-intelligence',
        folderTitle: 'Behavioral Intelligence Architecture',
        fileName: 'fingerprint-matrix.md',
        title: '11-Dimensional Behavioral Fingerprint',
        description: 'Multi-vector behavioral matrix scoring contract, auth, nullability, DB, event, and error shifts.',
        readingTime: '2 min read',
        badge: '11-D Matrix',
        content: {
          overview:
            'Unlike simplistic linters, Change Firewall projects every code change into an 11-dimensional vector space: API Contract, Authorization, Data Shape, Nullability Widening, Validation, Dependency, Database, Event Flow, Error Semantics, Performance, and Test Coverage.',
          table: {
            headers: ['Vector Dimension', 'Trigger Condition', 'Risk Implication'],
            rows: [
              ['API CONTRACT', 'Route return expression or parameter shifts', 'Client SDK and mobile app payload parsing failure'],
              ['AUTHORIZATION', 'Auth guard conditions or session checks altered', 'Privilege escalation or broken access control'],
              ['NULLABILITY', 'Return type widened with | null or | undefined', 'Unhandled TypeError runtime exceptions in callers'],
              ['DATABASE', 'ORM model queries or schema migrations modified', 'Query performance degradation or missing columns'],
              ['EVENT FLOW', 'EventEmitter hooks, publishers, or listeners altered', 'Silent background job failures or unhandled events'],
            ],
          },
          prevDocId: 'symbolic-crash-proof',
          nextDocId: 'behavioral-memory-store',
        },
      },
      {
        id: 'behavioral-memory-store',
        folderId: 'advanced-intelligence',
        folderTitle: 'Behavioral Intelligence Architecture',
        fileName: 'behavioral-memory-store.md',
        title: 'The Firewall Memory Store (.firewall/mem)',
        description: 'Persistent invariant engine that remembers function contracts, churn, and historical precedents.',
        readingTime: '2 min read',
        badge: 'Temporal Memory',
        content: {
          overview:
            'Change Firewall stores an ultra-lightweight, zero-config local snapshot directory in .firewall/memory/. It maintains contract invariant history across commits, measuring temporal stability. If a symbol guaranteed for 140+ commits is suddenly widened, it alerts developers and AI agents.',
          codeLanguage: 'bash',
          codeExample: `# Check status of persistent memory invariants
npx change-firewall memory status

# Record verified baseline contract snapshot at HEAD
npx change-firewall memory record`,
          bulletPoints: [
            'Contract Invariant History: Remembers guaranteed return shapes over months of commits',
            'Incident & Flaky Regression Memory: Applies stricter safety gates on historically high-churn files',
            'Approval Precedents: Remembers approved intentional breaking changes so engineers are never nagged twice',
          ],
          prevDocId: 'fingerprint-matrix',
          nextDocId: 'agent-intent-guard',
        },
      },
      {
        id: 'agent-intent-guard',
        folderId: 'advanced-intelligence',
        folderTitle: 'Behavioral Intelligence Architecture',
        fileName: 'agent-intent-guard.md',
        title: '"AI Agent Intent vs Reality" Guard',
        description: 'Compares Natural Language intent against actual AST mutations to catch stealth changes.',
        readingTime: '2 min read',
        badge: 'Agent Safety',
        content: {
          overview:
            'AI coding assistants are famous for hallucinatory collateral damage—claiming a simple style fix while accidentally deleting an authorization guard. The change-firewall audit-agent command compares prompt intent against AST deltas and computes an Intent Drift Score (0-100%).',
          codeLanguage: 'bash',
          codeExample: `# Audit stated intent against current uncommitted diffs
npx change-firewall audit-agent -i "Fix button padding in checkout UI"

# Output JSON report for automated agent loops
npx change-firewall audit-agent -i "Refactor payment service" --json`,
          bulletPoints: [
            'ALIGNED (0% Drift): Code mutations strictly match declared intent',
            'MODERATE_DRIFT (1-49% Drift): Minor auxiliary adjustments detected',
            'STEALTH_MUTATION (≥50% Drift): Unannounced security, auth, or database alterations (blocks merge)',
          ],
          prevDocId: 'behavioral-memory-store',
          nextDocId: 'real-world-scenarios',
        },
      },
      {
        id: 'real-world-scenarios',
        folderId: 'advanced-intelligence',
        folderTitle: 'Behavioral Intelligence Architecture',
        fileName: 'real-world-scenarios.md',
        title: 'Real-World AI Coding Scenarios',
        description: 'Real-world failure modes caught by Change Firewall in production teams.',
        readingTime: '3 min read',
        badge: 'Battle Tested',
        content: {
          overview:
            'Change Firewall was built to protect teams from the three most common catastrophic failure modes introduced by AI coding assistants.',
          bulletPoints: [
            'Scenario 1 (Silent Object Wrapper Breakage): AI refactors an API endpoint from "return user;" to "return { user };". The unit test passes because "res.status(200)" is returned, but every frontend consumer crashes with TypeError: Cannot read properties of undefined.',
            'Scenario 2 (Stealth Mutation): Developer prompts AI: "Adjust navbar spacing". The AI modifies CSS but also accidentally deletes a role check in auth.ts. Change Firewall flags STEALTH_MUTATION with 80% drift.',
            'Scenario 3 (Nullability Widening): AI changes a helper from returning string to string | null. Downstream callers continue executing without null guards. Change Firewall provides the Symbolic Crash Proof pointing directly to the crash line.',
          ],
          prevDocId: 'agent-intent-guard',
        },
      },
    ],
  },
];
