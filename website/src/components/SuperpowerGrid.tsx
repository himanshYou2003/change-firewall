'use client';

import React from 'react';
import { Network, ShieldCheck, Bug, Fingerprint, Bot, Database, ArrowUpRight } from 'lucide-react';

const SUPERPOWERS = [
  {
    icon: Bug,
    title: 'Symbolic Runtime Crash Proofs',
    tag: 'Zero Guesswork',
    pillar: 'Pillar 3',
    description:
      'Traces backward-slice data flows from widened return types to consumer call sites. Mathematically proves unhandled TypeErrors and null dereferences at exact line numbers with zero false alarms.',
  },
  {
    icon: Fingerprint,
    title: '11-Dimensional Fingerprint Matrix',
    tag: '11-D Multi-Vector',
    pillar: 'Pillar 1',
    description:
      'Evaluates every commit across 11 orthogonal vectors: API contracts, auth guards, nullability widening, database queries, event hooks, state stores, and error semantics for complete coverage.',
  },
  {
    icon: Database,
    title: 'Persistent Firewall Memory Engine',
    tag: 'Temporal Memory',
    pillar: 'Pillar 2',
    description:
      'Zero-config local store in .firewall/memory/ that tracks contract invariant history over time. Flags unexpected mutations on functions that have been historically stable for 100+ commits.',
  },
  {
    icon: Bot,
    title: '"AI Agent Intent vs Reality" Guard',
    tag: 'Agent Safety',
    pillar: 'Pillar 4',
    description:
      'Compares stated prompt intent against actual AST mutations. Detects when AI coding assistants silently delete auth middleware, alter database queries, or touch undeclared services.',
  },
  {
    icon: Network,
    title: 'Living Behavior Graph Boundaries',
    tag: 'Graph Intelligence',
    pillar: 'Pillar 1',
    description:
      'Models the system beyond file imports into semantic API, Database, Event, Auth, and Test boundaries. Traces multi-hop critical paths and downstream consumer blast radius up to 3 hops deep.',
  },
  {
    icon: ShieldCheck,
    title: 'One-Command CI/CD Merge Gate',
    tag: 'CI/CD Gate',
    pillar: 'Merge Gate',
    description:
      'Enforces deterministic preflight verification in GitHub Actions and Husky pre-commit hooks. Strictly exits with Code 0 (Safe to merge) or Code 1 (Blocked review required).',
  },
];

export default function SuperpowerGrid() {
  return (
    <section id="superpowers" className="py-20 relative">
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold font-mono tracking-widest text-brand-cyan uppercase">
            Behavior-Aware Protection
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mt-2">
            Engineered for the Agentic Coding Era
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            Standard linters and tests aren&apos;t enough when autonomous AI modifies 20 files in 5 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPERPOWERS.map((sp, idx) => {
            const Icon = sp.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--surface-main)] rounded-2xl p-6 sm:p-7 border border-[var(--border-subtle)] hover:border-[var(--border-card)] transition-all relative group overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-primary)] flex items-center justify-center p-2.5 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                        {sp.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-5 flex items-center justify-between">
                    <span>{sp.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                  </h3>

                  <p className="mt-2.5 text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed">
                    {sp.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>{sp.pillar}</span>
                  <span className="text-brand-cyan group-hover:translate-x-0.5 transition-transform">Learn more →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
