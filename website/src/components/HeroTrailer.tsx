'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import dynamic from 'next/dynamic';
import BlastVisualizer from './BlastVisualizer';
import { Activity, Terminal, ArrowRight, ShieldCheck, Cpu, Code2, BookOpen, Check, Copy, Bot } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

import TextEmerge from '@/components/originkit/ui/text-emerge';

const VectorWordmark = dynamic(() => import('@/components/originkit/ui/vector-wordmark'), {
  ssr: false,
});

export default function HeroTrailer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
    );
    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' }
    );
    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' }
    );
  }, []);

  const isDark = theme === 'dark';

  const copyQuickStart = () => {
    navigator.clipboard.writeText('npx change-firewall');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="simulator" className="relative pt-8 pb-14 sm:pt-12 sm:pb-20 overflow-hidden scroll-mt-[68px]">
      {/* Vector Wordmark Dynamic Overlay over the Hero Area */}
      <div className="absolute inset-0 w-full h-[580px] sm:h-[640px] pointer-events-none z-10 overflow-hidden">
        {mounted && (
          <VectorWordmark
            background="transparent"
            text=""
            textColor="transparent"
            shade="transparent"
            accent={isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 92, 38, 0.4)'}
            reach={340}
            speed={50}
            damping={55}
            handles={{
              size: 85,
              spread: 32,
              labels: true,
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-20">
        {/* Release Pill Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] sm:text-xs font-medium mb-6 max-w-full">
          <Terminal className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
          <span className="font-semibold text-[var(--text-primary)] whitespace-nowrap">Change Firewall v0.3.1</span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="whitespace-nowrap font-medium text-brand-cyan">The AI Agent Trust Layer</span>
          <span className="text-[var(--text-muted)] hidden xs:inline">•</span>
          <span className="text-[var(--text-muted)] hidden xs:inline whitespace-nowrap">Neutral Non-LLM Referee</span>
        </div>

        {/* Hero Title with fluid modern typography */}
        <h1
          ref={titleRef}
          className="font-black tracking-tight text-[var(--text-primary)] max-w-5xl leading-[1.08] w-full"
        >
          <span className="block text-[clamp(1.4rem,4.2vw,3.25rem)] font-extrabold text-[var(--text-primary)] mb-1 sm:mb-2">
            Your AI agent wrote the code.
          </span>
          <span className="block text-[clamp(1.85rem,6.5vw,5rem)] font-black text-[#ff5c26] dark:text-[#ff6e38] tracking-tight leading-[1.05]">
            We are the referee before it merges.
          </span>
        </h1>

        {/* Subtitle with dynamic Text Emerge animation */}
        <div
          ref={subtitleRef}
          className="mt-4 text-sm sm:text-lg text-[var(--text-secondary)] max-w-3xl font-normal leading-relaxed w-full"
        >
          <TextEmerge
            text="Autonomous agents rewrite 20 files in 5 seconds and self-report success. Change Firewall provides deterministic, compiler-grounded verification of what the agent actually touched vs. what it claimed, maps downstream blast radius, and proves runtime crashes with zero guesswork."
            color="var(--text-secondary)"
            staggerFrom="start"
            tag="p"
            font={{
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              fontWeight: 'inherit',
              textAlign: 'center',
            }}
            transition={{
              duration: 0.55,
              delay: 0.15,
              ease: 'easeOut',
              staggerChildren: 0.02,
            }}
          />
        </div>

        {/* Quick Command & Action Buttons */}
        <div ref={ctaRef} className="mt-6 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          {/* 1-Click Copy Command */}
          <button
            onClick={copyQuickStart}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[var(--surface-100)] hover:bg-[var(--surface-200)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm group"
            title="Click to copy quickstart"
          >
            <Terminal className="w-4 h-4 text-brand-cyan" />
            <span>npx change-firewall</span>
            {copied ? (
              <span className="flex items-center gap-1 text-brand-success font-sans text-xs">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
            )}
          </button>

          {/* MCP CTA */}
          <a
            href="#mcp"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[var(--surface-100)] hover:bg-[var(--surface-200)] border border-[var(--border-card)] text-[var(--text-primary)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Bot className="w-4 h-4 text-brand-purple" />
            <span>Add to Cursor / Claude MCP</span>
          </a>

          {/* Primary CTA: View Docs */}
          <Link
            href="/docs"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-main)] hover:opacity-90 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Documentation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-[var(--text-muted)] font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-success" />
            <span>Neutral Non-LLM Referee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-cyan" />
            <span>Compiler AST Grounded (Zero Hallucination)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-brand-purple" />
            <span>100% Offline • Claude, Cursor & Devin Ready</span>
          </div>
        </div>

        {/* Killer Interactive AST Blast Radius Visualizer - Full Width */}
        <div className="w-full mt-10 max-w-[1550px]">
          <BlastVisualizer />
        </div>
      </div>
    </section>
  );
}
