'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import anime from 'animejs';
import { ShieldAlert, CheckCircle2, Zap, Activity, Info } from 'lucide-react';

interface ConsumerNode {
  id: string;
  name: string;
  path: string;
  type: string;
  x: number;
  y: number;
}

const CONSUMERS: ConsumerNode[] = [
  { id: 'c1', name: 'userClient.ts', path: 'src/client/userClient.ts', type: 'API Client', x: 120, y: 80 },
  { id: 'c2', name: 'ProfileHeader.tsx', path: 'src/views/ProfileHeader.tsx', type: 'UI Component', x: 380, y: 65 },
  { id: 'c3', name: 'useUserSession.ts', path: 'src/hooks/useUserSession.ts', type: 'React Hook', x: 420, y: 220 },
  { id: 'c4', name: 'billingSync.ts', path: 'src/services/billingSync.ts', type: 'Microservice', x: 360, y: 340 },
  { id: 'c5', name: 'SettingsModal.tsx', path: 'src/views/SettingsModal.tsx', type: 'UI Component', x: 140, y: 350 },
  { id: 'c6', name: 'analyticsTracker.ts', path: 'src/analytics/tracker.ts', type: 'Analytics', x: 60, y: 220 },
];

export default function BlastVisualizer() {
  const [mode, setMode] = useState<'git-diff' | 'firewall'>('firewall');
  const [hoveredNode, setHoveredNode] = useState<ConsumerNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (mode === 'firewall') {
      // 1. Anime.js Shockwave Ripple animation
      if (shockwaveRef.current) {
        anime({
          targets: shockwaveRef.current,
          r: [25, 230],
          opacity: [0.9, 0],
          easing: 'easeOutExpo',
          duration: 1800,
          loop: true,
        });
      }

      // 2. GSAP Pulse & Connector Animation
      const ctx = gsap.context(() => {
        gsap.to('.connection-line', {
          stroke: '#ff3366',
          strokeWidth: 2,
          strokeDasharray: '6, 6',
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        });

        gsap.to('.consumer-node-circle', {
          stroke: '#ff3366',
          duration: 0.5,
          stagger: 0.05,
          scale: 1.05,
          transformOrigin: 'center',
        });

        gsap.to('.risk-meter-fill', {
          width: '74%',
          duration: 1.2,
          ease: 'power3.out',
        });
      }, containerRef);

      return () => ctx.revert();
    } else {
      // Normal Git Diff mode (innocent looking)
      const ctx = gsap.context(() => {
        gsap.to('.connection-line', {
          stroke: '#94a3b8',
          strokeWidth: 1.2,
          strokeDasharray: 'none',
          duration: 0.5,
        });

        gsap.to('.consumer-node-circle', {
          stroke: '#94a3b8',
          duration: 0.5,
          scale: 1.0,
          transformOrigin: 'center',
        });

        gsap.to('.risk-meter-fill', {
          width: '6%',
          duration: 0.8,
          ease: 'power3.out',
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="w-full glass-panel rounded-2xl p-4 sm:p-7 md:p-8 border border-[var(--border-card)] shadow-sm relative overflow-hidden text-left"
    >

      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-cyan shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              AST Behavioral Diff & Blast Radius Simulator
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono break-words">
            Scenario: AI changed 1 line in <span className="text-brand-cyan">user.ts</span> (
            <code className="px-1 py-0.5 rounded bg-[var(--surface-100)] text-[var(--text-secondary)] break-all sm:break-normal">
              return user ➔ return &#123; user &#125;
            </code>
            )
          </p>
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex items-center p-1 bg-[var(--surface-100)] rounded-xl border border-[var(--border-subtle)] self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setMode('git-diff')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'git-diff'
                ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Standard Git Diff
          </button>
          <button
            onClick={() => setMode('firewall')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'firewall'
                ? 'bg-brand-danger/15 text-brand-danger border border-brand-danger/30 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-brand-danger" />
            Change Firewall AST
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left Side: SVG Dependency Graph */}
        <div className="lg:col-span-7 code-dark-panel rounded-xl p-4 border border-white/10 relative aspect-[4/3] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 500 420" className="w-full h-full">
            {/* Connection Lines to Consumers */}
            {CONSUMERS.map((c) => (
              <line
                key={`line-${c.id}`}
                x1={250}
                y1={210}
                x2={c.x}
                y2={c.y}
                className="connection-line"
                stroke={mode === 'firewall' ? '#ff3366' : '#475569'}
                strokeWidth={mode === 'firewall' ? 2 : 1.2}
              />
            ))}

            {/* Shockwave Animated Circle */}
            <circle
              ref={shockwaveRef}
              cx={250}
              cy={210}
              r={25}
              fill="none"
              stroke="#ff3366"
              strokeWidth="2"
              opacity={mode === 'firewall' ? 0.8 : 0}
            />

            {/* Consumer Nodes */}
            {CONSUMERS.map((c) => (
              <g
                key={c.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredNode(c)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={22}
                  className="consumer-node-circle transition-all"
                  fill="#0f172a"
                  stroke={mode === 'firewall' ? '#ff3366' : '#475569'}
                  strokeWidth="2"
                />
                <text
                  x={c.x}
                  y={c.y + 4}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-200 font-bold pointer-events-none"
                >
                  {c.id}
                </text>
                <text
                  x={c.x}
                  y={c.y + 36}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400 pointer-events-none"
                >
                  {c.name}
                </text>
              </g>
            ))}

            {/* Center Root Node: Mutated File */}
            <g>
              <circle
                cx={250}
                cy={210}
                r={36}
                className={
                  mode === 'firewall'
                    ? 'fill-rose-950/80 stroke-brand-danger'
                    : 'fill-slate-800 stroke-slate-600'
                }
                strokeWidth="3"
              />
              <text
                x={250}
                y={208}
                textAnchor="middle"
                className="text-[11px] font-bold fill-white pointer-events-none font-mono"
              >
                user.ts
              </text>
              <text
                x={250}
                y={224}
                textAnchor="middle"
                className="text-[8px] font-bold fill-brand-cyan pointer-events-none font-mono"
              >
                GET /api/user
              </text>
            </g>
          </svg>

          {/* Top Status Overlay Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                mode === 'firewall' ? 'bg-brand-danger animate-ping' : 'bg-brand-success'
              }`}
            />
            <span>
              {mode === 'firewall'
                ? 'Blast Radius: 6 Broken Downstream Callers'
                : 'Standard Diff: 1 file (+1, -1)'}
            </span>
          </div>

          {/* Hovered Node Tooltip Preview */}
          {hoveredNode && (
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-brand-cyan/40 text-[11px] font-mono text-slate-200">
              <span className="text-brand-cyan font-bold">{hoveredNode.name}</span>
              <span className="text-slate-400 ml-1.5">({hoveredNode.type})</span>
            </div>
          )}
        </div>

        {/* Right Side: Diff & Diagnosis Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Diff preview box */}
          <div className="code-dark-panel rounded-xl p-4 border border-white/10 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/[0.06] mb-3">
              <span>src/controllers/user.ts</span>
              <span className="text-brand-cyan">Line 42</span>
            </div>
            <div className="space-y-1.5">
              <div className="bg-red-500/20 text-red-300 px-2.5 py-1 rounded flex items-center gap-2">
                <span className="font-bold">-</span>
                <span>return user;</span>
              </div>
              <div className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded flex items-center gap-2">
                <span className="font-bold">+</span>
                <span>return &#123; user &#125;;</span>
              </div>
            </div>
          </div>

          {/* Diagnosis Card */}
          {mode === 'firewall' ? (
            <div className="glass-panel-danger rounded-xl p-5 space-y-3.5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-danger font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>High Risk Mutation Detected</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-danger/20 text-brand-danger border border-brand-danger/30">
                  Score: 74 / 100
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden border border-black/10 dark:border-white/10">
                <div className="risk-meter-fill h-full bg-gradient-to-r from-amber-400 to-brand-danger w-[74%]" />
              </div>

              <div className="text-xs space-y-1.5">
                <p className="font-bold text-[var(--text-primary)]">
                  💥 Breaking API Contract Mutation
                </p>
                <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                  The endpoint wrapper object was modified without updating deserializers in{' '}
                  <strong className="text-[var(--text-primary)]">6 downstream consumer files</strong>. Client views and mobile apps will receive undefined properties at runtime.
                </p>
              </div>

              <div className="pt-2 border-t border-brand-danger/20 flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)] font-mono">Automated Gate:</span>
                <span className="text-brand-danger font-semibold font-mono">MERGE BLOCKED (Exit 1)</span>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-5 space-y-3 border-emerald-500/20 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Standard Git Diff View</span>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  +1 / -1 lines
                </span>
              </div>

              <div className="text-xs text-[var(--text-secondary)] space-y-1 leading-relaxed">
                <p>Standard diff marks this change as small and harmless.</p>
                <p className="text-[var(--text-muted)] text-[11px]">
                  Traditional code review tools and standard unit tests pass this pull request without warning, allowing silent breaking mutations into production.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
