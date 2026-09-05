'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ShieldAlert,
  CheckCircle2,
  Zap,
  Activity,
  Info,
  Layers,
  FileCode2,
  Terminal,
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  AlertTriangle,
  Flame,
  ExternalLink,
  ChevronRight,
  Eye,
} from 'lucide-react';

export interface ConsumerNode {
  id: string;
  name: string;
  path: string;
  type: string;
  x: number;
  y: number;
  severity: 'CRITICAL' | 'HIGH' | 'FATAL' | 'MEDIUM';
  lineNo: number;
  callsite: string;
  expected: string;
  actual: string;
  errorType: string;
  impactDesc: string;
}

const CONSUMERS: ConsumerNode[] = [
  {
    id: 'c1',
    name: 'userClient.ts',
    path: 'src/client/userClient.ts',
    type: 'API Client',
    x: 130,
    y: 90,
    severity: 'CRITICAL',
    lineNo: 34,
    callsite: 'const { id, role } = await fetchUser();',
    expected: 'user: { id: string, role: string }',
    actual: 'undefined (payload wrapped in { user })',
    errorType: 'TypeError: Cannot destructure property "id" of undefined',
    impactDesc: 'All frontend user profile, workspace, and role queries fail on initial mount.',
  },
  {
    id: 'c2',
    name: 'ProfileHeader.tsx',
    path: 'src/views/ProfileHeader.tsx',
    type: 'UI Component',
    x: 430,
    y: 90,
    severity: 'HIGH',
    lineNo: 18,
    callsite: '<Avatar src={user.avatarUrl} alt={user.name} />',
    expected: 'user.avatarUrl: string',
    actual: 'undefined',
    errorType: 'React Client Render Crash: Cannot read properties of undefined',
    impactDesc: 'Main app navigation bar and header crash, displaying a blank white screen.',
  },
  {
    id: 'c3',
    name: 'useUserSession.ts',
    path: 'src/hooks/useUserSession.ts',
    type: 'React Hook',
    x: 480,
    y: 210,
    severity: 'CRITICAL',
    lineNo: 52,
    callsite: 'sessionStorage.setItem("token", user.token);',
    expected: 'user.token: string',
    actual: 'undefined',
    errorType: 'Authentication State Invalidation',
    impactDesc: 'Users are logged out unexpectedly after refreshing or opening a second browser tab.',
  },
  {
    id: 'c4',
    name: 'billingSync.ts',
    path: 'src/services/billingSync.ts',
    type: 'Microservice',
    x: 430,
    y: 330,
    severity: 'FATAL',
    lineNo: 89,
    callsite: 'await stripe.customers.update(user.stripeCustomerId, { ... });',
    expected: 'user.stripeCustomerId: string',
    actual: 'undefined',
    errorType: 'Stripe API 400 Bad Request: Missing customer ID',
    impactDesc: 'Background webhook fails; invoice synchronizations and credit cards are blocked.',
  },
  {
    id: 'c5',
    name: 'SettingsModal.tsx',
    path: 'src/views/SettingsModal.tsx',
    type: 'UI Component',
    x: 130,
    y: 330,
    severity: 'HIGH',
    lineNo: 41,
    callsite: 'if (user.role !== "admin") return <Forbidden />;',
    expected: 'user.role: "admin" | "member"',
    actual: 'undefined',
    errorType: 'Access Control Logic Bypass / Privilege Flaw',
    impactDesc: 'Role check evaluates falsy, potentially locking out admins from project settings.',
  },
  {
    id: 'c6',
    name: 'analyticsTracker.ts',
    path: 'src/analytics/tracker.ts',
    type: 'Telemetry',
    x: 80,
    y: 210,
    severity: 'MEDIUM',
    lineNo: 12,
    callsite: 'mixpanel.identify(user.uuid, { email: user.email });',
    expected: 'user.uuid: string, user.email: string',
    actual: 'undefined',
    errorType: 'Silent Telemetry Failure (No Exceptions Logged)',
    impactDesc: 'Conversion and retention analytics drop to 0 without any error reported in Sentry.',
  },
];

