'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import BlastVisualizer from './BlastVisualizer';
import { Sparkles, Terminal, ArrowRight, ShieldCheck, Cpu, Code2, BookOpen, Check, Copy } from 'lucide-react';
import Link from 'next/link';

export default function HeroTrailer() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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

  const copyQuickStart = () => {
    navigator.clipboard.writeText('npx change-firewall');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="simulator" className="relative pt-10 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-medium mb-6">
          <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
          <span className="font-semibold text-[var(--text-primary)]">Change Firewall v0.1.4</span>
          <span className="text-[var(--text-muted)]">•</span>
          <span>Native MCP Engine</span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="text-[var(--text-muted)]">100% Offline AST</span>
        </div>

        {/* Hero Title with killer modern typography */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--text-primary)] max-w-5xl leading-[1.12]"
        >
          Your AI wrote the code. <br />
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent font-black">
            We tell you what it broke.
          </span>
        </h1>

        {/* Subtitle with soft comfortable contrast */}
        <p
          ref={subtitleRef}
          className="mt-5 text-base sm:text-xl text-[var(--text-secondary)] max-w-3xl font-normal leading-relaxed"
        >
          Standard git diffs only see text lines (+1 / -1). Change Firewall computes deterministic AST behavioral mutations, maps downstream caller blast radius, and provides stdio MCP tools for autonomous AI self-correction.
        </p>

        {/* Quick Command & Action Buttons */}
        <div ref={ctaRef} className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
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

          {/* Primary CTA: View Docs */}
          <Link
            href="/docs"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-main)] hover:opacity-90 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Documentation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Future updates waitlist CTA */}
          <a
            href="#waitlist"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[var(--surface-100)] hover:bg-[var(--surface-200)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>Get Future Updates</span>
          </a>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-success" />
            <span>Zero API Keys / 100% Offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-cyan" />
            <span>Deterministic AST Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-brand-purple" />
            <span>Claude, Antigravity & Cursor Ready</span>
          </div>
        </div>

        {/* Killer Interactive AST Blast Radius Visualizer */}
        <div className="w-full mt-12 max-w-6xl">
          <BlastVisualizer />
        </div>
      </div>
    </section>
  );
}
