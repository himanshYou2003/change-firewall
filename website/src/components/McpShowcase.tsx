'use client';

import React, { useState } from 'react';
import { Copy, Check, Sparkles, Terminal, Bot, ShieldCheck, Cpu, Code2, Layers, CheckCircle2 } from 'lucide-react';

interface McpPlatform {
  id: string;
  name: string;
  vendor: string;
  badgeColor: string;
  fileLocation: string;
  config: string;
  summary: string;
  mockup: {
    title: string;
    agentName: string;
    prompt: string;
    toolCalled: string;
    resultSnippet: string;
    status: string;
  };
}

const MCP_PLATFORMS: McpPlatform[] = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    vendor: 'Anthropic',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    fileLocation: 'macOS: ~/Library/Application Support/Claude/claude_desktop_config.json',
    config: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
    summary:
      'Claude Desktop spawns Change Firewall as a local background process via stdio. A hammer 🔨 icon appears in Claude chat with all 4 deterministic tools ready to invoke.',
    mockup: {
      title: 'Claude Desktop 3.7 Sonnet',
      agentName: 'Claude',
      prompt: 'Refactor user session authentication and check if anything broke.',
      toolCalled: 'change-firewall.analyze_changes',
      resultSnippet: 'AST diff complete: 0 contract breaks. Risk Score: 12/100 (Safe). Blast radius: 2 consumers updated.',
      status: 'Ready to Merge',
    },
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    vendor: 'Google',
    badgeColor: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30',
    fileLocation: 'Global: ~/.gemini/config/mcp_config.json | Workspace: .agents/mcp_config.json',
    config: `{
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
    summary:
      'Google Antigravity automatically detects the MCP server during startup. The autonomous agent pairs with Change Firewall to self-correct hallucinated API signatures before presenting code.',
    mockup: {
      title: 'Google Antigravity IDE (Agentic Pair)',
      agentName: 'Antigravity Assistant',
      prompt: 'Verify downstream caller impact for src/services/auth.ts before committing.',
      toolCalled: 'change-firewall.compute_blast_radius',
      resultSnippet: 'Traversed reverse AST graph: 5 downstream callers identified. All imports match new TypeScript signature.',
      status: 'Gate Passed (Exit 0)',
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    vendor: 'Composer',
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    fileLocation: 'Cursor Settings > Features > MCP > + Add New MCP Server',
    config: `{
  "name": "change-firewall",
  "type": "command",
  "command": "npx -y change-firewall mcp"
}`,
    summary:
      'Cursor displays a green active status dot for Change Firewall. Both Cursor Composer (Cmd+I) and Cursor Chat (Cmd+L) can invoke preflight checks deterministically.',
    mockup: {
      title: 'Cursor Composer (Cmd+I)',
      agentName: 'Cursor Agent',
      prompt: 'Execute preflight check on staged git modifications.',
      toolCalled: 'change-firewall.evaluate_preflight',
      resultSnippet: 'Preflight check: PASS. 0 high-risk mutations, risk score 18/100 below threshold 60.',
      status: 'Verified Safe',
    },
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    vendor: 'Codeium',
    badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    fileLocation: '~/.codeium/windsurf/mcp_config.json',
    config: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
    summary:
      'Windsurf Cascade seamlessly accesses Change Firewall tools to audit multi-file agent workflows, pinpointing collateral damage across unedited files in real time.',
    mockup: {
      title: 'Windsurf Cascade Agent',
      agentName: 'Cascade',
      prompt: 'Audit collateral damage from renaming getUser to fetchUserProfile.',
      toolCalled: 'change-firewall.explain_file_impact',
      resultSnippet: 'Detected 3 broken export references in src/routes/api.ts. Self-healing applied.',
      status: 'Self-Corrected',
    },
  },
  {
    id: 'copilot',
    name: 'Copilot & Codex',
    vendor: 'Rules / CLI',
    badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    fileLocation: '.github/copilot-instructions.md or AGENTS.md',
    config: `### AI Agent Verification Protocol
Always verify code changes with Change Firewall before reporting completion:
1. Run \`npx change-firewall preflight --json\`
2. If \`readyToMerge\` is false, revert breaking contract mutations immediately.
3. For file impact, run \`npx change-firewall impact <filepath>\``,
    summary:
      'Inject clear deterministic rules into Copilot Workspace, Codex, or Claude Code CLI. Terminal agents run the preflight gate autonomously to ensure 100% bug-free delivery.',
    mockup: {
      title: 'Autonomous Terminal Agent',
      agentName: 'Codex / CLI Agent',
      prompt: 'Running preflight safety gate before git push...',
      toolCalled: 'npx change-firewall preflight --json',
      resultSnippet: '{"readyToMerge": true, "riskScore": 14, "blockers": []}',
      status: 'Exit Code: 0',
    },
  },
];