export default function BlastVisualizer() {
  const [mode, setMode] = useState<'git-diff' | 'firewall'>('firewall');
  const [selectedNode, setSelectedNode] = useState<ConsumerNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ConsumerNode | null>(null);
  const [mobileTab, setMobileTab] = useState<'radar' | 'diagnostic'>('radar');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(74);

  const containerRef = useRef<HTMLDivElement>(null);
  const meterFillRef = useRef<HTMLDivElement>(null);

  // Animated numerical score counter & progress bar
  useEffect(() => {
    const targetScore = mode === 'firewall' ? 74 : 0;
    const targetWidth = mode === 'firewall' ? '74%' : '0%';

    const scoreObj = { val: score };
    gsap.to(scoreObj, {
      val: targetScore,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => setScore(Math.round(scoreObj.val)),
    });

    if (meterFillRef.current) {
      gsap.to(meterFillRef.current, {
        width: targetWidth,
        duration: 0.9,
        ease: 'power3.out',
      });
    }
  }, [mode]);

  // Auto-play cycling through nodes
  useEffect(() => {
    if (!isAutoPlaying || mode !== 'firewall') return;

    let currentIndex = selectedNode
      ? CONSUMERS.findIndex((c) => c.id === selectedNode.id)
      : -1;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % CONSUMERS.length;
      setSelectedNode(CONSUMERS[currentIndex]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoPlaying, mode, selectedNode]);

  const activeFocus = selectedNode || hoveredNode;

  return (
    <div
      ref={containerRef}
      className="w-full glass-panel rounded-2xl p-3.5 sm:p-6 md:p-8 border border-[var(--border-card)] shadow-sm relative overflow-hidden text-left"
    >
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-cyan shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
              AST Behavioral Diff & Blast Radius Simulator
            </h3>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[var(--surface-100)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              Interactive Radar
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono break-words leading-relaxed">
            Scenario: AI refactored return in <span className="text-brand-cyan font-semibold">user.ts</span> (
            <code className="px-1 py-0.5 rounded bg-[var(--surface-100)] text-[var(--text-secondary)] break-all sm:break-normal">
              return user ➔ return &#123; user &#125;
            </code>
            )
          </p>
        </div>

        {/* Mode Toggle Switch & Auto Play */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {mode === 'firewall' && (
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                isAutoPlaying
                  ? 'bg-brand-cyan/15 border-brand-cyan/30 text-brand-cyan'
                  : 'bg-[var(--surface-100)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title={isAutoPlaying ? 'Pause automatic demo' : 'Auto cycle through callers'}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-brand-cyan" />
                  <span className="hidden xs:inline">Auto</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span className="hidden xs:inline">Play</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center p-1 bg-[var(--surface-100)] rounded-xl border border-[var(--border-subtle)]">
            <button
              onClick={() => {
                setMode('git-diff');
                setSelectedNode(null);
                setIsAutoPlaying(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'git-diff'
                  ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Standard Diff
            </button>
            <button
              onClick={() => setMode('firewall')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                mode === 'firewall'
                  ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              <span>Firewall AST</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Segmented Toggle (< lg) */}
      <div className="lg:hidden mt-3 p-1 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] grid grid-cols-2 gap-1">
        <button
          onClick={() => setMobileTab('radar')}
          className={`py-2 px-3 rounded-md text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'radar'
              ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Radar Graph</span>
        </button>
        <button
          onClick={() => setMobileTab('diagnostic')}
          className={`py-2 px-3 rounded-md text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'diagnostic'
              ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>AST Diagnostic ({CONSUMERS.length})</span>
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 sm:mt-6 items-start">
        {/* Left Side: SVG Dependency Radar */}
        <div
          className={`lg:col-span-7 flex-col gap-2.5 ${
            mobileTab === 'radar' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="code-dark-panel rounded-xl p-2 sm:p-4 border border-white/10 relative aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center overflow-hidden select-none">
            {/* Top HUD Overlay Bar */}
            <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 flex items-center justify-between z-10 pointer-events-none">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] font-mono text-slate-200 shadow-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    mode === 'firewall'
                      ? 'bg-rose-500 animate-ping'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="font-semibold">
                  {mode === 'firewall'
                    ? `Blast Radius: ${CONSUMERS.length} Broken Downstream Callers`
                    : 'Standard Diff: 1 file (+1, -1) · Clean'}
                </span>
              </div>

              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="pointer-events-auto flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 transition-colors border border-white/15"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset focus</span>
                </button>
              )}
            </div>

            {/* SVG Radar Map */}
            <svg viewBox="0 0 560 420" className="w-full h-full max-h-[380px] sm:max-h-[460px]">
              <defs>
                {/* Sonar Radar Gradient */}
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ff3366" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ff3366" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Concentric Radar Distance Rings */}
              <circle
                cx={280}
                cy={210}
                r={70}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <circle
                cx={280}
                cy={210}
                r={135}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <circle
                cx={280}
                cy={210}
                r={200}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />

              {/* Crosshair grid lines */}
              <line
                x1={80}
                y1={210}
                x2={480}
                y2={210}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="1"
              />
              <line
                x1={280}
                y1={50}
                x2={280}
                y2={370}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="1"
              />

              {/* Sonar Expanding Waves (Hardware-accelerated) */}
              {mode === 'firewall' && (
                <>
                  <circle
                    cx={280}
                    cy={210}
                    fill="none"
                    stroke="#f43f5e"
                    className="animate-sonar-wave pointer-events-none"
                  />
                  <circle
                    cx={280}
                    cy={210}
                    fill="none"
                    stroke="#f43f5e"
                    className="animate-sonar-wave-delayed pointer-events-none"
                  />
                </>
              )}

              {/* Connection Lines to Consumer Nodes */}
              {CONSUMERS.map((c) => {
                const isThisSelected = selectedNode?.id === c.id;
                const isOtherSelected = selectedNode && selectedNode.id !== c.id;

                let strokeColor = '#475569';
                let strokeWidth = 1.2;
                let lineClass = '';

                if (mode === 'firewall') {
                  if (isThisSelected) {
                    strokeColor = '#f43f5e';
                    strokeWidth = 2.5;
                    lineClass = 'animate-blast-stream';
                  } else if (isOtherSelected) {
                    strokeColor = 'rgba(244, 63, 94, 0.25)';
                    strokeWidth = 1;
                  } else {
                    strokeColor = '#f43f5e';
                    strokeWidth = 1.8;
                    lineClass = 'animate-blast-stream';
                  }
                }

                return (
                  <line
                    key={`line-${c.id}`}
                    x1={280}
                    y1={210}
                    x2={c.x}
                    y2={c.y}
                    className={`transition-all duration-300 ${lineClass}`}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                );
              })}

              {/* Consumer Nodes */}
              {CONSUMERS.map((c) => {
                const isSelected = selectedNode?.id === c.id;
                const isHovered = hoveredNode?.id === c.id;
                const isFaded = selectedNode && !isSelected;

                return (
                  <g
                    key={c.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedNode(isSelected ? null : c);
                      if (window.innerWidth < 1024) {
                        setMobileTab('diagnostic');
                      }
                    }}
                    onMouseEnter={() => setHoveredNode(c)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{
                      opacity: isFaded ? 0.38 : 1,
                      transition: 'opacity 0.25s ease',
                    }}
                  >
                    {/* Generous touch target */}
                    <circle cx={c.x} cy={c.y} r={34} fill="transparent" />

                    {/* Selected Node Radar Target Reticle */}
                    {isSelected && (
                      <>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={28}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          className="animate-spin pointer-events-none"
                          style={{ transformOrigin: `${c.x}px ${c.y}px` }}
                        />
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={32}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="1"
                          opacity={0.5}
                          className="pointer-events-none"
                        />
                      </>
                    )}

                    {/* Node Core Circle */}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={20}
                      className="transition-all duration-200"
                      fill={isSelected ? '#1e1017' : '#090d16'}
                      stroke={
                        mode === 'firewall'
                          ? isSelected
                            ? '#ff4d79'
                            : '#f43f5e'
                          : '#475569'
                      }
                      strokeWidth={isSelected ? 2.5 : 1.8}
                    />

                    {/* Node ID Text */}
                    <text
                      x={c.x}
                      y={c.y + 4}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-100 font-bold pointer-events-none select-none"
                    >
                      {c.id.toUpperCase()}
                    </text>

                    {/* Node Name Label */}
                    <text
                      x={c.x}
                      y={c.y + 32}
                      textAnchor="middle"
                      className={`text-[10px] font-mono pointer-events-none select-none transition-colors ${
                        isSelected
                          ? 'fill-white font-bold'
                          : 'fill-slate-300 group-hover:fill-white'
                      }`}
                    >
                      {c.name}
                    </text>

                    {/* Severity Badge Pill under node */}
                    {mode === 'firewall' && (
                      <g className="pointer-events-none select-none">
                        <rect
                          x={c.x - 22}
                          y={c.y + 37}
                          width={44}
                          height={12}
                          rx={3}
                          fill={
                            c.severity === 'FATAL'
                              ? 'rgba(225, 29, 72, 0.8)'
                              : c.severity === 'CRITICAL'
                              ? 'rgba(244, 63, 94, 0.7)'
                              : 'rgba(245, 158, 11, 0.7)'
                          }
                        />
                        <text
                          x={c.x}
                          y={c.y + 46}
                          textAnchor="middle"
                          className="text-[7.5px] font-mono font-bold fill-white tracking-wider"
                        >
                          {c.severity}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Center Root Mutated File Node */}
              <g className="select-none">
                {mode === 'firewall' && (
                  <circle
                    cx={280}
                    cy={210}
                    r={48}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="animate-node-beacon pointer-events-none"
                    style={{ transformOrigin: '280px 210px' }}
                  />
                )}

                <circle
                  cx={280}
                  cy={210}
                  r={34}
                  className={
                    mode === 'firewall'
                      ? 'fill-rose-950/90 stroke-rose-500'
                      : 'fill-slate-800 stroke-slate-600'
                  }
                  strokeWidth="2.5"
                />

                <text
                  x={280}
                  y={207}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-white pointer-events-none font-mono tracking-tight"
                >
                  user.ts
                </text>
                <text
                  x={280}
                  y={223}
                  textAnchor="middle"
                  className="text-[8.5px] font-bold fill-brand-cyan pointer-events-none font-mono"
                >
                  GET /user
                </text>
              </g>
            </svg>

            {/* Bottom Interactive Prompt */}
            <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5 pointer-events-none">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse shrink-0" />
                <span className="truncate">Tap any node to inspect broken callsite & runtime exception</span>
              </span>
              <span className="hidden sm:inline shrink-0 text-slate-500">AST Graph View</span>
            </div>
          </div>

          {/* Under-the-Graph Mobile Caller Selector Carousel */}
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 -mx-2 px-2 snap-x">
            <button
              onClick={() => setSelectedNode(null)}
              className={`snap-start shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                selectedNode === null
                  ? 'bg-[var(--surface-100)] border-[var(--text-primary)] text-[var(--text-primary)] font-semibold'
                  : 'bg-[var(--surface-main)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              All 6 Callers
            </button>

            {CONSUMERS.map((c) => {
              const isSelected = selectedNode?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedNode(isSelected ? null : c);
                    if (window.innerWidth < 1024) {
                      setMobileTab('diagnostic');
                    }
                  }}
                  className={`snap-start shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500 text-rose-500 dark:text-rose-400 font-semibold'
                      : 'bg-[var(--surface-main)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      mode === 'firewall' ? 'bg-rose-500' : 'bg-slate-400'
                    }`}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Diff & Deep Inspection Card */}
        <div
          className={`lg:col-span-5 flex-col gap-3.5 ${
            mobileTab === 'diagnostic' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Diff preview box */}
          <div className="code-dark-panel rounded-xl p-3.5 border border-white/10 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/[0.06] mb-2.5">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300 truncate">
                <FileCode2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">src/controllers/user.ts</span>
              </span>
              <span className="text-brand-cyan shrink-0">Line 42</span>
            </div>

            <div className="space-y-1">
              <div className="bg-red-500/15 text-red-300 px-2.5 py-1.5 rounded flex items-center gap-2 text-xs">
                <span className="font-bold text-red-400">-</span>
                <span className="font-mono">return user;</span>
              </div>
              <div className="bg-emerald-500/15 text-emerald-300 px-2.5 py-1.5 rounded flex items-center gap-2 text-xs">
                <span className="font-bold text-emerald-400">+</span>
                <span className="font-mono">return &#123; user &#125;;</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 font-sans leading-relaxed">
              AI wrapped the return payload in a nested object without updating downstream contract deserializers.
            </p>
          </div>

          {/* Dynamic Diagnosis & Callout Card */}
          {mode === 'firewall' ? (
            <div className="glass-panel-danger rounded-xl p-4 sm:p-5 space-y-3 text-left shadow-sm">
              {/* Header Status Bar */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>High Risk Mutation Detected</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30">
                  Risk Score: {score} / 100
                </span>
              </div>

              {/* Animated Progress bar */}
              <div className="w-full bg-black/30 dark:bg-white/10 rounded-full h-2 overflow-hidden border border-black/10 dark:border-white/10">
                <div
                  ref={meterFillRef}
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-600 w-[74%]"
                />
              </div>

              {/* Node-Specific Inspection or Full Blast Summary */}
              {selectedNode ? (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between pb-1.5 border-b border-rose-500/20">
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                        {selectedNode.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono block">
                        {selectedNode.path}:{selectedNode.lineNo}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30">
                      {selectedNode.severity}
                    </span>
                  </div>

                  {/* Broken Callsite Snippet */}
                  <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-[11px] space-y-1">
                    <div className="text-slate-400 text-[10px]">Broken Callsite (Line {selectedNode.lineNo}):</div>
                    <div className="text-rose-300 font-semibold truncate">
                      {selectedNode.callsite}
                    </div>
                  </div>

                  {/* Expected vs Actual */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                      <span className="text-slate-400 block text-[10px]">Expected:</span>
                      <span className="text-emerald-400 font-medium break-all">
                        {selectedNode.expected}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white/[0.03] border border-white/5">
                      <span className="text-slate-400 block text-[10px]">Runtime Result:</span>
                      <span className="text-rose-400 font-medium break-all">
                        {selectedNode.actual}
                      </span>
                    </div>
                  </div>

                  {/* Impact Description */}
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)]">Failure Impact: </strong>
                    {selectedNode.impactDesc}
                  </div>

                  <button
                    onClick={() => setSelectedNode(null)}
                    className="w-full mt-1 py-1.5 rounded-lg bg-[var(--surface-100)] hover:bg-[var(--surface-200)] text-[var(--text-primary)] text-xs font-mono transition-colors border border-[var(--border-subtle)] text-center"
                  >
                    ← View All 6 Broken Callers
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[var(--text-primary)]">
                      💥 6 Downstream Callers Severed
                    </p>
                    <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                      AST analysis discovered that 6 consumer files depend on the direct properties of{' '}
                      <code className="px-1 py-0.2 rounded bg-black/20 text-[var(--text-primary)] font-mono">
                        user
                      </code>
                      . Without Change Firewall, this innocent 1-line change silently breaks web, auth, and billing.
                    </p>
                  </div>

                  {/* Mini Grid of 6 Callers */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {CONSUMERS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedNode(c)}
                        className="p-1.5 rounded text-left bg-[var(--surface-main)] hover:bg-[var(--surface-100)] border border-[var(--border-subtle)] transition-colors group flex items-center justify-between"
                      >
                        <span className="font-mono text-[10.5px] text-[var(--text-primary)] truncate mr-1">
                          {c.name}
                        </span>
                        <ChevronRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)] font-mono">Automated CI Gate:</span>
                    <span className="text-rose-500 dark:text-rose-400 font-bold font-mono">
                      MERGE BLOCKED (Exit 1)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-4 sm:p-5 space-y-3 border-emerald-500/25 text-left shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Standard Git Diff View</span>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  +1 / -1 lines
                </span>
              </div>

              <div className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed">
                <p>Standard diff marks this change as small and harmless.</p>
                <div className="p-3 rounded-lg bg-[var(--surface-50)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
                  <div className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>The Silent Mutation Trap</span>
                  </div>
                  <p>
                    Traditional PR review tools and GitHub diffs only count textual additions and deletions. They do not parse the Abstract Syntax Tree or compute callers. Standard CI passes this PR, allowing 6 breaking runtime crashes into production.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)] font-mono">Traditional Gate:</span>
                <span className="text-emerald-500 font-semibold font-mono">PASSED (Exit 0)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
