'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Terminal, Copy, Check, Github, BookOpen, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const [copied, setCopied] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const copyCommand = () => {
    navigator.clipboard.writeText('npx change-firewall');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/85 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple p-[1px] shadow-sm">
            <div className="w-full h-full bg-[var(--surface-main)] rounded-[11px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
              Change Firewall
            </span>
            <span className="ml-2 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
              v0.1.4
            </span>
          </div>
        </Link>

        {/* Navigation Links (Universal Next.js Link pointing to /#section so they work from /docs) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
          <Link href="/#simulator" className="hover:text-[var(--text-primary)] transition-colors">
            Interactive Trailer
          </Link>
          <Link href="/#superpowers" className="hover:text-[var(--text-primary)] transition-colors">
            Superpowers
          </Link>
          <Link href="/#mcp-hub" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            MCP Integration
          </Link>
          <Link href="/docs" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 font-semibold text-brand-cyan">
            <BookOpen className="w-3.5 h-3.5" />
            Docs & Architecture
          </Link>
        </nav>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:scale-105"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Quick Copy Command */}
          <button
            onClick={copyCommand}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
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
            className="p-2 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* NPM Link */}
          <a
            href="https://www.npmjs.com/package/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 transition-all shadow-sm"
          >
            NPM v0.1.4
          </a>
        </div>
      </div>
    </header>
  );
}
