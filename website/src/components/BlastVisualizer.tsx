'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import anime from 'animejs';
import { ShieldAlert, AlertTriangle, CheckCircle2, Zap, ArrowRight, Activity } from 'lucide-react';

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
  { id: 'c2', name: 'ProfileHeader.tsx', path: 'src/views/ProfileHeader.tsx', type: 'UI Component', x: 380, y: 60 },
  { id: 'c3', name: 'useUserSession.ts', path: 'src/hooks/useUserSession.ts', type: 'React Hook', x: 420, y: 220 },
  { id: 'c4', name: 'billingSync.ts', path: 'src/services/billingSync.ts', type: 'Microservice', x: 360, y: 340 },
  { id: 'c5', name: 'SettingsModal.tsx', path: 'src/views/SettingsModal.tsx', type: 'UI Component', x: 140, y: 350 },
  { id: 'c6', name: 'analyticsTracker.ts', path: 'src/analytics/tracker.ts', type: 'Analytics', x: 60, y: 220 },
];

export default function BlastVisualizer() {
  const [mode, setMode] = useState<'git-diff' | 'firewall'>('firewall');
  const [score, setScore] = useState(74);
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
          strokeWidth: 2.5,
          strokeDasharray: '6, 6',
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        });

        gsap.to('.consumer-node-circle', {
          fill: '#2a111a',
          stroke: '#ff3366',
          duration: 0.5,
          stagger: 0.05,
          scale: 1.08,
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
          stroke: '#1e293b',
          strokeWidth: 1.5,
          strokeDasharray: 'none',
          duration: 0.5,
        });

        gsap.to('.consumer-node-circle', {
          fill: '#0f172a',
          stroke: '#334155',
          duration: 0.5,
          scale: 1.0,
          transformOrigin: 'center',
        });

        gsap.to('.risk-meter-fill', {
          width: '5%',
          duration: 0.8,
          ease: 'power3.out',
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [mode]);

  return (
    <div ref={containerRef} className="w-full glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div
        className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          mode === 'firewall' ? 'bg-brand-danger/15' : 'bg-brand-cyan/10'
        }`}
      />

      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-cyan" />
            <h3 className="text-base font-semibold text-white">Live AST Blast Radius Simulation</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Scenario: AI modified 1 line in <code className="text-brand-cyan font-mono">user.ts</code> (<code className="text-slate-300 font-mono">return user ➔ return &#123; user &#125;</code>)
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center p-1 bg-surface-100 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setMode('git-diff')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'git-diff'
                ? 'bg-surface-300 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard Git Diff
          </button>
          <button
            onClick={() => setMode('firewall')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'firewall'
                ? 'bg-gradient-to-r from-brand-danger/30 to-brand-purple/30 text-white border border-brand-danger/50 shadow-md shadow-brand-danger/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-brand-danger" />
            Change Firewall
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left Side: Visual Graph (SVG Canvas) */}
        <div className="lg:col-span-7 bg-[#090d16] rounded-xl p-4 border border-white/[0.08] relative aspect-[4/3] flex items-center justify-center">
          <svg viewBox="0 0 500 420" className="w-full h-full">
            {/* Center Origin: mutated controller */}
            {/* Connection Lines */}
            {CONSUMERS.map((c) => (
              <line
                key={`line-${c.id}`}
                x1={250}
                y1={210}
                x2={c.x}
                y2={c.y}
                className="connection-line"
                stroke="#1e293b"
                strokeWidth="1.5"
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
              <g key={c.id} className="cursor-pointer group">
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={22}
                  className="consumer-node-circle transition-all"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="2"
                />
                <text
                  x={c.x}
                  y={c.y + 4}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-300 font-bold pointer-events-none"
                >
                  {c.id}
                </text>
                {/* Node Label Below */}
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

            {/* Center Node: The Mutated File */}
            <g>
              <circle
                cx={250}
                cy={210}
                r={36}
                className={mode === 'firewall' ? 'fill-brand-danger/20 stroke-brand-danger' : 'fill-slate-800 stroke-slate-600'}
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

          {/* Overlay Status Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                mode === 'firewall' ? 'bg-brand-danger animate-ping' : 'bg-brand-success'
              }`}
            />
            <span>{mode === 'firewall' ? 'Blast Radius: 6 Downstream Callers' : 'Git Diff: 1 file modified'}</span>
          </div>
        </div>

        {/* Right Side: Before vs After & Risk Assessment Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Diff preview box */}
          <div className="bg-[#0b0e17] rounded-xl p-4 border border-white/10 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/[0.06] mb-3">
              <span>src/controllers/user.ts</span>
              <span className="text-brand-cyan">Line 42</span>
            </div>
            <div className="space-y-1">
              <div className="bg-red-500/15 text-red-400 px-2 py-1 rounded flex items-center gap-2">
                <span>-</span>
                <span>return user;</span>
              </div>
              <div className="bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded flex items-center gap-2">
                <span>+</span>
                <span>return &#123; user &#125;;</span>
              </div>
            </div>
          </div>

          {/* Diagnosis Card */}
          {mode === 'firewall' ? (
            <div className="glass-panel-danger rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-danger font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>High Risk Mutation Detected</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-danger/20 text-brand-danger border border-brand-danger/40">
                  Score: 74 / 100
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                <div className="risk-meter-fill h-full bg-gradient-to-r from-yellow-400 to-brand-danger w-[74%]" />
              </div>

              <div className="text-xs text-slate-300 space-y-1.5">
                <p className="font-medium text-white">💥 API Response Contract Mutated</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  The endpoint wrapper was altered without updating deserializers in <strong>6 downstream consumers</strong>. Client views and mobile bridges will receive undefined fields at runtime.
                </p>
              </div>

              <div className="pt-2 border-t border-brand-danger/20 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">Action Recommended:</span>
                <span className="text-brand-cyan font-semibold">Revert wrapper or update clients</span>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-5 space-y-3 border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Standard Git Diff View</span>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +1 / -1 lines
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1 leading-relaxed">
                <p>Normal git diff sees this as a tiny, harmless 1-line change.</p>
                <p className="text-slate-500 text-[11px]">
                  Traditional code review tools and unit tests (if unmocked) pass this PR without warning, triggering breaking outages in production.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
