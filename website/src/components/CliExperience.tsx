'use client';

import React, { useState } from 'react';
import {
  Terminal,
  GitBranch,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Layers,
  Sparkles,
  Command,
  ArrowRight,
  ShieldAlert,
  Bot,
  Database,
  Bug,
  Activity,
  FileCode2,
  Search,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

type CommandKey =
  | 'analyze'
  | 'inspect'
  | 'audit-agent'
  | 'preflight'
  | 'graph'
  | 'impact'
  | 'memory'
  | 'watch'
  | 'gate'
  | 'mcp';

type InspectorSubView = 'callstack' | 'proof' | 'fingerprint' | 'autofix';

interface CommandItem {
  id: CommandKey;
  label: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  command: string;
  whyUse: string;
  problemSolved: string;
  whenToRun: string;
  keyFlags: { flag: string; desc: string }[];
  exitCodeDesc: string;
}

const COMMANDS: CommandItem[] = [
  {
    id: 'analyze',
    label: 'analyze',
    badge: 'AST Diff',
    badgeColor: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20',
    icon: Zap,
    command: 'npx change-firewall analyze',
    whyUse:
      'Standard git diff only sees lines (+1 / -1). It has no idea if changing a parameter broke 12 API callers downstream. analyze computes the true blast radius, maps affected consumers, and gives an objective risk score (0-100).',
    problemSolved:
      'Accidentally merging breaking changes that look innocent in raw text diffs but crash client apps at runtime.',
    whenToRun: 'In pull requests, pre-merge reviews, or before pushing a refactor to remote.',
    keyFlags: [
      { flag: '--strict', desc: 'Exits with code 1 on Medium or higher risk (blocks CI)' },
      { flag: '--base <ref>', desc: 'Compare against git ref (e.g. origin/main)' },
      { flag: '--json', desc: 'Output raw machine-readable JSON for CI integration' },
    ],
    exitCodeDesc: 'Exit 0: Safe / Low Risk · Exit 1: High Risk or Contract Violations (in strict mode)',
  },
  {
    id: 'inspect',
    label: 'inspect',
    badge: 'Live TUI',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    icon: Terminal,
    command: 'npx change-firewall inspect',
    whyUse:
      'Opens a keyboard-driven terminal dashboard to interactively traverse 3-hop caller chains, inspect deterministic crash proofs, check 11-D vectors, and generate auto-fix test stubs before pushing.',
    problemSolved:
      'Having to mentally simulate caller dependencies or manually grep the codebase to find where your change propagates.',
    whenToRun: 'Locally while refactoring or when reviewing a risky diff before opening a pull request.',
    keyFlags: [
      { flag: 'Tab', desc: 'Toggle Downstream Call Stacks (up to 3 hops traversed)' },
      { flag: 'p', desc: 'View Deterministic Symbolic Runtime Crash Proof' },
      { flag: 'f', desc: 'Inspect 11-Dimensional Fingerprint Matrix vectors' },
      { flag: 'a', desc: 'Generate 1-line caller guard patch and Vitest stub' },
    ],
    exitCodeDesc: 'Interactive Mode · Press [q] or [Ctrl+C] to return to shell',
  },
  {
    id: 'audit-agent',
    label: 'audit-agent',
    badge: 'AI Guard',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: Bot,
    command: 'npx change-firewall audit-agent -i "Fix button padding and header colors"',
    whyUse:
      'AI coding assistants (Claude, Cursor, Copilot) frequently make unannounced modifications—such as deleting an auth guard or altering a database schema—while claiming to only "fix button colors". audit-agent calculates semantic intent drift and blocks stealth mutations.',
    problemSolved:
      'Silent security regressions and unauthorized architecture changes introduced by autonomous AI agents.',
    whenToRun: 'Whenever accepting an AI agent PR or running automated agentic coding pipelines in CI.',
    keyFlags: [
      { flag: '-i, --intent "<text>"', desc: 'Natural language prompt or claimed task description' },
      { flag: '--threshold <num>', desc: 'Maximum allowable drift score before blocking (default: 40%)' },
      { flag: '--strict', desc: 'Fail with Exit 1 on any unexplained contract shift' },
    ],
    exitCodeDesc: 'Exit 0: Stated intent matches AST changes · Exit 1: Stealth mutation or excessive drift',
  },
  {
    id: 'preflight',
    label: 'preflight',
    badge: '50ms Check',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: Activity,
    command: 'npx change-firewall preflight --staged',
    whyUse:
      'Ultra-fast 50ms sanity check designed specifically for Git pre-commit hooks. Catches unhandled null accesses and broken export signatures before you even make the commit.',
    problemSolved:
      'Pushing broken commits to GitHub only to wait 5 minutes for CI to fail on an obvious type mismatch.',
    whenToRun: 'Inside .husky/pre-commit or right before typing git commit.',
    keyFlags: [
      { flag: '--staged', desc: 'Only analyze staged files (git diff --cached)' },
      { flag: '--bail', desc: 'Exit immediately on the first high-severity finding' },
    ],
    exitCodeDesc: 'Exit 0: Preflight clean · Exit 1: Staged changes introduce broken contracts',
  },
  {
    id: 'graph',
    label: 'graph',
    badge: 'Visual Tree',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    icon: GitBranch,
    command: 'npx change-firewall graph src/models/subscription.ts',
    whyUse:
      'Visualizes how any file or function connects across the entire codebase. Draws a clean Unicode tree showing incoming callers, downstream clients, API routes, and background event workers.',
    problemSolved:
      'Operating with architectural blind spots when touching core backend models or shared utilities.',
    whenToRun: 'Before refactoring unfamiliar files or when architecting multi-module feature changes.',
    keyFlags: [
      { flag: '<file>', desc: 'Target TypeScript file or route to map' },
      { flag: '--depth <num>', desc: 'Maximum traversal depth (default: 3 hops)' },
    ],
    exitCodeDesc: 'Exit 0: Graph generated successfully',
  },
  {
    id: 'impact',
    label: 'impact',
    badge: 'Symbol Blast',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    icon: Search,
    command: 'npx change-firewall impact getUser',
    whyUse:
      'Shows every function, component, or route that directly or indirectly depends on a specific exported symbol. Warns you if any caller will crash if you change the symbol signature.',
    problemSolved:
      'Modifying a shared function signature without realizing it is consumed by 20 background workers.',
    whenToRun: 'Before renaming, refactoring, or deprecating a shared function or type.',
    keyFlags: [
      { flag: '<symbol>', desc: 'The exact function, interface, or type name to inspect' },
      { flag: '--strict', desc: 'Highlights un-guarded consumer call sites in bright red' },
    ],
    exitCodeDesc: 'Exit 0: Blast radius evaluated',
  },
  {
    id: 'memory',
    label: 'memory',
    badge: 'Invariant Cache',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    icon: Database,
    command: 'npx change-firewall memory status',
    whyUse:
      'Prevents critical contracts from silently drifting across long sprints. Saves a verified baseline snapshot into .firewall/memory/ and verifies that core invariants remain intact.',
    problemSolved:
      'Creeping architectural erosion where contracts slowly degrade across hundreds of incremental PRs.',
    whenToRun: 'Run "memory record" on main releases, and "memory status" to check stability.',
    keyFlags: [
      { flag: 'record', desc: 'Save current codebase contracts as the new invariant baseline' },
      { flag: 'status', desc: 'Display recorded invariants and stability metrics' },
      { flag: 'verify', desc: 'Verify working tree against recorded baseline' },
    ],
    exitCodeDesc: 'Exit 0: Invariants verified · Exit 1: Invariant regression detected',
  },
  {
    id: 'watch',
    label: 'watch',
    badge: 'Live Daemon',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    icon: Activity,
    command: 'npx change-firewall watch',
    whyUse:
      'A zero-overhead background file watcher that re-analyzes files on save in 18ms. Immediately rings terminal notifications if you introduce a breaking contract or unhandled null dereference.',
    problemSolved:
      'Finding out you broke a downstream consumer 2 hours after writing the code.',
    whenToRun: 'Keep it running in a side terminal pane while actively coding.',
    keyFlags: [
      { flag: '--dir <path>', desc: 'Watch specific source directory (default: src)' },
      { flag: '--sound', desc: 'Emit terminal audio bell on high-severity regressions' },
    ],
    exitCodeDesc: 'Continuous Live Mode · Press [Ctrl+C] to stop',
  },
  {
    id: 'gate',
    label: 'gate',
    badge: 'CI Merge Gate',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    icon: ShieldAlert,
    command: 'npx change-firewall gate --base origin/main',
    whyUse:
      'The definitive merge gate for CI/CD pipelines (GitHub Actions, GitLab CI). Deterministically blocks pull requests with Exit Code 1 if any unhandled crash proofs, contract violations, or stealth drift exist.',
    problemSolved:
      'Letting broken PRs reach production staging environments.',
    whenToRun: 'In pull request workflows (.github/workflows/firewall.yml).',
    keyFlags: [
      { flag: '--base <ref>', desc: 'Base branch to compare against (e.g. origin/main)' },
      { flag: '--staged', desc: 'Used for Husky pre-commit hooks' },
    ],
    exitCodeDesc: 'Exit 0: Approved to Merge · Exit 1: Merge Blocked (Review Required)',
  },
  {
    id: 'mcp',
    label: 'mcp',
    badge: 'Model Context',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    icon: Command,
    command: 'npx change-firewall mcp',
    whyUse:
      'Launches a Model Context Protocol (MCP) server over stdio. Connects your codebase AST intelligence directly to Claude Desktop, Cursor, and Windsurf so AI can self-verify changes before proposing them.',
    problemSolved:
      'AI agents hallucinating fake function signatures or proposing code that breaks your architecture.',
    whenToRun: 'Configured in claude_desktop_config.json or cursor settings once.',
    keyFlags: [
      { flag: 'mcp', desc: 'Runs standard JSON-RPC protocol over stdio for AI IDEs' },
    ],
    exitCodeDesc: 'Persistent MCP stdio connection for Claude Desktop & Cursor',
  },
];

export default function CliExperience() {
  const [selectedCmd, setSelectedCmd] = useState<CommandKey>('audit-agent');
  const [copied, setCopied] = useState<string | null>(null);

  // Sub-view for inspect command
  const [inspectorSubView, setInspectorSubView] = useState<InspectorSubView>('callstack');

  const active = COMMANDS.find((c) => c.id === selectedCmd) || COMMANDS[0];

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="cli" className="py-16 sm:py-24 relative bg-[var(--surface-50)]/50 border-y border-[var(--border-subtle)] overflow-hidden">
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with clear value proposition */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[11px] font-mono font-semibold text-brand-cyan mb-3">
            <Command className="w-3.5 h-3.5" />
            <span>BEHAVIOR-AWARE CLI COMMAND SUITE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Every Command Explained Simply
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Zero ambiguity. Tap any command below to understand <strong className="text-[var(--text-primary)]">why you should use it</strong>, what problem it solves, and how to read the exact terminal output.
          </p>
        </div>

        {/* Command Navigation Pills Bar - Horizontal scrollable on mobile */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--surface-100)] border border-[var(--border-subtle)] overflow-x-auto no-scrollbar scroll-smooth">
            {COMMANDS.map((cmd) => {
              const Icon = cmd.icon;
              const isSelected = selectedCmd === cmd.id;
              return (
                <button
                  key={cmd.id}
                  onClick={() => setSelectedCmd(cmd.id)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-card)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-200)]/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-brand-cyan' : 'text-[var(--text-muted)]'}`} />
                  <span className="font-mono">{cmd.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border hidden xs:inline ${cmd.badgeColor}`}>
                    {cmd.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Command Card Container */}
        <div className="max-w-5xl mx-auto space-y-5">
          {/* "Why Should I Use This Command?" Card */}
          <div className="rounded-2xl bg-[var(--surface-main)] border border-[var(--border-card)] p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-cyan/10 text-brand-cyan">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-wider text-brand-cyan uppercase">
                    Why should I use {active.command.split(' ')[1] || active.label}?
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] font-medium text-[var(--text-primary)] leading-relaxed">
                  {active.whyUse}
                </p>
              </div>

              {/* 1-Click Copy Button */}
              <button
                onClick={() => copyCode(active.command, active.id)}
                className="self-start px-3.5 py-2 rounded-xl bg-[var(--surface-100)] hover:bg-[var(--surface-200)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs transition-all flex items-center gap-2 shrink-0 shadow-xs"
                title="Copy Command"
              >
                {copied === active.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-success" />
                    <span className="text-brand-success font-sans font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="truncate max-w-[160px] sm:max-w-none">{active.command}</span>
                  </>
                )}
              </button>
            </div>

            {/* Problem Solved & When to run */}
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--surface-50)] border border-[var(--border-subtle)]">
                <span className="font-semibold text-[var(--text-primary)]">Problem it Solves:</span>{' '}
                <span className="text-[var(--text-secondary)]">{active.problemSolved}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface-50)] border border-[var(--border-subtle)]">
                <span className="font-semibold text-[var(--text-primary)]">When to Run It:</span>{' '}
                <span className="text-[var(--text-secondary)]">{active.whenToRun}</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulated Terminal Mockup */}
          <div className="rounded-2xl bg-[#090d16] border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Terminal Window Header Bar */}
            <div className="px-4 py-3 bg-[#0d1322] border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 text-gray-200 font-semibold truncate max-w-[200px] sm:max-w-none">
                  {active.command}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                {active.exitCodeDesc.split('·')[0] || 'Live Output'}
              </span>
            </div>

            {/* Sub-toolbar for inspect view */}
            {selectedCmd === 'inspect' && (
              <div className="p-2.5 bg-[#111728] border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-[11px] text-gray-400">TUI View Modes:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setInspectorSubView('callstack')}
                    className={`px-2 py-1 rounded text-[11px] flex items-center gap-1.5 transition-all ${
                      inspectorSubView === 'callstack'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <kbd className="px-1 py-0.2 bg-black/50 rounded text-[10px]">Tab</kbd>
                    <span>Call Stacks</span>
                  </button>
                  <button
                    onClick={() => setInspectorSubView('proof')}
                    className={`px-2 py-1 rounded text-[11px] flex items-center gap-1.5 transition-all ${
                      inspectorSubView === 'proof'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <kbd className="px-1 py-0.2 bg-black/50 rounded text-[10px]">p</kbd>
                    <span>Crash Proof</span>
                  </button>
                  <button
                    onClick={() => setInspectorSubView('fingerprint')}
                    className={`px-2 py-1 rounded text-[11px] flex items-center gap-1.5 transition-all ${
                      inspectorSubView === 'fingerprint'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <kbd className="px-1 py-0.2 bg-black/50 rounded text-[10px]">f</kbd>
                    <span>11-D Matrix</span>
                  </button>
                  <button
                    onClick={() => setInspectorSubView('autofix')}
                    className={`px-2 py-1 rounded text-[11px] flex items-center gap-1.5 transition-all ${
                      inspectorSubView === 'autofix'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <kbd className="px-1 py-0.2 bg-black/50 rounded text-[10px]">a</kbd>
                    <span>Auto-Fix</span>
                  </button>
                </div>
              </div>
            )}

            {/* Terminal Body Content */}
            <div className="p-4 sm:p-6 font-mono text-[11px] sm:text-xs leading-relaxed text-gray-200 overflow-x-auto min-h-[260px]">
              {selectedCmd === 'analyze' && (
                <div className="space-y-3">
                  <div className="text-cyan-400 font-bold">
                    ══════════════════════════════════════════════════════════════════
                    <br />
                    &nbsp;&nbsp;CHANGE FIREWALL &bull; Behavior-Aware Change Intelligence Engine
                    <br />
                    ══════════════════════════════════════════════════════════════════
                  </div>
                  <div>
                    Files Changed: <span className="text-white font-bold">15 (+596 / -120)</span> &bull; Behavioral Shifts:{' '}
                    <span className="text-yellow-400 font-bold">2</span> &bull; Overall Risk:{' '}
                    <span className="text-emerald-400 font-bold">20 / 100 [LOW RISK]</span>
                  </div>
                  <div className="text-gray-500">──────────────────────────────────────────────────────────────────</div>
                  <div className="text-gray-400 font-bold">DETECTED BEHAVIORAL CONTRACT SHIFTS:</div>
                  <div className="space-y-1">
                    <div className="text-yellow-400">
                      &bull; [LOW] Export Extended: formatBehaviorGraphAscii (src/core/graph/behavior-graph.ts)
                    </div>
                    <div className="text-amber-400">
                      &bull; [MEDIUM] Export Contract Changed: BehaviorRole (src/types/index.ts)
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                    &check; SAFE TO MERGE &bull; Zero fatal symbolic crash proofs. Low downstream caller churn.
                  </div>
                </div>
              )}

              {selectedCmd === 'audit-agent' && (
                <div className="space-y-3">
                  <div className="text-cyan-400 font-bold">
                    ══════════════════════════════════════════════════════════════════
                    <br />
                    &nbsp;&nbsp;AI AGENT INTENT VS REALITY DRIFT VERIFIER
                    <br />
                    ══════════════════════════════════════════════════════════════════
                  </div>
                  <div className="text-gray-300">
                    Claimed Intent: <span className="text-amber-300">&quot;Fix button padding and header colors&quot;</span>
                    <br />
                    Inferred Scope: <span className="text-cyan-300">UI_STYLING (Presentation Layer Only)</span>
                  </div>
                  <div className="text-gray-500">──────────────────────────────────────────────────────────────────</div>
                  <div className="text-red-400 font-bold">
                    &bull; UNANNOUNCED CONTRACT MUTATIONS DETECTED (16 files altered):
                  </div>
                  <div className="text-gray-300 space-y-0.5 text-[11px]">
                    <div>&nbsp;&nbsp;├── src/types/index.ts (Exported type BehaviorRole modified)</div>
                    <div>&nbsp;&nbsp;├── src/core/graph/behavior-graph.ts (Graph algorithm altered)</div>
                    <div>&nbsp;&nbsp;└── .github/workflows/change-firewall.yml (CI gate modified)</div>
                  </div>
                  <div className="p-3 rounded bg-red-950/40 border border-red-500/40 text-red-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>&bull; STEALTH MUTATION (Drift Score: 100%)</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      Agent claimed pure UI styling, but modified core contracts and pipeline configurations. Merge blocked.
                    </div>
                    <div className="text-[10px] text-red-400 font-mono">Process exited with Code 1</div>
                  </div>
                </div>
              )}

              {selectedCmd === 'inspect' && (
                <div>
                  {inspectorSubView === 'callstack' && (
                    <div className="space-y-2">
                      <div className="text-cyan-400 font-bold">▼ 3-HOP DOWNSTREAM CALL STACK TRAVERSAL</div>
                      <pre className="text-gray-300 leading-snug">
{`[Target] src/services/user.ts ➔ getUser()
  ├── [Hop 1 Direct Caller] src/api/routes/auth.ts:19
  │     └─ Invocation: const user = await getUser(id)
  │     └─ Consumes: user.role, user.email, user.tenantId
  │
  ├── [Hop 2 UI Component] src/client/components/UserBadge.tsx:8
  │     └─ Prop Passing: <Badge role={user.role} />
  │     └─ Status: ❌ CRASHES if user is null
  │
  └── [Hop 3 Background Job] src/workers/sessionPurge.ts:44
        └─ Scheduled task relies on verified non-null session`}</pre>
                    </div>
                  )}

                  {inspectorSubView === 'proof' && (
                    <div className="space-y-2">
                      <div className="text-amber-400 font-bold">▼ DETERMINISTIC RUNTIME CRASH PROOF</div>
                      <pre className="text-gray-300 leading-snug">
{`Simulated Exception: TypeError: Cannot read properties of null (reading 'role')
Crash Site:          src/api/routes/auth.ts:24

Execution Trace Proof:
  Step 1: src/services/user.ts:42   ➔ Return expression evaluates to null
  Step 2: src/api/routes/auth.ts:19 ➔ Variable 'user' assigned null
  Step 3: src/api/routes/auth.ts:24 ➔ Direct property access '.role' without guard

Mathematical Guarantee: 100% Deterministic Reproducibility.`}</pre>
                    </div>
                  )}

                  {inspectorSubView === 'fingerprint' && (
                    <div className="space-y-2">
                      <div className="text-purple-400 font-bold">▼ 11-DIMENSIONAL FINGERPRINT ACTIVE VECTORS</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-1">
                        <div className="p-2 rounded bg-gray-900 border border-gray-800">
                          <span className="text-cyan-400 font-bold">&bull; API CONTRACT:</span> Shifted return schema
                        </div>
                        <div className="p-2 rounded bg-gray-900 border border-gray-800">
                          <span className="text-red-400 font-bold">&bull; NULLABILITY:</span> Widened to null
                        </div>
                        <div className="p-2 rounded bg-gray-900 border border-gray-800">
                          <span className="text-amber-400 font-bold">&bull; DATA SHAPE:</span> Direct property dereference
                        </div>
                        <div className="p-2 rounded bg-gray-900 border border-gray-800">
                          <span className="text-emerald-400 font-bold">&bull; TEST COVERAGE:</span> 0 caller specs updated
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectorSubView === 'autofix' && (
                    <div className="space-y-2">
                      <div className="text-emerald-400 font-bold">▼ PROPOSED 1-LINE CALLER AUTO-FIX PATCH</div>
                      <div className="p-3 rounded bg-gray-900 border border-gray-800">
                        <div className="text-gray-400 mb-1">// In src/api/routes/auth.ts:24</div>
                        <div className="text-red-400">{`- return NextResponse.json({ role: user.role });`}</div>
                        <div className="text-emerald-400 font-bold">{`+ return NextResponse.json({ role: user?.role ?? 'guest' });`}</div>
                      </div>
                      <div className="text-gray-400 text-[11px]">Press [c] in terminal to copy auto-fix patch directly.</div>
                    </div>
                  )}
                </div>
              )}

              {selectedCmd === 'preflight' && (
                <div className="space-y-3">
                  <div className="text-amber-400 font-bold">
                    &bull; CHANGE FIREWALL &bull; Pre-Commit Sanity Check (50ms)
                  </div>
                  <div className="text-gray-300">
                    Inspecting 3 staged files (git diff --cached)...
                  </div>
                  <div className="text-gray-300 space-y-0.5">
                    <div>&check; src/client/api.ts &mdash; Clean AST diff</div>
                    <div>&check; src/components/Header.tsx &mdash; Clean AST diff</div>
                    <div>&check; src/types/user.ts &mdash; Non-breaking field addition</div>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-bold">
                    &check; PREFLIGHT PASSED &bull; Zero contract breaks. Safe to commit. (Elapsed: 44ms)
                  </div>
                </div>
              )}

              {selectedCmd === 'graph' && (
                <div className="space-y-2">
                  <div className="text-cyan-400 font-bold">
                    BEHAVIOR GRAPH: src/models/subscription.ts
                  </div>
                  <pre className="text-gray-300 leading-snug">
{`┌─────────────────────────────────────────────────────────────┐
│ TARGET: src/models/subscription.ts                          │
│ ROLE:   INTERNAL LOGIC / DATA MODEL                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
  CONSUMERS & CALLERS (Downstream):
  ├── [API ROUTE]     PUT /api/v1/plans ──► [CLIENT] 4 Web Apps
  │     └── ⚠️  CONTRACT MISMATCH (Missing required parameter 'tier')
  │
  ├── [EVENT FLOW]    emit('subscription.downgraded') ──► src/workers/email.ts
  │
  └── [DB MODEL]      prisma.subscription.update()`}</pre>
                </div>
              )}

              {selectedCmd === 'impact' && (
                <div className="space-y-2">
                  <div className="text-purple-400 font-bold">
                    SYMBOL BLAST RADIUS: &quot;getUser&quot;
                  </div>
                  <div className="text-gray-300">
                    Export defined in: <span className="text-white">src/services/user.ts:14</span>
                  </div>
                  <div className="text-gray-400 font-bold mt-2">DOWNSTREAM CONSUMERS (3 total):</div>
                  <div className="space-y-1 text-gray-300">
                    <div>├── src/api/routes/auth.ts:19 &bull; <span className="text-red-400 font-semibold">DIRECT DEREFERENCE (user.role)</span></div>
                    <div>├── src/client/components/UserBadge.tsx:8 &bull; Prop binding</div>
                    <div>└── src/workers/sessionPurge.ts:44 &bull; Scheduled cleanup worker</div>
                  </div>
                </div>
              )}

              {selectedCmd === 'memory' && (
                <div className="space-y-2">
                  <div className="text-indigo-400 font-bold">
                    PERSISTENT FIREWALL MEMORY STATUS (.firewall/memory/)
                  </div>
                  <div className="text-gray-300 space-y-1">
                    <div>Recorded Invariants: <span className="text-emerald-400 font-bold">25 verified symbol/route contracts</span></div>
                    <div>Baseline Commit:     <span className="text-white font-mono">7b561e6</span></div>
                    <div>Stability Rating:    <span className="text-emerald-400 font-bold">HIGH</span></div>
                    <div>Last Verified:       <span className="text-gray-400">2026-09-09T06:07:25Z</span></div>
                  </div>
                  <div className="p-2 rounded bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 text-[11px]">
                    &check; Working tree contracts strictly conform to recorded baseline.
                  </div>
                </div>
              )}

              {selectedCmd === 'watch' && (
                <div className="space-y-2">
                  <div className="text-pink-400 font-bold">
                    CHANGE FIREWALL &bull; Live Background Daemon Active
                  </div>
                  <div className="text-gray-400">
                    Watching 14 TypeScript files in src/... (Ready for file saves)
                  </div>
                  <div className="text-gray-300 space-y-1 pt-2">
                    <div>[12:44:18] File saved: <span className="text-white">src/routes/auth.ts</span></div>
                    <div>[12:44:18] AST diff re-analyzed in <span className="text-emerald-400 font-bold">18ms</span> &bull; 0 shifts &bull; Risk: 0/100</div>
                    <div className="text-emerald-400 font-semibold">&check; Invariants clean.</div>
                  </div>
                </div>
              )}

              {selectedCmd === 'gate' && (
                <div className="space-y-3">
                  <div className="text-rose-400 font-bold">
                    CHANGE FIREWALL CI/CD MERGE GATE
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                      <div className="font-bold text-emerald-400 mb-1">EXIT CODE 0 &bull; APPROVED</div>
                      <div className="text-gray-300 text-xs font-sans">
                        Risk score below threshold and 0 fatal crash proofs. PR passes merge gate immediately.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30">
                      <div className="font-bold text-red-400 mb-1">EXIT CODE 1 &bull; BLOCKED</div>
                      <div className="text-gray-300 text-xs font-sans">
                        Contract regression or crash proof detected. Pull request is blocked from merging.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedCmd === 'mcp' && (
                <div className="space-y-2">
                  <div className="text-sky-400 font-bold">
                    CHANGE FIREWALL &bull; Model Context Protocol (MCP) Server
                  </div>
                  <div className="text-gray-300">
                    Listening on stdio (JSON-RPC 2.0)...
                  </div>
                  <div className="text-gray-400 space-y-1 pt-2">
                    <div>&check; Exposed Tool: <span className="text-white">change_firewall_analyze_changes</span></div>
                    <div>&check; Exposed Tool: <span className="text-white">change_firewall_get_downstream_impact</span></div>
                    <div>&check; Exposed Tool: <span className="text-white">change_firewall_audit_agent_intent</span></div>
                    <div>&check; Exposed Tool: <span className="text-white">change_firewall_prove_runtime_crash</span></div>
                  </div>
                  <div className="text-emerald-400 font-semibold pt-1">
                    &bull; Connected to Claude Desktop & Cursor
                  </div>
                </div>
              )}
            </div>

            {/* Key Flags Footer Strip */}
            <div className="px-4 py-3 bg-[#0d1322] border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <span className="text-gray-400 text-[11px] uppercase tracking-wider">Available Flags:</span>
              <div className="flex flex-wrap items-center gap-2">
                {active.keyFlags.map((kf, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded bg-gray-800/80 border border-gray-700 text-gray-300"
                    title={kf.desc}
                  >
                    <code className="text-cyan-400 font-bold">{kf.flag}</code>{' '}
                    <span className="text-gray-400 hidden sm:inline">&mdash; {kf.desc}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
