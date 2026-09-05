export interface DocSection {
  id: string;
  title: string;
  category: string;
  description: string;
  badge?: string;
  content: {
    overview: string;
    codeExample?: string;
    codeLanguage?: string;
    table?: {
      headers: string[];
      rows: string[][];
    };
    callout?: {
      type: 'tip' | 'warning' | 'info';
      text: string;
    };
    bulletPoints?: string[];
  };
}

export const DOC_CATEGORIES = [
  'Getting Started',
  'CLI Reference',
  'Model Context Protocol (MCP)',
  'Programmatic API',
  'CI/CD & Git Hooks',
  'Real-World Scenarios',
];

export const DOCS_DATA: DocSection[] = [
  {
    id: 'why-change-firewall',
    title: 'Why Use Change Firewall?',
    category: 'Getting Started',
    badge: 'Core Problem',
    description: 'The critical difference between developer intent and downstream consequences in agentic coding.',
    content: {
      overview:
        'AI coding assistants (Cursor, Claude Code, GitHub Copilot, Devin, Antigravity) are writing code faster than humans can review. An AI can change 20 files in 3 seconds and report "Auth added, tests passing". But standard git diffs only show line additions (+1) and deletions (-1). Tests only test what they were written for. Change Firewall transforms raw diffs into AST behavioral reports, caller blast radius mapping, and deterministic risk scores.',
      callout: {
        type: 'warning',
        text: 'Silent contract mutations are the #1 cause of production outages in AI-assisted codebases.',
      },
      table: {
        headers: ['Tool', 'What It Sees', 'Result'],
        rows: [
          [
            'Git Diff',
            '1 line modified (+1, -1)',
            'Looks tiny and harmless. Reviewer clicks Approve PR.',
          ],
          [
            'Change Firewall',
            '🔴 HIGH RISK: API Response Contract Mutated\n• Endpoint: GET /api/user\n• Before: User\n• After: { user: User }\n• Blast Radius: 7 client consumers broken!',
            'Catches the breaking mutation before staging or production crashes.',
          ],
        ],
      },
    },
  },
  {
    id: 'quick-start',
    title: 'Quick Start (Zero Install)',
    category: 'Getting Started',
    badge: 'Zero Config',
    description: 'Run Change Firewall inside any JavaScript or TypeScript Git repository instantly.',
    content: {
      overview:
        'You do not need an account, an API key, or a cloud server. Change Firewall runs 100% locally on your machine.',
      codeLanguage: 'bash',
      codeExample: `# Run instant analysis on your current Git working tree
npx change-firewall

# Or analyze and open the interactive local dashboard in your browser
npx change-firewall --open`,
      bulletPoints: [
        'Deterministic AST inspection with zero hallucination lag',
        'Works with pure JavaScript, TypeScript, React, Next.js, Node.js, Express',
        'Zero cloud tracking — your proprietary code never leaves your computer',
      ],
    },
  },
  {
    id: 'cli-analyze',
    title: '1. change-firewall analyze',
    category: 'CLI Reference',
    badge: 'Default',
    description: 'Deep behavioral diff analysis of your uncommitted working tree or staged changes.',
    content: {
      overview:
        'Parses all modified code files using the TypeScript Compiler AST parser, builds the reverse dependency graph, inspects caller blast radiuses, and calculates a deterministic risk score from 0 to 100.',
      codeLanguage: 'bash',
      codeExample: `# Default terminal report
npx change-firewall

# Output structured JSON for AI coding agents or CI pipelines
npx change-firewall --json

# Analyze only staged files (git add)
npx change-firewall --staged

# Compare against a specific base branch or commit (e.g. origin/main)
npx change-firewall --base origin/main`,
      callout: {
        type: 'tip',
        text: 'Pass --json to let AI assistants (Claude Code, Cursor Composer, Aider) inspect and self-heal their own diffs.',
      },
    },
  },
  {
    id: 'cli-preflight',
    title: '2. change-firewall preflight',
    category: 'CLI Reference',
    badge: 'Merge Gate',
    description: 'Determines whether current changes are safe to merge (exits 0 for safe, 1 for blocked).',
    content: {
      overview:
        'Acts as an automated preflight gate for pre-commit hooks, CI/CD pull requests, and agent self-correction. Blocks whenever the risk score exceeds threshold or any high-risk contract mutation is detected without tests.',
      codeLanguage: 'bash',
      codeExample: `# Run preflight gate with default risk threshold (60/100)
npx change-firewall preflight

# Set a custom risk threshold (e.g., allow up to 75)
npx change-firewall preflight --max-risk 75

# Output machine-readable JSON evaluation
npx change-firewall preflight --json`,
    },
  },
  {
    id: 'cli-watch',
    title: '3. change-firewall watch',
    category: 'CLI Reference',
    badge: 'Live SSE',
    description: 'Real-time live monitoring that re-analyzes whenever AI agents write files.',
    content: {
      overview:
        'Launches an embedded file watcher that streams real-time updates over Server-Sent Events (SSE) to the local browser dashboard whenever files are saved.',
      codeLanguage: 'bash',
      codeExample: `# Start live watch mode on default port 4783
npx change-firewall watch

# Custom dashboard port without auto-opening browser
npx change-firewall watch -p 5000 --no-open`,
    },
  },
  {
    id: 'cli-impact',
    title: '4. change-firewall impact <file>',
    category: 'CLI Reference',
    badge: 'Blast Radius',
    description: 'Calculates the downstream ripple effect, consumers, and routes for a specific file.',
    content: {
      overview:
        'Traverses the reverse import dependency graph using breadth-first search to find all direct and indirect consumers up to 3 hops deep, highlighting affected API routes and services.',
      codeLanguage: 'bash',
      codeExample: `# Inspect the ripple effect of changing auth.ts
npx change-firewall impact src/services/auth.ts`,
    },
  },
  {
    id: 'cli-mcp',
    title: '5. change-firewall mcp',
    category: 'CLI Reference',
    badge: 'Native MCP',
    description: 'Launches the Model Context Protocol (MCP) server over standard I/O for AI assistants.',
    content: {
      overview:
        'Starts the native MCP server over stdio. Connects with Claude Desktop, Google Antigravity, Cursor, and Windsurf, exposing tools to analyze diffs, compute blast radius, and evaluate merge safety natively.',
      codeLanguage: 'bash',
      codeExample: `# Run MCP server (usually configured in Claude or Antigravity config)
npx change-firewall mcp`,
      callout: {
        type: 'info',
        text: 'Stdio output is strictly reserved for JSON-RPC messages; all diagnostics route to stderr to prevent stream corruption.',
      },
    },
  },
  {
    id: 'mcp-claude',
    title: 'Claude Desktop MCP Setup',
    category: 'Model Context Protocol (MCP)',
    badge: 'Anthropic',
    description: 'Connect Change Firewall directly into Claude Desktop for native tool execution.',
    content: {
      overview:
        'Add Change Firewall to your Claude Desktop configuration file. Claude will display a hammer icon in the chat box with 4 native tools available.',
      codeLanguage: 'json',
      codeExample: `// ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
// %APPDATA%\\Claude\\claude_desktop_config.json (Windows)
{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
    },
  },
  {
    id: 'mcp-antigravity',
    title: 'Google Antigravity MCP Setup',
    category: 'Model Context Protocol (MCP)',
    badge: 'Google',
    description: 'Connect Change Firewall into Google Antigravity IDE and CLI agents.',
    content: {
      overview:
        'Add Change Firewall to your global Antigravity configuration file or project-specific .agents directory.',
      codeLanguage: 'json',
      codeExample: `// ~/.gemini/config/mcp_config.json
{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
    },
  },
  {
    id: 'mcp-cursor',
    title: 'Cursor & Windsurf MCP Setup',
    category: 'Model Context Protocol (MCP)',
    badge: 'Editor',
    description: 'Enable native MCP tools in Cursor Composer and Windsurf Cascade.',
    content: {
      overview:
        'In Cursor: Settings > Features > MCP > Add New MCP Server. Name: change-firewall, Type: command, Command: npx -y change-firewall mcp.',
      codeLanguage: 'bash',
      codeExample: `# Cursor Settings Command:
npx -y change-firewall mcp`,
    },
  },
  {
    id: 'programmatic-api',
    title: 'Programmatic TypeScript API',
    category: 'Programmatic API',
    badge: 'Full Types',
    description: 'Integrate Change Firewall directly into your custom scripts, testing suites, or backend tools.',
    content: {
      overview:
        'Change Firewall exports pure TypeScript functions returning strongly-typed objects for analysis, preflight checking, and blast radius calculation.',
      codeLanguage: 'typescript',
      codeExample: `import {
  analyzeChanges,
  evaluatePreflight,
  computeBlastRadius,
  startMcpServer
} from 'change-firewall';

// 1. Analyze Git working tree
const report = await analyzeChanges({ cwd: process.cwd() });
console.log('Risk score:', report.risk.score);

// 2. Preflight evaluation
const preflight = evaluatePreflight(report, { maxRisk: 60 });
if (!preflight.readyToMerge) {
  console.error('Merge blocked:', preflight.blockers);
}

// 3. Blast radius inspection
const blast = computeBlastRadius('src/auth.ts', graph);
console.log('Consumers affected:', blast.totalConsumers);`,
    },
  },
  {
    id: 'ci-cd-github-actions',
    title: 'CI/CD & GitHub Actions Gate',
    category: 'CI/CD & Git Hooks',
    badge: 'Automation',
    description: 'Block dangerous pull requests automatically in your continuous integration pipeline.',
    content: {
      overview:
        'Add Change Firewall to your PR workflow. It analyzes only the commits introduced in the pull request against the base branch.',
      codeLanguage: 'yaml',
      codeExample: `name: Change Firewall PR Gate

on:
  pull_request:
    branches: [ main, master, develop ]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx change-firewall preflight --base origin/\${{ github.base_ref }}`,
    },
  },
];
