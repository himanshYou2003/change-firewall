'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Terminal,
  Bot,
  CheckCircle2,
  Zap,
  Info,
  Code2,
} from 'lucide-react';

type OsType = 'macos' | 'windows' | 'linux';

interface McpPlatform {
  id: string;
  name: string;
  vendor: string;
  featurePill: string;
  paths: Record<OsType, string>;
  configs: Record<OsType, string>;
  explanation: string;
  mockup: {
    platformTitle: string;
    agentName: string;
    prompt: string;
    toolCalled: string;
    executionTime: string;
    resultSummary: string;
    details: string[];
    gateStatus: string;
  };
}

const MCP_PLATFORMS: McpPlatform[] = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    vendor: 'Anthropic',
    featurePill: 'Desktop Hammer 🔨',
    paths: {
      macos: '~/Library/Application Support/Claude/claude_desktop_config.json',
      windows: '%APPDATA%\\Claude\\claude_desktop_config.json',
      linux: '~/.config/Claude/claude_desktop_config.json',
    },
    configs: {
      macos: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
      windows: `{
  "mcpServers": {
    "change-firewall": {
      "command": "cmd.exe",
      "args": ["/c", "npx", "-y", "change-firewall", "mcp"]
    }
  }
}`,
      linux: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
    },
    explanation:
      'Claude Desktop natively spawns Change Firewall as a local process over stdio. A hammer icon appears in chat with all 4 tools ready to execute.',
    mockup: {
      platformTitle: 'Claude 3.7 Sonnet',
      agentName: 'Claude',
      prompt: 'Refactor user session authentication and check if anything broke.',
      toolCalled: 'change-firewall.analyze_changes',
      executionTime: '18ms',
      resultSummary: 'AST diff complete: 0 contract breaks. Risk Score: 12/100 (Safe).',
      details: [
        'Checked 14 export signatures across 3 files',
        '2 downstream consumers auto-updated',
        'All parameter nullability contracts verified',
      ],
      gateStatus: 'READY TO MERGE',
    },
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    vendor: 'Google',
    featurePill: 'Agent Custom Tool',
    paths: {
      macos: '~/.gemini/config/mcp_config.json or .agents/mcp_config.json',
      windows: '%USERPROFILE%\\.gemini\\config\\mcp_config.json',
      linux: '~/.gemini/config/mcp_config.json or .agents/mcp_config.json',
    },
    configs: {
      macos: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"],
      "env": {
        "FIREWALL_STRICT": "true"
      }
    }
  }
}`,
      windows: `{
  "mcpServers": {
    "change-firewall": {
      "command": "cmd.exe",
      "args": ["/c", "npx", "-y", "change-firewall", "mcp"],
      "env": {
        "FIREWALL_STRICT": "true"
      }
    }
  }
}`,
      linux: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"],
      "env": {
        "FIREWALL_STRICT": "true"
      }
    }
  }
}`,
    },
    explanation:
      'Google Antigravity detects the MCP server on startup. Autonomous pair-programming agents invoke blast-radius calculations before presenting changes.',
    mockup: {
      platformTitle: 'Google Antigravity IDE',
      agentName: 'Antigravity Assistant',
      prompt: 'Verify downstream caller impact for src/services/auth.ts before committing.',
      toolCalled: 'change-firewall.compute_blast_radius',
      executionTime: '24ms',
      resultSummary: 'Traversed reverse AST graph: 5 downstream callers identified.',
      details: [
        'userController.ts (Direct caller: 1 hop)',
        'sessionMiddleware.ts (Direct caller: 1 hop)',
        'DashboardView.tsx (Transitive caller: 2 hops)',
      ],
      gateStatus: 'SAFETY GATE PASSED',
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    vendor: 'Composer',
    featurePill: 'Composer & Chat',
    paths: {
      macos: 'Cursor Settings > Features > MCP > + Add New MCP Server',
      windows: 'Cursor Settings > Features > MCP > + Add New MCP Server',
      linux: 'Cursor Settings > Features > MCP > + Add New MCP Server',
    },
    configs: {
      macos: `{
  "name": "change-firewall",
  "type": "command",
  "command": "npx -y change-firewall mcp"
}`,
      windows: `{
  "name": "change-firewall",
  "type": "command",
  "command": "cmd.exe /c npx -y change-firewall mcp"
}`,
      linux: `{
  "name": "change-firewall",
  "type": "command",
  "command": "npx -y change-firewall mcp"
}`,
    },
    explanation:
      'Cursor displays a green active status dot for Change Firewall. Both Cursor Composer (Cmd+I) and Chat run preflight gates deterministically.',
    mockup: {
      platformTitle: 'Cursor Composer (Cmd+I)',
      agentName: 'Composer Agent',
      prompt: 'Execute preflight check on staged git modifications.',
      toolCalled: 'change-firewall.evaluate_preflight',
      executionTime: '15ms',
      resultSummary: 'Preflight check: PASS. 0 high-risk contract mutations detected.',
      details: [
        'Risk Score: 18 / 100 (Threshold: 60)',
        'Zero breaking exports detected in 4 modified files',
        'Ready for Git staging and review',
      ],
      gateStatus: 'VERIFIED SAFE',
    },
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    vendor: 'Codeium',
    featurePill: 'Cascade Engine',
    paths: {
      macos: '~/.codeium/windsurf/mcp_config.json',
      windows: '%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json',
      linux: '~/.codeium/windsurf/mcp_config.json',
    },
    configs: {
      macos: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
      windows: `{
  "mcpServers": {
    "change-firewall": {
      "command": "cmd.exe",
      "args": ["/c", "npx", "-y", "change-firewall", "mcp"]
    }
  }
}`,
      linux: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
    },
    explanation:
      'Windsurf Cascade accesses Change Firewall tools to audit multi-file agent workflows, pinpointing collateral damage across unedited files.',
    mockup: {
      platformTitle: 'Windsurf Cascade',
      agentName: 'Cascade',
      prompt: 'Audit collateral damage from renaming getUser to fetchUserProfile.',
      toolCalled: 'change-firewall.explain_file_impact',
      executionTime: '21ms',
      resultSummary: 'Detected 3 broken export references in src/routes/api.ts.',
      details: [
        'Identified outdated call site: api.ts:line 42',
        'Generated compatible type alias wrapper',
        'Self-healing patch applied before save',
      ],
      gateStatus: 'SELF-HEALED',
    },
  },
  {
    id: 'copilot',
    name: 'Copilot & Codex',
    vendor: 'Rules / CLI',
    featurePill: 'Rules Protocol',
    paths: {
      macos: '.github/copilot-instructions.md or AGENTS.md',
      windows: '.github\\copilot-instructions.md or AGENTS.md',
      linux: '.github/copilot-instructions.md or AGENTS.md',
    },
    configs: {
      macos: `### AI Agent Verification Protocol
Always verify code changes with Change Firewall before reporting completion:
1. Run \`npx change-firewall preflight --json\`
2. If \`readyToMerge\` is false, revert breaking contract mutations immediately.
3. For file impact, run \`npx change-firewall impact <filepath>\``,
      windows: `### AI Agent Verification Protocol
Always verify code changes with Change Firewall before reporting completion:
1. Run \`npx change-firewall preflight --json\`
2. If \`readyToMerge\` is false, revert breaking contract mutations immediately.
3. For file impact, run \`npx change-firewall impact <filepath>\``,
      linux: `### AI Agent Verification Protocol
Always verify code changes with Change Firewall before reporting completion:
1. Run \`npx change-firewall preflight --json\`
2. If \`readyToMerge\` is false, revert breaking contract mutations immediately.
3. For file impact, run \`npx change-firewall impact <filepath>\``,
    },
    explanation:
      'Inject deterministic verification rules into Copilot Workspace, Codex, or Claude Code CLI. Terminal agents run the preflight gate autonomously.',
    mockup: {
      platformTitle: 'CLI Agent Protocol',
      agentName: 'CLI Agent',
      prompt: 'Running preflight safety gate before git push...',
      toolCalled: 'npx change-firewall preflight --json',
      executionTime: '32ms',
      resultSummary: '{"readyToMerge": true, "riskScore": 14, "blockers": []}',
      details: [
        'Execution mode: Headless JSON-RPC',
        'Output parsed by agent loop',
        '0 blocking errors; git commit authorized',
      ],
      gateStatus: 'PR GATE PASSED',
    },
  },
];

