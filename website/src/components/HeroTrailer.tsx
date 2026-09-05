'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import BlastVisualizer from './BlastVisualizer';
import { Sparkles, Terminal, ArrowRight, ShieldCheck, Cpu, Code2 } from 'lucide-react';
import Link from 'next/link';

export default function HeroTrailer() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' }
    );
  }, []);

  return (
    <section id="simulator" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-100/90 border border-brand-cyan/30 text-brand-cyan text-xs font-medium mb-8 shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
          <span>Change Firewall v0.1.4 is Live with Native MCP Support</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">100% Local-First</span>
        </div>

        {/* Hero Title */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.15]"
        >
          Your AI wrote the code. <br />
          <span className="bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent glow-text-cyan">
            We tell you what it actually broke.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl font-normal leading-relaxed"
        >
          Raw Git diffs hide consequences. Change Firewall performs deterministic AST behavioral analysis,
          maps downstream caller blast radius, and provides native Model Context Protocol (MCP) tooling for
          autonomous self-correction.
        </p>

        {/* Primary CTA Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href="#waitlist"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan/90 hover:to-brand-blue/90 text-slate-950 font-bold text-sm shadow-lg shadow-brand-cyan/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Get Future Superpowers</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            href="/docs"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Documentation</span>
          </Link>
        </div>

        {/* Badges / Guarantees */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-success" />
            <span>Zero API Keys / 100% Offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-cyan" />
            <span>Deterministic AST Diffing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-brand-purple" />
            <span>Claude, Antigravity & Cursor Native</span>
          </div>
        </div>

        {/* Interactive Visual Trailer Simulator */}
        <div className="w-full mt-14 max-w-5xl">
          <BlastVisualizer />
        </div>
      </div>
    </section>
  );
}
