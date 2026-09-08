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
  ChevronRight,
  Sparkles,
  Command,
  ArrowRight,
  ShieldAlert,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function CliExperience() {
  const [activeTab, setActiveTab] = useState<'graph' | 'interactive' | 'gate'>('graph');
  const [inspectorView, setInspectorView] = useState<'callstack' | 'proof' | 'fingerprint' | 'autofix'>('callstack');
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="cli" className="py-20 relative bg-[var(--surface-50)]/50 border-y border-[var(--border-subtle)]">
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[11px] font-mono font-semibold text-brand-cyan mb-4">
            <Command className="w-3.5 h-3.5" />
            <span>EXQUISITE DEVELOPER EXPERIENCE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            World-Class CLI Experience
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Stripe & Linear caliber polish right in your shell. Unicode behavioral trees, full keyboard-driven TUI inspector, and a zero-config merge gate.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'graph'
                  ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <GitBranch className="w-4 h-4 text-brand-cyan" />
              <span>Visual Behavior Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'interactive'
                  ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Interactive TUI Inspector</span>
            </button>

            <button
              onClick={() => setActiveTab('gate')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'gate'
                  ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>One-Command CI Gate</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Visual Behavior Graph */}
        {activeTab === 'graph' && (
          <div className="max-w-5xl mx-auto rounded-2xl bg-[#090d16] border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
            {/* Window header */}
            <div className="px-4 py-3 bg-[#0d1322] border-b border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 text-gray-300 font-semibold">change-firewall graph src/models/subscription.ts</span>
              </div>
              <button
                onClick={() => copyCode('npx change-firewall graph src/models/subscription.ts', 'graph-cmd')}
                className="hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {copied === 'graph-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">Copy Command</span>
              </button>
            </div>

            {/* Terminal Output */}
            <div className="p-5 sm:p-7 font-mono text-xs sm:text-[13px] leading-relaxed text-gray-200 overflow-x-auto">
              <div className="text-cyan-400 font-bold mb-1">
                ◈ CHANGE FIREWALL v0.2.1 • Behavioral Intelligence
              </div>
              <div className="text-gray-500 mb-3">
                ──────────────────────────────────────────────────────────────────────────
              </div>

              <div className="mb-4">
                <span className="text-yellow-400 font-bold">CHANGED:</span>{' '}
                <span className="text-white">src/models/subscription.ts</span>{' '}
                <span className="text-cyan-400">➔ updatePlan()</span>
              </div>

              <div className="text-gray-400 font-bold mb-1">BEHAVIOR GRAPH MUTATION:</div>
              <pre className="text-gray-300 font-mono text-xs sm:text-[13px] leading-snug py-2">
{`┌────────────────────────┐
│  updatePlan(id, tier)  │
└───────────┬────────────┘
            │
            ├───► [DB MODEL] prisma.subscription.update()
            │
            ├───► [EVENT FLOW] emit('subscription.downgraded') ──► [CONSUMER] src/workers/email.ts
            │
            └───► [API ROUTE] PUT /api/v1/plans ──► [CLIENT] 4 Web Apps
                  └── ⚠️  CONTRACT MISMATCH (Missing 'tier')`}
              </pre>

              <div className="text-gray-400 font-bold mt-4 mb-1">DIAGNOSTIC MATRIX:</div>
              <div className="text-gray-300 space-y-0.5 text-xs sm:text-[12px]">
                <div>├── <span className="text-gray-400">Behavioral Mutation:</span> <span className="text-yellow-300 font-semibold">DATA SHAPE & API CONTRACT</span></div>
                <div>├── <span className="text-gray-400">Confidence:</span> <span className="text-emerald-400 font-bold">99.4% (Symbolically Proven)</span></div>
                <div>├── <span className="text-gray-400">Consumers Affected:</span> <span className="text-white">4 API Routes, 1 Background Worker</span></div>
                <div>├── <span className="text-gray-400">Critical Paths:</span> <span className="text-amber-400">2 (Payment Webhook ➔ Stripe Webhook Guard)</span></div>
                <div>├── <span className="text-gray-400">Historical Stability:</span> <span className="text-red-400">LOW (Churned 8x in past 14 days)</span></div>
                <div>├── <span className="text-gray-400">Regression Coverage:</span> <span className="text-red-400 font-bold">❌ MISSING (0 tests cover downgrade event)</span></div>
                <div>└── <span className="text-gray-400">Verdict:</span> <span className="text-red-500 font-black bg-red-950/60 px-1.5 py-0.5 rounded">BLOCKED (Exit Code 1)</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Terminal Inspector */}
        {activeTab === 'interactive' && (
          <div className="max-w-5xl mx-auto rounded-2xl bg-[#090d16] border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
            {/* Window header */}
            <div className="px-4 py-3 bg-[#0d1322] border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 text-gray-300 font-semibold">npx change-firewall interactive</span>
              </div>
              <div className="text-[11px] text-gray-400">
                Live Interactive TUI Mode
              </div>
            </div>

            {/* Interactive Keyboard Controls Toolbar */}
            <div className="p-3 bg-[#111728] border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="text-[11px] uppercase tracking-wider text-gray-500">Interactive Keys:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setInspectorView('callstack')}
                  className={`px-2.5 py-1 rounded border text-[11px] transition-all flex items-center gap-1.5 ${
                    inspectorView === 'callstack'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <kbd className="px-1 py-0.2 bg-black/40 rounded text-[10px]">Tab</kbd>
                  <span>Call Stacks</span>
                </button>

                <button
                  onClick={() => setInspectorView('proof')}
                  className={`px-2.5 py-1 rounded border text-[11px] transition-all flex items-center gap-1.5 ${
                    inspectorView === 'proof'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <kbd className="px-1 py-0.2 bg-black/40 rounded text-[10px]">p</kbd>
                  <span>Crash Proof</span>
                </button>

                <button
                  onClick={() => setInspectorView('fingerprint')}
                  className={`px-2.5 py-1 rounded border text-[11px] transition-all flex items-center gap-1.5 ${
                    inspectorView === 'fingerprint'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                      : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <kbd className="px-1 py-0.2 bg-black/40 rounded text-[10px]">f</kbd>
                  <span>11-D Matrix</span>
                </button>

                <button
                  onClick={() => setInspectorView('autofix')}
                  className={`px-2.5 py-1 rounded border text-[11px] transition-all flex items-center gap-1.5 ${
                    inspectorView === 'autofix'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <kbd className="px-1 py-0.2 bg-black/40 rounded text-[10px]">a</kbd>
                  <span>Auto-Fix Stub</span>
                </button>
              </div>
            </div>

            {/* Terminal Canvas */}
            <div className="p-6 font-mono text-xs sm:text-[13px] text-gray-200 min-h-[300px]">
              {inspectorView === 'callstack' && (
                <div className="space-y-3">
                  <div className="text-cyan-400 font-bold">
                    ▼ EXPANDED DOWNSTREAM CALL STACK (3 Hops Traversed)
                  </div>
                  <pre className="text-gray-300 text-xs sm:text-[12px] leading-relaxed">
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
        └─ Scheduled task relies on verified non-null session`}
                  </pre>
                </div>
              )}

              {inspectorView === 'proof' && (
                <div className="space-y-3">
                  <div className="text-amber-400 font-bold">
                    ▼ SYMBOLIC RUNTIME CRASH PROOF (Deterministic)
                  </div>
                  <pre className="text-gray-300 text-xs sm:text-[12px] leading-relaxed">
{`Simulated Exception: TypeError: Cannot read properties of null (reading 'role')
Crash Site:          src/api/routes/auth.ts:24

Execution Trace Proof:
  Step 1: src/services/user.ts:42  ➔ Return expression evaluates to null
  Step 2: src/api/routes/auth.ts:19 ➔ Variable 'user' assigned null
  Step 3: src/api/routes/auth.ts:24 ➔ Direct member access '.role' without guard

Mathematical Guarantee: 100% Deterministic Reproducibility.
No Optional Chaining (?.) or 'if (!user)' found in caller.`}
                  </pre>
                </div>
              )}

              {inspectorView === 'fingerprint' && (
                <div className="space-y-3">
                  <div className="text-purple-400 font-bold">
                    ▼ 11-DIMENSIONAL FINGERPRINT ACTIVE VECTORS
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-2">
                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="text-cyan-400 font-bold">● API CONTRACT:</span>{' '}
                      <span className="text-gray-300">Shifted return schema</span>
                    </div>
                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="text-red-400 font-bold">● NULLABILITY:</span>{' '}
                      <span className="text-gray-300">Widened to null</span>
                    </div>
                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="text-amber-400 font-bold">● DATA SHAPE:</span>{' '}
                      <span className="text-gray-300">Direct property dereference</span>
                    </div>
                    <div className="p-2 rounded bg-gray-900 border border-gray-800">
                      <span className="text-emerald-400 font-bold">● TEST COVERAGE:</span>{' '}
                      <span className="text-gray-300">0 caller specs updated</span>
                    </div>
                  </div>
                </div>
              )}

              {inspectorView === 'autofix' && (
                <div className="space-y-3">
                  <div className="text-emerald-400 font-bold">
                    ▼ GENERATED AUTO-FIX & VITEST TEST STUB
                  </div>
                  <div className="p-3 rounded bg-gray-900 border border-gray-800 text-xs text-gray-300">
                    <div className="text-gray-400 mb-1">// Proposed 1-line caller fix in src/api/routes/auth.ts:24</div>
                    <div className="text-red-400">{`- return NextResponse.json({ role: user.role });`}</div>
                    <div className="text-emerald-400 font-semibold">{`+ return NextResponse.json({ role: user?.role ?? 'guest' });`}</div>
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Press <kbd className="px-1 py-0.2 bg-black/40 rounded text-[10px]">c</kbd> in CLI to copy auto-fix patch directly to clipboard.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: One-Command CI/CD Gate */}
        {activeTab === 'gate' && (
          <div className="max-w-5xl mx-auto rounded-2xl bg-[#090d16] border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
            {/* Window header */}
            <div className="px-4 py-3 bg-[#0d1322] border-b border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 text-gray-300 font-semibold">change-firewall gate</span>
              </div>
              <span className="text-emerald-400 font-semibold text-[11px]">Exit Code 0 (Safe) / Exit Code 1 (Blocked)</span>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* Exit Code Spec */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-400">EXIT CODE 0</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">APPROVED</span>
                  </div>
                  <p className="text-gray-300 text-xs font-sans">
                    Risk score below threshold and zero unhandled symbolic crash proofs. PR passes merge gate immediately.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-red-400">EXIT CODE 1</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300">BLOCKED</span>
                  </div>
                  <p className="text-gray-300 text-xs font-sans">
                    High-risk behavioral mutation detected (broken API contract, mutated auth guard, or fatal crash proof). Merge blocked.
                  </p>
                </div>
              </div>

              {/* GitHub Actions Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2 text-xs font-mono text-gray-400">
                  <span>GitHub Actions CI Pipeline (.github/workflows/firewall.yml)</span>
                  <button
                    onClick={() =>
                      copyCode(
                        `- name: Change Firewall Gate\n  run: npx change-firewall gate --base origin/\${{ github.base_ref }}`,
                        'ci-snippet'
                      )
                    }
                    className="hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copied === 'ci-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">Copy Step</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1424] border border-gray-800 font-mono text-xs text-gray-200 overflow-x-auto">
                  <pre className="text-xs sm:text-[12px] leading-relaxed">
{`- name: Change Firewall Gate
  run: npx change-firewall gate --base origin/\${{ github.base_ref }}
  # Blocks PR with Exit Code 1 if contract regressions or crash proofs exist`}
                  </pre>
                </div>
              </div>

              {/* Husky Pre-Commit */}
              <div>
                <div className="flex items-center justify-between mb-2 text-xs font-mono text-gray-400">
                  <span>Husky Pre-Commit Hook (.husky/pre-commit)</span>
                  <button
                    onClick={() => copyCode('npx change-firewall gate --staged', 'husky-snippet')}
                    className="hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copied === 'husky-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">Copy Hook</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1424] border border-gray-800 font-mono text-xs text-gray-200 overflow-x-auto">
                  <pre className="text-xs sm:text-[12px] leading-relaxed">
{`#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx change-firewall gate --staged`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