const MCP_TOOLS = [
  {
    name: 'analyze_changes',
    badge: 'AST Diff & Risk Score',
    description: 'Parses TypeScript source ASTs to detect semantic mutations and calculates a deterministic 0-100 risk score.',
    params: '--staged, --base <ref>, --json',
  },
  {
    name: 'evaluate_preflight',
    badge: 'Merge Gate',
    description: 'Automated merge gate for CI/CD and agents. Exits 0 if safe, exits 1 if blocked by contract breaks.',
    params: '--max-risk <num>, --json',
  },
  {
    name: 'compute_blast_radius',
    badge: 'Downstream Callers',
    description: 'Traverses reverse dependency graph to find all client routes, UI components, and microservices.',
    params: '<filepath>, --depth <1-3>',
  },
  {
    name: 'explain_file_impact',
    badge: 'Architectural Churn',
    description: 'Explains the architectural role of modified files, historic git churn, and sensitive dependency routes.',
    params: '<filepath>',
  },
];

function renderJsonValue(val: string) {
  const tokens = val.split(/(".*?"|[{}\[\],]|true|false|\d+)/g);
  return tokens.map((token, i) => {
    if (!token) return null;
    if (token.startsWith('"') && token.endsWith('"')) {
      return (
        <span key={i} className="text-emerald-300">
          {token}
        </span>
      );
    }
    if (['{', '}', '[', ']', ','].includes(token)) {
      return (
        <span key={i} className="text-slate-400 font-bold">
          {token}
        </span>
      );
    }
    if (token === 'true' || token === 'false') {
      return (
        <span key={i} className="text-amber-300 font-semibold">
          {token}
        </span>
      );
    }
    return <span key={i} className="text-slate-200">{token}</span>;
  });
}

