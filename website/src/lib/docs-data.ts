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
        description: 'Instant behavioral diff analysis of your uncommitted working tree or staged commits.',
        readingTime: '2 min read',
        badge: 'Default Command',
        content: {
          overview:
            'Standard Git diffs only show lines added and removed (+10 / -4). They cannot detect broken API contracts, widened types, or downstream caller breaks. Run change-firewall to instantly translate raw code diffs into runtime consequences, caller blast radiuses, and a deterministic 0–100 risk score before you test or commit.',
          callout: {
            type: 'info',
            text: 'Why use this command? Run it immediately after you or an AI coding assistant finishes modifying code to verify behavioral safety in under 200ms.',
          },
          codeLanguage: 'bash',
          codeExample: `# 1. Instant terminal report against Git HEAD
npx change-firewall

# 2. Analyze and automatically launch interactive visual browser dashboard
npx change-firewall --open

# 3. Only analyze files in the Git staging area (git add)
npx change-firewall --staged

# 4. Compare working branch against target branch before opening a PR
npx change-firewall --base origin/main

# 5. Emit machine-readable JSON for CI pipelines or AI agent loops
npx change-firewall --json`,
          bulletPoints: [
            'Overall Risk Score (0-100): Calculated from blast radius, contract shifts, and file sensitivity',
            'Behavioral Mutation: Identifies shifts like DEPENDENCY SHIFT, CONTRACT MUTATION, or PURE REFACTOR',
            'Downstream Blast Radius: Counts all affected callers across the entire repository',
            '100% offline & local execution with zero cloud telemetry or token costs',
          ],
          prevDocId: 'core-concepts',
          nextDocId: 'cli-interactive',
        },
      },
      {
        id: 'cli-interactive',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'interactive.md',
        title: 'change-firewall interactive (inspect)',
        description: 'Keyboard-driven terminal inspector with call stacks, architecture graph, and symbolic crash proof.',
        readingTime: '2 min read',
        badge: 'Interactive TUI',
        content: {
          overview:
            'When you want to thoroughly investigate findings, expand downstream caller stacks, review mathematical crash proofs, and copy auto-fixes without leaving your shell or opening a browser. Launches an interactive TUI in an alternate screen buffer, preserving 100% of your terminal scrollback history upon exit.',
          callout: {
            type: 'tip',
            text: 'Why use this command? Inspect findings one-by-one with arrow keys and press [a] to immediately generate a copy-pasteable TypeScript repair snippet & Vitest stub.',
          },
          codeLanguage: 'bash',
          codeExample: `# Launch interactive terminal inspector (both commands are identical)
npx change-firewall inspect
npx change-firewall interactive

# Inspect only staged changes
npx change-firewall inspect --staged`,
          table: {
            headers: ['Key / Shortcut', 'Action', 'What It Shows'],
            rows: [
              ['↓ / ↑ or j / k', 'Browse Findings', 'Scroll between detected contract mutations and risk badges'],
              ['Tab', 'Call Stacks & Blast Radius', 'Expands full downstream caller list and blast radius depth'],
              ['g', 'Architecture Graph', 'Displays Unicode Behavior Graph tree directly in the TUI'],
              ['p', 'Symbolic Crash Proof', 'Traces deterministic runtime exception paths to exact caller line numbers'],
              ['f', '11-D Fingerprint Matrix', 'Displays the 11-dimensional behavioral mutation vector radar'],
              ['a', 'Auto-Fix & Test Stub', 'Generates 1-line code fix and Vitest test stub ready to paste'],
              ['q / Ctrl+C', 'Quit', 'Cleanly exits and restores normal terminal cursor & scrollback'],
            ],
          },
          prevDocId: 'cli-analyze',
          nextDocId: 'cli-audit-agent',
        },
      },
      {
        id: 'cli-audit-agent',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'audit-agent.md',
        title: 'change-firewall audit-agent',
        description: 'Audits AI agent prompt intent vs actual code mutations to catch stealth changes and scope drift.',
        readingTime: '2 min read',
        badge: 'Agent Safety',
        content: {
          overview:
            'AI coding assistants frequently claim a harmless task (e.g. "Fix button padding and header colors") but secretly modify auth guards, alter database models, or touch 15+ backend files. audit-agent compares the stated prompt text (-i "...") against the real TypeScript AST diffs. If an unannounced contract shift or non-UI mutation occurred, it flags a STEALTH_MUTATION and exits with code 1 to block the PR!',
          callout: {
            type: 'warning',
            text: 'Why use this command? Run it in CI/CD against pull request titles or AI prompt descriptions to guarantee autonomous agents never sneak unauthorized backend changes into production.',
          },
          codeLanguage: 'bash',
          codeExample: `# 1. Audit an agent task prompt against current uncommitted diffs
npx change-firewall audit-agent -i "Fix button padding and header colors"

# 2. Audit a truthful, aligned task prompt
npx change-firewall audit-agent -i "Update firewall contract memory and BehaviorRole type"

# 3. Automated GitHub Actions usage (audits against the PR title)
npx change-firewall audit-agent -i "\${{ github.event.pull_request.title }}"`,
          table: {
            headers: ['Verdict', 'Drift Score', 'Behavior & CI Exit Code'],
            rows: [
              ['✓ ALIGNED', '0% Drift', 'Code mutations strictly match stated intent. Exit code 0 (Safe).'],
              ['ℹ️ MINOR_DRIFT', '1–39% Drift', 'Minor peripheral adjustments detected. Exit code 0 (Approved).'],
              ['⚠️ HIGH_DRIFT', '40–59% Drift', 'Changes exceed declared scope. Exit code 1 (Review Required).'],
              ['🚨 STEALTH_MUTATION', '≥60% Drift', 'Critical intent mismatch (e.g., UI claimed, auth/types touched). Exit code 1 (Blocked).'],
            ],
          },
          prevDocId: 'cli-interactive',
          nextDocId: 'cli-preflight',
        },
      },
      {
        id: 'cli-preflight',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'preflight.md',
        title: 'change-firewall preflight (gate)',
        description: 'Automated merge readiness gate for pre-commit hooks, CI/CD pipelines, and GitHub Actions.',
        readingTime: '2 min read',
        badge: 'Merge Gate',
        content: {
          overview:
            'Evaluates whether the current changeset is safe to merge into main. Exits with status code 0 if safe, or code 1 if blocked by broken contracts, excessive blast radius, or threshold breaches.',
          callout: {
            type: 'tip',
            text: 'Why use this command? Use it in CI/CD workflows and pre-commit hooks as an automated quality gate that prevents high-risk changes from entering production.',
          },
          codeLanguage: 'bash',
          codeExample: `# Standard preflight gate (fails if risk > 60 or high-severity findings exist)
npx change-firewall preflight

# Concise CI alias
npx change-firewall gate

# Specify custom risk tolerance (e.g., maximum score of 40)
npx change-firewall preflight --max-risk 40

# Compare PR against base branch in GitHub Actions
npx change-firewall preflight --base origin/main

# JSON output for automated bot comments and decision loops
npx change-firewall preflight --json`,
          bulletPoints: [
            'Exit Code 0: Safe to merge. All contract invariants and risk limits are satisfied.',
            'Exit Code 1: Merge blocked. One or more critical contract violations or risk breaches detected.',
            '--no-fail-on-high: Soften gate to only evaluate overall score without auto-failing on single findings',
          ],
          prevDocId: 'cli-audit-agent',
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
            'Classifies the architectural role of target files (API_ROUTE, AUTH_BOUNDARY, DATABASE_MODEL, SERVICE, TEST_SUITE, EVENT_CONSUMER) and displays incoming callers, outgoing dependencies, and protected data flows.',
          callout: {
            type: 'info',
            text: 'Why use this command? When you want to understand what a file does in the broader architecture and see every single component that imports it.',
          },
          codeLanguage: 'bash',
          codeExample: `# Render behavior graph for core entrypoint
npx change-firewall graph src/index.ts

# Inspect API route critical flow (Route ➔ Auth Guard ➔ DB Model)
npx change-firewall graph src/types/index.ts`,
          bulletPoints: [
            'Classifies semantic architectural roles with zero configuration',
            'Uncovers unprotected data access paths (missing auth guards)',
            'Displays multi-hop downstream execution flows with exact caller roles',
          ],
          prevDocId: 'cli-preflight',
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
            'Traverses the reverse import dependency graph using breadth-first search to find all direct and transitive consumers up to 3 hops deep. Know exactly who will be affected before you refactor a function or service.',
          callout: {
            type: 'tip',
            text: 'Why use this command? Run it before touching a shared file or type to know your exact blast radius before writing code.',
          },
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
          prevDocId: 'cli-graph',
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
            'Persists verified symbol contracts and endpoint schemas in .firewall/memory/invariants.json. Detects broken invariants when code that has been stable for dozens of commits is unexpectedly altered by an AI assistant.',
          callout: {
            type: 'info',
            text: 'Why use this command? Protects legacy code and long-standing contracts from being silently broken during large automated refactors.',
          },
          codeLanguage: 'bash',
          codeExample: `# View persistent memory status & verified invariants count
npx change-firewall memory status

# Record verified baseline contract snapshot at HEAD
npx change-firewall memory record

# Reset persistent memory
npx change-firewall memory reset`,
          bulletPoints: [
            'Stamps the real Git commit hash and timestamp onto verified contracts',
            'Tracks historical commit observation counts per function/type',
            'Automatically alerts on Broken Historical Invariants when stable code mutates',
          ],
          prevDocId: 'cli-impact',
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
            'Launches an embedded file watcher and HTTP server. Whenever an AI agent writes or modifies code in your workspace, the dashboard recalculates risk in milliseconds and updates live over Server-Sent Events (SSE) without page reloads.',
          callout: {
            type: 'tip',
            text: 'Why use this command? Keep it running on a second monitor while working with Cursor, Devin, or Claude Code to see your risk score update live as files are saved.',
          },
          codeLanguage: 'bash',
          codeExample: `# Start watch mode on default port 4783
npx change-firewall watch

# Custom port without auto-opening the browser
npx change-firewall watch -p 5000 --no-open`,
          bulletPoints: [
            'Debounced file watcher (350ms) prevents thrashing during multi-file AI writes',
            'Streams deltas directly to web dashboard via SSE',
            'Zero configuration required — automatically discovers project root',
          ],
          prevDocId: 'cli-memory',
          nextDocId: 'cli-open',
        },
      },
      {
        id: 'cli-open',
        folderId: 'cli-commands',
        folderTitle: 'CLI Command Reference',
        fileName: 'open.md',
        title: 'change-firewall open',
        description: 'Spins up the embedded local web dashboard loaded with current working tree analysis.',
        readingTime: '1 min read',
        badge: 'Web UI',
        content: {
          overview:
            'Launches the rich, interactive browser visualizer at http://localhost:4783. Explore interactive node graphs, click nodes to view blast radiuses, and review side-by-side AST contract comparisons.',
          callout: {
            type: 'info',
            text: 'Why use this command? When you prefer a beautiful, graphical interface over the terminal to visually explore dependencies and findings.',
          },
          codeLanguage: 'bash',
          codeExample: `# Open local dashboard on default port
npx change-firewall open

# Specify custom port
npx change-firewall open -p 5000`,
          prevDocId: 'cli-watch',
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
          callout: {
            type: 'info',
            text: 'Why use this command? Run it before editing an unfamiliar file to understand who wrote it, how often it changes, and its sensitivity.',
          },
          codeLanguage: 'bash',
          codeExample: `npx change-firewall why src/index.ts`,
          prevDocId: 'cli-open',
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
            'Starts a standard JSON-RPC 2.0 MCP server over stdio. Connects natively with Claude Desktop, Google Antigravity, Cursor, and Windsurf, enabling AI agents to autonomously evaluate diffs and self-heal breaking changes.',
          callout: {
            type: 'info',
            text: 'Why use this command? Configure it in your AI assistant to give the model superpowers: it can call Change Firewall tools autonomously to test and fix its own code.',
          },
          codeLanguage: 'bash',
          codeExample: `# Start MCP server process (normally managed by the AI client)
npx change-firewall mcp`,
          prevDocId: 'cli-why',
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
