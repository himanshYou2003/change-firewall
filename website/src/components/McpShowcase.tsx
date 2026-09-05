'use client';

import React, { useState } from 'react';
import { Copy, Check, Sparkles, Terminal, Bot, Cpu, ShieldAlert, FileCode2 } from 'lucide-react';

const MCP_TABS = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    badge: 'Anthropic',
    fileLocation: '~/Library/Application Support/Claude/claude_desktop_config.json',
    config: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
    explanation: 'Claude Desktop natively spawns Change Firewall as a local process and displays a hammer 🔨 icon with all 4 tools.',
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    badge: 'Google',
    fileLocation: '~/.gemini/config/mcp_config.json',
    config: `{
  "mcpServers": {
    "change-firewall": {
      "command": "npx",
      "args": ["-y", "change-firewall", "mcp"]
    }
  }
}`,
    explanation: 'Google Antigravity automatically queries the tools on startup, adding them directly to the agent toolset.',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    badge: 'Composer',
    fileLocation: 'Settings > Features > MCP > + Add New MCP Server',
    config: `{
  "name": "change-firewall",
  "type": "command",
  "command": "npx -y change-firewall mcp"
}`,
    explanation: 'Cursor enables green indicator status for Change Firewall, available inside Cursor Composer (Cmd+I) and Chat (Cmd+L).',
  },
  {
    id: 'copilot',
    name: 'Copilot & Codex',
    badge: 'Rules',
    fileLocation: '.github/copilot-instructions.md or AGENTS.md',
    config: `### Code Verification & Safety Protocol:
Before committing or completing any code change:
1. Run \`npx change-firewall preflight --json\`
2. If readyToMerge is false, self-correct any breaking API contract mutations.
3. For file impact, run \`npx change-firewall impact <file>\``,
    explanation: 'Terminal-capable AI agents (Claude Code, Aider, Codex) run Change Firewall commands to self-correct before user review.',
  },
];

export default function McpShowcase() {
  const [activeTab, setActiveTab] = useState('claude');
  const [copied, setCopied] = useState(false);

  const current = MCP_TABS.find((t) => t.id === activeTab) || MCP_TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="mcp-hub" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
            <span>Open Standard Protocol</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Universal AI Integration via MCP
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Configure once. Connect to Claude, Antigravity, Cursor, and Codex with zero custom glue code.
          </p>
        </div>

        {/* Tabbed Configuration Explorer */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Tabs header */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-surface-100/90 border-b border-white/[0.08]">
            {MCP_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 text-white border border-brand-cyan/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <span>{tab.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                  {tab.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Config Code Body */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Code Block */}
            <div className="lg:col-span-7 bg-[#090d15] rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface-100/60 border-b border-white/[0.06] text-xs font-mono text-slate-400">
                <span className="truncate max-w-[280px] sm:max-w-none">{current.fileLocation}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-brand-cyan hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-success" />
                      <span className="text-brand-success">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Config</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                <code>{current.config}</code>
              </pre>
            </div>

            {/* Right: What the AI can now do */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20">
                <div className="flex items-center gap-2 text-brand-cyan text-xs font-bold uppercase tracking-wider">
                  <Bot className="w-4 h-4" />
                  <span>AI Superpower Unlocked</span>
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {current.explanation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Exposed MCP Tools:
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                    <code className="text-brand-cyan font-mono font-semibold">analyze_changes</code>
                    <span className="text-slate-500">— AST diffing & risk score</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-danger" />
                    <code className="text-brand-danger font-mono font-semibold">evaluate_preflight</code>
                    <span className="text-slate-500">— Merge readiness gate</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                    <code className="text-brand-purple font-mono font-semibold">compute_blast_radius</code>
                    <span className="text-slate-500">— Downstream callers & routes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-warning" />
                    <code className="text-brand-warning font-mono font-semibold">explain_file_impact</code>
                    <span className="text-slate-500">— Architectural role & churn</span>
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