function renderJsonLine(line: string) {
  const keyValMatch = line.match(/^(\s*)("[\w\.-]+")\s*:\s*(.*)$/);
  if (keyValMatch) {
    const [, indent, key, rest] = keyValMatch;
    return (
      <>
        {indent}
        <span className="text-sky-300 font-medium">{key}</span>
        <span className="text-slate-400">: </span>
        {renderJsonValue(rest)}
      </>
    );
  }
  return renderJsonValue(line);
}

function renderMarkdownLine(line: string) {
  if (line.startsWith('###')) {
    return <span className="text-purple-300 font-semibold">{line}</span>;
  }
  if (line.match(/^\d+\./)) {
    return (
      <span>
        <span className="text-sky-300 font-bold">{line.slice(0, 3)}</span>
        <span className="text-slate-200">{line.slice(3)}</span>
      </span>
    );
  }
  return <span className="text-slate-200">{line}</span>;
}

function renderSyntaxHighlighted(code: string, isJson: boolean) {
  const lines = code.trim().split('\n');
  return (
    <div className="font-mono text-xs leading-relaxed py-3 overflow-x-auto select-text touch-pan-x">
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="flex hover:bg-white/[0.03] px-2.5 sm:px-3.5 py-0.5 group">
          <span className="w-5 sm:w-6 shrink-0 text-right pr-2 sm:pr-3 select-none text-slate-500/70 font-mono text-[10px] sm:text-[11px] group-hover:text-slate-400 border-r border-slate-800/80 mr-2 sm:mr-3">
            {lineIndex + 1}
          </span>
          <span className="flex-1 whitespace-pre">
            {isJson ? renderJsonLine(line) : renderMarkdownLine(line)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function McpShowcase() {
  const [activeId, setActiveId] = useState<string>('claude');
  const [selectedOs, setSelectedOs] = useState<OsType>('macos');
  const [copied, setCopied] = useState<boolean>(false);
  const [pathCopied, setPathCopied] = useState<boolean>(false);
  const [mobileDeckView, setMobileDeckView] = useState<'config' | 'simulator'>('config');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const activePlatform = MCP_PLATFORMS.find((p) => p.id === activeId) || MCP_PLATFORMS[0];
  const currentConfig = activePlatform.configs[selectedOs] || activePlatform.configs.macos;
  const currentPath = activePlatform.paths[selectedOs] || activePlatform.paths.macos;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(currentPath);
    setPathCopied(true);
    setTimeout(() => setPathCopied(false), 2000);
  };

  return (
    <section id="mcp-hub" className="py-20 relative">
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean & Minimal */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--surface-100)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] mb-3">
            <span>Open Standard Protocol (MCP)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Universal AI Integration
          </h2>

          <p className="mt-3 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            Configure once. Connect Change Firewall natively to Claude Desktop, Google Antigravity, Cursor, Windsurf, and Copilot with zero custom wrappers.
          </p>
        </div>

        {/* Mobile Swipeable Platform Track (< sm) */}
        <div className="flex sm:hidden overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 snap-x mb-5">
          {MCP_PLATFORMS.map((platform) => {
            const isSelected = platform.id === activeId;
            return (
              <button
                key={platform.id}
                onClick={() => setActiveId(platform.id)}
                className={`snap-start shrink-0 min-w-[140px] p-2.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-[var(--surface-100)] border-[var(--text-primary)] text-[var(--text-primary)] ring-1 ring-[var(--text-primary)]/20'
                    : 'bg-[var(--surface-main)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    {platform.vendor}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-xs font-semibold block truncate">
                    {platform.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono block truncate">
                    {platform.featurePill}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop / Tablet Grid Platform Selector (sm+) */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
          {MCP_PLATFORMS.map((platform) => {
            const isSelected = platform.id === activeId;
            return (
              <button
                key={platform.id}
                onClick={() => setActiveId(platform.id)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-[var(--surface-100)] border-[var(--text-primary)] text-[var(--text-primary)]'
                    : 'bg-[var(--surface-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-card)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    {platform.vendor}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
                  )}
                </div>

                <div className="mt-1">
                  <span className="text-xs font-semibold block truncate">
                    {platform.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono block truncate">
                    {platform.featurePill}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Minimal Showcase Deck */}
        <div className="bg-[var(--surface-main)] rounded-xl border border-[var(--border-subtle)] p-3.5 sm:p-6 lg:p-7">
          {/* Mobile Segmented Toggle (< lg) */}
          <div className="lg:hidden mb-4 p-1 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] grid grid-cols-2 gap-1">
            <button
              onClick={() => setMobileDeckView('config')}
              className={`py-2 px-3 rounded-md text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${
                mobileDeckView === 'config'
                  ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Config Setup</span>
            </button>
            <button
              onClick={() => setMobileDeckView('simulator')}
              className={`py-2 px-3 rounded-md text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${
                mobileDeckView === 'simulator'
                  ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>AI Simulation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Configuration Box */}
            <div className={`lg:col-span-7 flex-col gap-3.5 ${mobileDeckView === 'config' ? 'flex' : 'hidden lg:flex'}`}>
              {/* Header with Title & OS Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
                    {activePlatform.name} Configuration
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[11px] font-mono text-[var(--text-muted)] truncate max-w-[200px] xs:max-w-[260px] sm:max-w-md">
                      {currentPath}
                    </p>
                    <button
                      onClick={handleCopyPath}
                      title="Copy config file path"
                      className="shrink-0 text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1.5 py-0.5 rounded bg-[var(--surface-100)] border border-[var(--border-subtle)] transition-colors flex items-center gap-1"
                    >
                      {pathCopied ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy path</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* OS Switcher Pills */}
                <div className="flex items-center gap-1 p-0.5 rounded-md bg-[var(--surface-100)] border border-[var(--border-subtle)] self-start sm:self-auto shrink-0">
                  {(['macos', 'windows', 'linux'] as OsType[]).map((os) => (
                    <button
                      key={os}
                      onClick={() => setSelectedOs(os)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors uppercase ${
                        selectedOs === os
                          ? 'bg-[var(--surface-main)] text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {os === 'macos' ? 'macOS' : os === 'windows' ? 'Win' : 'Linux'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distinct Code Box with High-Contrast Background & Syntax Highlighting */}
              <div className="code-editor-box rounded-xl overflow-hidden shadow-sm">
                <div className="code-editor-header h-9 px-3.5 flex items-center justify-between select-none text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                    </div>
                    <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{activePlatform.id === 'copilot' ? 'AGENTS.md' : 'mcp_config.json'}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    title="Copy configuration"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="max-h-[360px] sm:max-h-[440px] overflow-y-auto overflow-x-auto custom-scrollbar">
                  {renderSyntaxHighlighted(currentConfig, activePlatform.id !== 'copilot')}
                </div>
              </div>

              {/* Explanation Note */}
              <div className="p-3 rounded-lg bg-[var(--surface-50)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
                <strong className="text-[var(--text-primary)]">How it works: </strong>
                {activePlatform.explanation}
              </div>
            </div>

            {/* Right Column: Clean Platform Simulator */}
            <div className={`lg:col-span-5 flex-col gap-3.5 ${mobileDeckView === 'simulator' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-muted)] font-mono">
                  Simulated {activePlatform.name} Experience
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-100)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  MCP Active
                </span>
              </div>

              {/* Simulated Window */}
              <div className="code-editor-box rounded-xl p-3.5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 mr-1">
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    </div>
                    <span className="text-xs font-medium text-white font-mono">
                      {activePlatform.mockup.platformTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activePlatform.mockup.executionTime}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">User Input</div>
                  <div className="text-xs text-slate-200 bg-white/[0.02] p-2.5 rounded border border-white/[0.05]">
                    &ldquo;{activePlatform.mockup.prompt}&rdquo;
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3 h-3" />
                    <span>Autonomous Tool Invocation</span>
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded p-2 text-xs font-mono text-slate-200 flex items-center justify-between">
                    <span>{activePlatform.mockup.toolCalled}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">Deterministic Feedback</div>
                  <div className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded border border-white/[0.05] space-y-1">
                    <p className="text-white font-medium">{activePlatform.mockup.resultSummary}</p>
                    <ul className="text-[11px] text-slate-400 space-y-0.5">
                      {activePlatform.mockup.details.map((d, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-500" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Safety Gate Result:</span>
                  <span className="text-slate-200 font-semibold px-2 py-0.5 rounded bg-white/[0.06] border border-white/10">
                    {activePlatform.mockup.gateStatus}
                  </span>
                </div>
              </div>

              {/* Minimal 4 Tools Shelf */}
              <div className="p-3 rounded-lg bg-[var(--surface-50)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--text-primary)] font-mono">
                    Exposed MCP Tools:
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    Click for details
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {MCP_TOOLS.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => setSelectedTool(selectedTool === tool.name ? null : tool.name)}
                      className={`p-2 rounded text-left border transition-all flex items-center justify-between ${
                        selectedTool === tool.name
                          ? 'bg-[var(--surface-100)] border-[var(--text-primary)] text-[var(--text-primary)]'
                          : 'bg-[var(--surface-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="font-mono text-[11px] font-medium truncate mr-2">
                        {tool.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0 px-1.5 py-0.5 rounded bg-[var(--surface-100)] border border-[var(--border-subtle)]">
                        {tool.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedTool && (
                  <div className="mt-2 p-2.5 rounded bg-[var(--surface-100)] border border-[var(--border-subtle)] text-xs font-mono space-y-1">
                    {(() => {
                      const t = MCP_TOOLS.find((item) => item.name === selectedTool);
                      if (!t) return null;
                      return (
                        <>
                          <div className="text-[var(--text-primary)] font-semibold flex items-center justify-between text-[11px]">
                            <span>{t.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">{t.params}</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] font-sans leading-relaxed">
                            {t.description}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
