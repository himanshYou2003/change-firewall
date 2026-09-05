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
            'Add Change Firewall preflight to your GitHub Actions pull request workflow. It blocks merges whenever the risk score exceeds threshold.',
          codeLanguage: 'yaml',
          codeExample: `name: Change Firewall Safety Gate

on:
  pull_request:
    branches: [main, master]

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
      - run: npx change-firewall preflight --base origin/\${{ github.base_ref }}`,
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
        },
      },
    ],
  },
];
