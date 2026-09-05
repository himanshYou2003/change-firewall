'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Terminal, Copy, Check, Github, BookOpen, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npx change-firewall');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple p-[1px] shadow-lg shadow-brand-cyan/20">
            <div className="w-full h-full bg-[#0d111a] rounded-[11px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Change Firewall
            </span>
            <span className="ml-2 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
              v0.1.4
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#simulator" className="hover:text-white transition-colors">
            Interactive Trailer
          </a>
          <a href="#superpowers" className="hover:text-white transition-colors">
            Superpowers
          </a>
          <a href="#mcp-hub" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            MCP Integration
          </a>
          <Link href="/docs" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Quick Copy Command */}
          <button
            onClick={copyCommand}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-100/90 border border-white/10 hover:border-brand-cyan/50 text-slate-300 hover:text-white transition-all shadow-inner"
            title="Click to copy quick start command"
          >
            <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
            <span>npx change-firewall</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-brand-success" />
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
            )}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/himanshYou2003/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-surface-100/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* NPM Link */}
          <a
            href="https://www.npmjs.com/package/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 hover:from-brand-cyan/30 hover:to-brand-purple/30 text-brand-cyan border border-brand-cyan/40 transition-all shadow-sm"
          >
            NPM Package
          </a>
        </div>
      </div>
    </header>
  );
}