export default function McpShowcase() {
  const [activeId, setActiveId] = useState<string>('claude');
  const [copied, setCopied] = useState<boolean>(false);

  const activePlatform = MCP_PLATFORMS.find((p) => p.id === activeId) || MCP_PLATFORMS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activePlatform.config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="mcp-hub" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
            <span>Open Standard Protocol (MCP)</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Universal AI Integration
          </h2>
          <p className="mt-3 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            Configure once. Connect Change Firewall natively to Claude Desktop, Google Antigravity, Cursor, Windsurf, and Copilot with zero custom wrappers.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="glass-panel rounded-2xl border border-[var(--border-card)] p-2 shadow-xl mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {MCP_PLATFORMS.map((platform) => {
              const isSelected = platform.id === activeId;
              return (
                <button
                  key={platform.id}
                  onClick={() => setActiveId(platform.id)}
                  className={`px-4 py-3 rounded-xl text-xs font-medium transition-all flex flex-col items-start gap-1 text-left relative overflow-hidden ${
                    isSelected
                      ? 'bg-[var(--surface-100)] border border-brand-cyan/50 shadow-md ring-1 ring-brand-cyan/20'
                      : 'hover:bg-[var(--surface-100)]/60 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-semibold ${isSelected ? 'text-[var(--text-primary)]' : ''}`}>
                      {platform.name}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${platform.badgeColor}`}>
                      {platform.vendor}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] truncate w-full">
                    {platform.id === 'claude' && 'Desktop Hammer 🔨'}
                    {platform.id === 'antigravity' && 'Agent Custom Tool'}
                    {platform.id === 'cursor' && 'Composer & Chat'}
                    {platform.id === 'windsurf' && 'Cascade Engine'}
                    {platform.id === 'copilot' && 'Rules Protocol'}
                  </span>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-cyan to-brand-purple" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Viewer for Selected Platform */}
        <div className="glass-panel rounded-2xl border border-[var(--border-card)] overflow-hidden shadow-2xl">
          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Configuration Code Box */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>{activePlatform.name} Configuration</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    {activePlatform.fileLocation}
                  </p>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] text-xs text-brand-cyan hover:text-[var(--text-primary)] transition-all hover:scale-105"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-success" />
                      <span className="text-brand-success font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Config</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="code-dark-panel rounded-xl border border-white/10 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/[0.06] text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-slate-300 font-medium">
                      {activePlatform.id === 'copilot' ? 'AGENTS.md' : 'mcp_config.json'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {activePlatform.id === 'copilot' ? 'Markdown' : 'JSON'}
                  </span>
                </div>
                <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{activePlatform.config}</code>
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-50)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
                <strong className="text-[var(--text-primary)]">How it works: </strong>
                {activePlatform.summary}
              </div>
            </div>

            {/* Right Column: Live Simulated Platform UI Mockup */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Simulated {activePlatform.name} Experience</span>
              </div>

              {/* Platform Mockup Card */}
              <div className="code-dark-panel rounded-xl border border-white/10 p-5 space-y-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-brand-cyan" />
                    </div>
                    <span className="text-xs font-bold text-white">
                      {activePlatform.mockup.title}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    MCP Active
                  </span>
                </div>

                {/* User Prompt */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">User Input</div>
                  <div className="text-xs text-slate-200 bg-white/[0.04] p-2.5 rounded-lg border border-white/[0.05]">
                    &ldquo;{activePlatform.mockup.prompt}&rdquo;
                  </div>
                </div>

                {/* Autonomous Tool Call */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-brand-cyan flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>Autonomous Tool Invocation</span>
                  </div>
                  <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg p-2.5 text-xs font-mono text-cyan-200 flex items-center justify-between">
                    <span>⚡ {activePlatform.mockup.toolCalled}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                </div>

                {/* Tool Response */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Deterministic Feedback</div>
                  <div className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg border border-white/[0.05] leading-relaxed">
                    {activePlatform.mockup.resultSnippet}
                  </div>
                </div>

                {/* Gate Status Footer */}
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Safety Gate Result:</span>
                  <span className="font-semibold text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {activePlatform.mockup.status}
                  </span>
                </div>
              </div>

              {/* 4 Exposed Tools Pills */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-50)] border border-[var(--border-subtle)] space-y-2">
                <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                  Exposed MCP Toolset:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-1.5 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] font-mono text-brand-cyan truncate">
                    analyze_changes
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] font-mono text-brand-danger truncate">
                    evaluate_preflight
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] font-mono text-brand-purple truncate">
                    compute_blast_radius
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] font-mono text-amber-500 truncate">
                    explain_file_impact
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
