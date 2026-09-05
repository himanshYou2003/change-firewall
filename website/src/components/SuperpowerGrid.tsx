'use client';

import React from 'react';
import { Cpu, Network, Gauge, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const SUPERPOWERS = [
  {
    icon: Cpu,
    title: 'AST Behavioral Diffing',
    tag: 'Compiler Intelligence',
    description:
      'Raw git diffs only understand line counts. Change Firewall parses TypeScript ASTs to detect mutated API contracts, altered auth guards, and modified function nullability before you merge.',
    color: 'from-brand-cyan/20 to-brand-blue/20 text-brand-cyan border-brand-cyan/30',
  },
  {
    icon: Network,
    title: 'Caller Blast Radius Mapping',
    tag: 'Graph Intelligence',
    description:
      'Constructs the project reverse-dependency graph and traces consumer callers up to 3 hops deep. Instantly reveals which public API routes, client screens, and services will break.',
    color: 'from-brand-purple/20 to-brand-pink/20 text-brand-purple border-brand-purple/30',
  },
  {
    icon: Gauge,
    title: 'Deterministic Risk Scoring (0-100)',
    tag: 'Zero Hallucination',
    description:
      'A predictable, mathematically reproducible risk algorithm. No LLM randomness, no prompt drift. Produces transparent contribution breakdown for every security and architecture risk.',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30',
  },
  {
    icon: ShieldCheck,
    title: 'Autonomous Self-Healing Gate',
    tag: 'Merge Gate',
    description:
      'Integrates into Husky pre-commit hooks, GitHub Actions, and agent self-correction loops. AI agents read structured JSON preflight blockers and fix their own errors before human review.',
    color: 'from-emerald-500/20 to-teal-500/20 text-brand-success border-emerald-500/30',
  },
];

export default function SuperpowerGrid() {
  return (
    <section id="superpowers" className="py-20 relative">
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold font-mono tracking-widest text-brand-cyan uppercase">
            Four Core Pillars
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mt-2">
            Engineered for the Agentic Coding Era
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            Standard linters and tests aren't enough when AI modifies 20 files in 5 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {SUPERPOWERS.map((sp, idx) => {
            const Icon = sp.icon;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-7 sm:p-8 border border-[var(--border-card)] hover:border-brand-cyan/40 transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sp.color} border p-3 flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                    {sp.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] mt-6 group-hover:text-brand-cyan transition-colors flex items-center gap-1.5">
                  <span>{sp.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-cyan" />
                </h3>

                <p className="mt-3 text-[var(--text-secondary)] text-sm leading-relaxed">
                  {sp.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
