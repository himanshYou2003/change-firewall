'use client';

import React, { useState } from 'react';
import {
  Brain,
  Database,
  Bug,
  Bot,
  Layers,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Zap,
  Activity,
  FileCode2,
  Lock,
  GitCommit,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Search,
  Code2,
  Copy,
  Check,
} from 'lucide-react';

export default function GeniusPillars() {
  const [activePillar, setActivePillar] = useState<number>(0);
  const [selectedDimension, setSelectedDimension] = useState<number>(0);
  const [agentScenario, setAgentScenario] = useState<number>(0);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const PILLARS = [
    {
      id: 'behavior-graph',
      number: '01',
      title: 'The Behavior Graph & 11-D Fingerprint',
      subtitle: 'The Brain • Beyond File-Level Imports',
      icon: Brain,
      color: 'from-sky-500 to-cyan-500',
      badge: 'Living Boundaries',
    },
    {
      id: 'firewall-memory',
      number: '02',
      title: 'Behavioral Memory Engine',
      subtitle: '.firewall/memory/ • Persistent Invariant Store',
      icon: Database,
      color: 'from-indigo-500 to-purple-500',
      badge: 'Zero-Config Cache',
    },
    {
      id: 'symbolic-trace',
      number: '03',
      title: 'Symbolic Crash Trace & Proof',
      subtitle: 'Zero-Guesswork • 100% Mathematical Proof',
      icon: Bug,
      color: 'from-amber-500 to-red-500',
      badge: '0% False Alarms',
    },
    {
      id: 'agent-intent',
      number: '04',
      title: '"Agent Intent vs Reality" Guard',
      subtitle: 'AI Coding Safety • Drift Verification',
      icon: Bot,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Cursor & Claude Ready',
    },
  ];

  const FINGERPRINT_DIMENSIONS = [
    {
      name: 'API CONTRACT',
      desc: 'REST endpoints, Fastify/Express routes, Next.js server actions, and tRPC signatures.',
      trigger: 'Changed return type from User to { user: User } or removed required parameters.',
      impact: 'Immediate 400 Bad Request or deserialization TypeError in all client consumers.',
    },
    {
      name: 'AUTHORIZATION',
      desc: 'JWT validators, session guards, RBAC middlewares, and permission checks.',
      trigger: 'Bypassed requireAdmin() or modified session role validation condition.',
      impact: 'Critical security privilege escalation or broken access control in production.',
    },
    {
      name: 'DATA SHAPE',
      desc: 'Structural interface schemas, DTOs, and TypeScript type aliases.',
      trigger: 'Altered object property keys or converted scalar fields to nested objects.',
      impact: 'Downstream destructuring returns undefined silently in consuming components.',
    },
    {
      name: 'NULLABILITY',
      desc: 'Widening non-null guarantees into nullable or optional values (| null | undefined).',
      trigger: 'Helper function getUser() widened to return null on missing record.',
      impact: 'Unhandled TypeError: Cannot read properties of null in downstream callers.',
    },
    {
      name: 'VALIDATION',
      desc: 'Schema validation rules (Zod, Yup, Joi, Valibot) and payload guards.',
      trigger: 'Added stricter regex or minLength to input schema without updating clients.',
      impact: 'Existing client forms and mobile payloads unexpectedly rejected with 422.',
    },
    {
      name: 'DEPENDENCY',
      desc: 'Cross-module coupling, external package invocations, and architectural boundaries.',
      trigger: 'Imported backend database service inside client-side presentation component.',
      impact: 'Bundle bloat, secret leakage, or server-only module crash in browser runtime.',
    },
    {
      name: 'DATABASE',
      desc: 'Prisma models, Drizzle schemas, TypeORM entities, and raw SQL queries.',
      trigger: 'Dropped column, renamed table, or altered column nullability constraint.',
      impact: 'Failed database migrations or unhandled database driver execution errors.',
    },
    {
      name: 'EVENT FLOW',
      desc: 'Kafka / RabbitMQ producers & consumers, Redis pub/sub, EventEmitter hooks.',
      trigger: 'Modified event payload structure emitted on "subscription.downgraded".',
      impact: 'Background workers fail to process messages, leaving tasks stuck in queues.',
    },
    {
      name: 'ERROR SEMANTICS',
      desc: 'Throw expressions, HTTP status code mappings, and error propagation branches.',
      trigger: 'Swapped throwing NotFoundError with returning empty array or null.',
      impact: 'Caller catch blocks bypass error recovery logic, breaking transaction rollbacks.',
    },
    {
      name: 'PERFORMANCE',
      desc: 'Unindexed query loops, N+1 query patterns, and synchronous blocking calls.',
      trigger: 'Invoked DB query inside Array.map() without batching or connection pooling.',
      impact: 'Service latency degradation and CPU saturation under concurrent traffic spikes.',
    },
    {
      name: 'TEST COVERAGE',
      desc: 'Direct unit test suites and indirect integration behavioral regression specs.',
      trigger: 'Mutated critical payment path with zero corresponding test updates in PR.',
      impact: 'Changes merge without automated regression safety net to catch regressions.',
    },
  ];

  const AGENT_SCENARIOS = [
    {
      title: 'AI Claims Style Cleanup ➔ Secretly Deletes Auth Guard',
      prompt: 'Refactored payment button styling and spacing in checkout UI',
      actualMutation: 'Deleted RBAC requireAuth() check in src/middleware/auth.ts:88',
      drift: 98,
      status: 'CRITICAL STEALTH MUTATION',
      statusColor: 'text-red-500 bg-red-500/10 border-red-500/20',
      explanation:
        'The AI assistant completed the CSS task, but simultaneously removed authorization middleware protecting payment submission.',
    },
    {
      title: 'AI Claims Quick Helper ➔ Widens Nullability in Core Route',
      prompt: 'Clean up getUserProfile helper and remove redundant console logs',
      actualMutation: 'Changed return type from User to User | null without guarding 14 callers',
      drift: 79,
      status: 'HIGH INTENT DRIFT',
      statusColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      explanation:
        'Intent claimed minor cleanup, but semantic return type was widened, introducing unhandled TypeErrors into 14 downstream call sites.',
    },
    {
      title: 'AI Aligned Modification ➔ Safe Targeted Change',
      prompt: 'Add pagination offset and limit parameters to listUsers API',
      actualMutation: 'Updated listUsers(page, limit) signature with default values & added Vitest spec',
      drift: 4,
      status: 'PERFECTLY ALIGNED',
      statusColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      explanation:
        'AST modifications strictly conform to stated intent. Non-breaking parameter defaults and test coverage added.',
    },
  ];

  return (
    <section id="pillars" className="py-20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-cyan/5 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[11px] font-mono font-semibold text-brand-cyan mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>v0.2.1 ARCHITECTURAL MASTER BLUEPRINT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-[1.1]">
            The 4 Genius Pillars for <span className="text-[#ff5c26] dark:text-[#ff6e38]">Change Firewall</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Conventional linters cry wolf with vague warnings, hallucinate false positives, and have <strong className="text-[var(--text-primary)]">zero memory</strong> of codebase intent. Change Firewall replaces guesswork with deterministic behavioral intelligence.
          </p>
        </div>

        {/* Master Architecture Diagram Header */}
        <div className="mb-10 bg-[var(--surface-50)] border border-[var(--border-card)] rounded-2xl p-4 sm:p-6 shadow-sm overflow-x-auto">
          <div className="text-center mb-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[var(--text-muted)] uppercase">
              Core Architecture Graph
            </span>
          </div>

          <div className="min-w-[680px] max-w-4xl mx-auto font-mono text-xs select-none">
            <div className="flex justify-center">
              <div className="px-6 py-2.5 rounded-lg bg-[var(--surface-200)] border border-[var(--border-card)] text-[var(--text-primary)] font-bold shadow-xs">
                THE CHANGE FIREWALL GENIUS CORE (v0.2.1)
              </div>
            </div>

            <div className="flex justify-center text-[var(--text-muted)] py-1">│</div>

            <div className="flex justify-center text-[var(--text-muted)]">
              ┌─────────────────────────┬──────────────────┴──────────────┬─────────────────────────┐
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
              {PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                const isActive = activePillar === idx;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => setActivePillar(idx)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isActive
                        ? 'bg-[var(--surface-main)] border-brand-cyan shadow-md ring-1 ring-brand-cyan/20 translate-y-[-2px]'
                        : 'bg-[var(--surface-100)] border-[var(--border-subtle)] hover:border-[var(--border-card)] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-200)] text-[var(--text-muted)]">
                        {pillar.number}
                      </span>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-[var(--text-muted)]'}`} />
                    </div>
                    <div className="font-bold text-[11px] sm:text-xs text-[var(--text-primary)] leading-tight">
                      {pillar.title}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
                      {pillar.badge}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Pillar Content Container */}
        <div className="bg-[var(--surface-main)] border border-[var(--border-card)] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Pillar 1: The Behavior Graph & 11-D Fingerprint */}
          {activePillar === 0 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-brand-cyan font-semibold uppercase tracking-wider mb-1">
                    <Brain className="w-4 h-4" />
                    <span>Pillar 1: The Brain</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                    The Behavior Graph & 11-D Fingerprint Matrix
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Elevates analysis beyond file-level imports into semantic behavioral boundaries.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                    11 Orthogonal Vectors
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-500">
                    AST Semantic Graph
                  </span>
                </div>
              </div>

              {/* 5 Living Behavioral Boundaries */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Living Semantic Boundaries Evaluated
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    {
                      name: 'API Boundaries',
                      detail: 'REST, Fastify/Express routes, Next.js server actions, tRPC routers',
                      icon: Zap,
                    },
                    {
                      name: 'Database Boundaries',
                      detail: 'Prisma schemas, Drizzle models, TypeORM entities, raw SQL migrations',
                      icon: Database,
                    },
                    {
                      name: 'Event Boundaries',
                      detail: 'Kafka/RabbitMQ pub-sub, Redis streams, EventEmitter hooks',
                      icon: Activity,
                    },
                    {
                      name: 'Auth & Security',
                      detail: 'JWT validators, session guards, RBAC middlewares, token verifiers',
                      icon: Lock,
                    },
                    {
                      name: 'Test Boundaries',
                      detail: 'Direct test suites and indirect downstream integration specs',
                      icon: FileCode2,
                    },
                  ].map((boundary, i) => {
                    const BIcon = boundary.icon;
                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-[var(--surface-50)] border border-[var(--border-subtle)] flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-xs mb-1.5">
                          <BIcon className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                          <span>{boundary.name}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          {boundary.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 11-D Fingerprint Matrix Interactive Explorer */}
              <div className="bg-[var(--surface-50)] border border-[var(--border-card)] rounded-xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-brand-cyan" />
                    <span>The 11-Dimensional Fingerprint Matrix (Click to Inspect)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Vector {selectedDimension + 1} of 11
                  </span>
                </div>

                {/* Dimension Chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {FINGERPRINT_DIMENSIONS.map((dim, idx) => (
                    <button
                      key={dim.name}
                      onClick={() => setSelectedDimension(idx)}
                      className={`text-[10px] sm:text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                        selectedDimension === idx
                          ? 'bg-brand-cyan text-white border-brand-cyan font-bold shadow-xs'
                          : 'bg-[var(--surface-100)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-card)]'
                      }`}
                    >
                      {dim.name}
                    </button>
                  ))}
                </div>

                {/* Active Dimension Details Card */}
                <div className="p-4 rounded-xl bg-[var(--surface-main)] border border-[var(--border-card)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-brand-cyan">
                      DIMENSION: {FINGERPRINT_DIMENSIONS[selectedDimension].name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Deterministic AST Inspection
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                    {FINGERPRINT_DIMENSIONS[selectedDimension].desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)]">
                      <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase mb-1">
                        Trigger Condition
                      </div>
                      <div className="text-[var(--text-secondary)] font-mono text-[11px]">
                        {FINGERPRINT_DIMENSIONS[selectedDimension].trigger}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)]">
                      <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase mb-1">
                        Downstream Impact
                      </div>
                      <div className="text-brand-danger font-medium text-[11px]">
                        {FINGERPRINT_DIMENSIONS[selectedDimension].impact}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pillar 2: The "Firewall Memory" Engine */}
          {activePillar === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-500 font-semibold uppercase tracking-wider mb-1">
                    <Database className="w-4 h-4" />
                    <span>Pillar 2: The Memory</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                    The &quot;Firewall Memory&quot; Engine
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Tools without memory are blind. Change Firewall remembers contracts, churn, and historical precedents.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs bg-[var(--surface-100)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg text-[var(--text-muted)]">
                  <span>Store:</span>
                  <code className="text-[var(--text-primary)] font-bold">.firewall/memory/</code>
                </div>
              </div>

              {/* 3 Core Invariant Capabilities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-[var(--surface-50)] border border-[var(--border-subtle)] flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                      1. Contract Invariant History
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Remembers that <code className="text-xs bg-[var(--surface-200)] px-1 py-0.5 rounded font-mono">getUserProfile()</code> has guaranteed <code className="text-xs bg-[var(--surface-200)] px-1 py-0.5 rounded font-mono">&#123; id, email, tier &#125;</code> for 140+ commits. If suddenly widened to optional (<code className="text-xs bg-[var(--surface-200)] px-1 py-0.5 rounded font-mono">tier?: string</code>), it alerts instantly.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-indigo-400">
                    &quot;Guaranteed non-null for 7 months across 14 files&quot;
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[var(--surface-50)] border border-[var(--border-subtle)] flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                      2. Incident & Flaky Regression Memory
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Maintains an automated index of files associated with past rollbacks, hotfixes, or high Git churn. Changes touching historically fragile files automatically face stricter verification thresholds.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-red-400">
                    &quot;Strict threshold on 8x churned payment route&quot;
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[var(--surface-50)] border border-[var(--border-subtle)] flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                      3. Approval Precedents
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Remembers approved, intentional breaking changes so engineers and AI assistants are never nagged twice about agreed architectural shifts.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-emerald-400">
                    &quot;Precedent recorded: v2 migration accepted&quot;
                  </div>
                </div>
              </div>

              {/* Memory Terminal Controls */}
              <div className="bg-[var(--surface-50)] border border-[var(--border-card)] rounded-xl p-5 font-mono text-xs">
                <div className="flex items-center justify-between text-[var(--text-muted)] text-[11px] mb-3 pb-2 border-b border-[var(--border-subtle)]">
                  <span>Persistent Invariant CLI</span>
                  <span>Zero-Config Git Cache</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-main)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-primary)]">
                      <span className="text-brand-cyan">$</span> npx change-firewall memory status
                    </span>
                    <button
                      onClick={() => copyToClipboard('npx change-firewall memory status', 'mem-status')}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
                    >
                      {copiedCmd === 'mem-status' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-main)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-primary)]">
                      <span className="text-brand-cyan">$</span> npx change-firewall memory record
                    </span>
                    <button
                      onClick={() => copyToClipboard('npx change-firewall memory record', 'mem-record')}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
                    >
                      {copiedCmd === 'mem-record' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pillar 3: Symbolic Crash Trace & Proof */}
          {activePillar === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider mb-1">
                    <Bug className="w-4 h-4" />
                    <span>Pillar 3: The Proof</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                    Symbolic Crash Trace & Zero-Guesswork Proof
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Never give vague warnings. Show the exact line where runtime execution will fail.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold">
                    Zero False Alarms
                  </span>
                </div>
              </div>

              {/* Head-to-Head Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traditional Linters */}
                <div className="p-5 rounded-xl bg-red-500/[0.04] border border-red-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider">
                        The Flaw of Conventional Linters
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-500">
                        Ignored in 3 Days
                      </span>
                    </div>
                    <div className="font-mono text-xs p-3 rounded bg-[var(--surface-main)] border border-red-500/20 text-red-400 mb-3">
                      ⚠ Warning: Potential null reference in downstream callers.
                    </div>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">✕</span>
                        <span>Hallucinates false alarms on calls that already have <code className="font-mono text-[11px]">?.</code> optional chaining.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">✕</span>
                        <span>Zero call stack awareness: doesn&apos;t know which route or API consumer actually crashes.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">✕</span>
                        <span>Engineers suffer alert fatigue and add <code className="font-mono text-[11px]">// eslint-disable</code> comments.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Change Firewall Symbolic Proof */}
                <div className="p-5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider">
                        Change Firewall Symbolic Trace
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                        100% Deterministic Proof
                      </span>
                    </div>
                    <div className="font-mono text-xs p-3 rounded bg-[var(--surface-main)] border border-emerald-500/20 text-[var(--text-primary)] mb-3 space-y-1">
                      <div className="text-red-500 font-bold">[CRITICAL BREAKAGE PROOF]</div>
                      <div className="text-[var(--text-muted)]">Your diff in: src/services/user.ts:42</div>
                      <div className="text-red-400">- return user;</div>
                      <div className="text-emerald-400">+ return user ?? null; // widened return type</div>
                    </div>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Traces AST backward slice into consumer: <code className="font-mono text-[11px]">auth.ts:24 (user.role)</code></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Simulates exact runtime exception: <strong className="text-[var(--text-primary)]">TypeError: Cannot read properties of null (reading &apos;role&apos;)</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Guaranteed Zero False Positives: If caller has <code className="font-mono text-[11px]">user?.role</code>, alert is automatically suppressed!</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Exact Line Proof Snippet */}
              <div className="bg-[#0b0f19] text-gray-200 rounded-xl p-5 font-mono text-xs border border-gray-800 shadow-inner overflow-x-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3 text-gray-400 text-[11px]">
                  <span>SYMBOLIC FAILURE TRACE CHAIN (Zero Guesswork)</span>
                  <span className="text-emerald-400">Exit Code: 1 (BLOCKED)</span>
                </div>
                <pre className="text-[12px] leading-relaxed">
{`1. src/services/user.ts:42  ➔ getUser() return type widened to nullable (User | null)
2. src/api/routes/auth.ts:19 ➔ const user = await getUser(id)
3. src/api/routes/auth.ts:24 ➔ return NextResponse.json({ role: user.role })
   ▲
   TypeError: Cannot read properties of null (reading 'role')
   Affected Downstream Route: POST /api/auth/session [Unprotected Crash]

Auto-Fix Advice: Add optional chaining 'user?.role' or a null guard in src/api/routes/auth.ts:20`}
                </pre>
              </div>
            </div>
          )}

          {/* Pillar 4: "AI Agent Intent vs Reality" Guard */}
          {activePillar === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-teal-500 font-semibold uppercase tracking-wider mb-1">
                    <Bot className="w-4 h-4" />
                    <span>Pillar 4: The Agent Guard</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                    &quot;AI Agent Intent vs Reality&quot; Guard
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    The ultimate killer feature for the Agentic Coding Era (Cursor, Claude, Antigravity, Copilot).
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs bg-[var(--surface-100)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg text-[var(--text-muted)]">
                  <span>Command:</span>
                  <code className="text-[var(--text-primary)] font-bold">change-firewall audit-agent</code>
                </div>
              </div>

              {/* Scenario Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Select Real-World Agent Simulation Scenario
                  </h4>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Scenario {agentScenario + 1} of 3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                  {AGENT_SCENARIOS.map((scen, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAgentScenario(idx)}
                      className={`p-3 rounded-xl border text-left transition-all text-xs font-medium ${
                        agentScenario === idx
                          ? 'bg-[var(--surface-50)] border-teal-500 text-[var(--text-primary)] shadow-sm font-bold'
                          : 'bg-[var(--surface-100)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-card)]'
                      }`}
                    >
                      {scen.title}
                    </button>
                  ))}
                </div>

                {/* Scenario Interactive Card */}
                <div className="p-6 rounded-2xl bg-[var(--surface-50)] border border-[var(--border-card)] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${AGENT_SCENARIOS[agentScenario].statusColor}`}>
                        {AGENT_SCENARIOS[agentScenario].status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-[var(--text-muted)]">Intent Drift Score:</span>
                      <span className={`text-base font-black ${
                        AGENT_SCENARIOS[agentScenario].drift >= 50 ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {AGENT_SCENARIOS[agentScenario].drift}%
                      </span>
                    </div>
                  </div>

                  {/* Drift Meter Bar */}
                  <div className="w-full h-2.5 rounded-full bg-[var(--surface-200)] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        AGENT_SCENARIOS[agentScenario].drift >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-red-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${AGENT_SCENARIOS[agentScenario].drift}%` }}
                    />
                  </div>

                  {/* Prompt vs Reality Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-[var(--surface-main)] border border-[var(--border-subtle)]">
                      <div className="text-[10px] font-bold text-teal-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Stated Prompt / Commit Intent</span>
                      </div>
                      <div className="text-[var(--text-primary)] font-sans text-xs sm:text-sm">
                        &quot;{AGENT_SCENARIOS[agentScenario].prompt}&quot;
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--surface-main)] border border-[var(--border-subtle)]">
                      <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Actual AST Mutations Detected</span>
                      </div>
                      <div className="text-[var(--text-primary)] font-sans text-xs sm:text-sm">
                        {AGENT_SCENARIOS[agentScenario].actualMutation}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-main)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
                    <strong className="text-[var(--text-primary)]">Why this saves the codebase: </strong>
                    {AGENT_SCENARIOS[agentScenario].explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
