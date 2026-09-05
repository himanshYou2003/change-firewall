'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Terminal,
  Copy,
  Check,
  Github,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
  Cpu,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isDocs = pathname?.startsWith('/docs');

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to close menu and ⌘M / Ctrl+M to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setMobileMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile/tablet menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const copyCommand = () => {
    navigator.clipboard.writeText('npx change-firewall');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setMobileMenuOpen(false);
    if (!isDocs) {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${id}`);
      }
    }
  };

  const NAV_ITEMS = [
    {
      title: 'Interactive Trailer',
      description: 'AST behavioral diffing & reverse caller blast radius simulation engine',
      badge: 'AST Simulator',
      href: isDocs ? '/#simulator' : '#simulator',
      icon: Activity,
      isHash: true,
      hashId: 'simulator',
    },
    {
      title: 'Engine Superpowers',
      description: 'Compiler AST, dependency graph, and deterministic 0-100 risk formula',
      badge: '4 Core Pillars',
      href: isDocs ? '/#superpowers' : '#superpowers',
      icon: Cpu,
      isHash: true,
      hashId: 'superpowers',
    },
    {
      title: 'Universal MCP Hub',
      description: 'Native Stdio Protocol integration for Claude, Antigravity, Cursor & Windsurf',
      badge: 'Active Protocol',
      href: isDocs ? '/#mcp-hub' : '#mcp-hub',
      icon: Sparkles,
      isHash: true,
      hashId: 'mcp-hub',
    },
    {
      title: 'Docs & Architecture',
      description: 'Complete CLI reference, AST specs, rule protocols, and CI/CD pipelines',
      badge: '17 Guides',
      href: '/docs',
      icon: BookOpen,
      isHash: false,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/85 backdrop-blur-xl transition-all duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Version Pill */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-orange-500/25 dark:border-[var(--border-subtle)] group-hover:border-orange-500/50 transition-colors bg-orange-500/[0.08] dark:bg-black flex items-center justify-center shadow-xs">
            <Image
              src="/logo.png"
              alt="Change Firewall Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
              Change Firewall
            </span>
            <div className="ml-2.5 hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--surface-100)] text-[var(--text-muted)] border border-[var(--border-subtle)] text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>v0.1.4</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links (Large Desktops >= 1280px) */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <a
            href={isDocs ? '/#simulator' : '#simulator'}
            onClick={(e) => scrollToSection(e, 'simulator')}
            className="px-3 py-1.5 rounded-lg hover:bg-[var(--surface-100)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 font-semibold"
          >
            <Activity className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Interactive Trailer</span>
          </a>
          <a
            href={isDocs ? '/#superpowers' : '#superpowers'}
            onClick={(e) => scrollToSection(e, 'superpowers')}
            className="px-3 py-1.5 rounded-lg hover:bg-[var(--surface-100)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 font-semibold"
          >
            <Cpu className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Superpowers</span>
          </a>
          <a
            href={isDocs ? '/#mcp-hub' : '#mcp-hub'}
            onClick={(e) => scrollToSection(e, 'mcp-hub')}
            className="px-3 py-1.5 rounded-lg hover:bg-[var(--surface-100)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            <span>MCP Integration</span>
          </a>
          <Link
            href="/docs"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${
              isDocs
                ? 'bg-[var(--surface-100)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs'
                : 'hover:bg-[var(--surface-100)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs & Architecture</span>
          </Link>
        </nav>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Copy Command Pill (Desktop >= 1024px) */}
          <button
            onClick={copyCommand}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-xs group"
            title="Click to copy quick start command"
          >
            <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
            <span>npx change-firewall</span>
            {copied ? (
              <span className="text-brand-success text-[11px] font-sans font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Copied
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/himanshYou2003/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-xs"
            aria-label="GitHub Repository"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:scale-105 shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* NPM Badge Button (Large screens) */}
          <a
            href="https://www.npmjs.com/package/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--surface-100)] hover:bg-[var(--surface-200)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-all shadow-xs"
          >
            NPM Package
          </a>

          {/* Elite Menu Trigger for Tablets (iPad Mini / iPad Air) & Mobile (< 1280px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`xl:hidden flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl border font-mono text-xs font-semibold transition-all shadow-xs ${
              mobileMenuOpen
                ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                : 'bg-[var(--surface-100)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-200)] hover:border-brand-cyan/30'
            }`}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <>
                <X className="w-4 h-4 text-brand-cyan" />
                <span className="hidden sm:inline">Close</span>
              </>
            ) : (
              <>
                <Menu className="w-4 h-4 text-brand-cyan" />
                <span className="hidden sm:inline">Menu</span>
                <kbd className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface-200)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-mono">
                  ⌘M
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Elite Tablet & Mobile Menu Overlay (iPad Mini, iPad Air, Mobile Phones) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 top-16 bg-black/50 dark:bg-black/70 backdrop-blur-xs z-40 xl:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Elite Floating Command Sheet */}
          <div className="fixed top-16 inset-x-0 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[var(--surface-main)]/98 dark:bg-[#07090e]/98 backdrop-blur-2xl border-b border-[var(--border-subtle)] shadow-2xl xl:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
              {/* Header Status Bar */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-brand-cyan font-mono text-xs">❯</span>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    System Navigation & Tools
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-success bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AST Engine Ready</span>
                </div>
              </div>

              {/* 2x2 Interactive Feature Grid for iPad Mini / Air (single column on narrow phones) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {NAV_ITEMS.map((item, idx) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 group-hover:border-brand-cyan/40 transition-colors shadow-2xs">
                        <Icon className="w-5 h-5 text-brand-cyan" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-brand-cyan transition-colors">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-200)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0 ml-1.5">
                            <span>{item.badge}</span>
                            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-brand-cyan transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );

                  const containerClasses =
                    'p-4 rounded-xl border border-[var(--border-subtle)] hover:border-brand-cyan/40 bg-[var(--surface-50)] hover:bg-[var(--surface-100)] transition-all group block text-left shadow-xs active:scale-[0.99]';

                  if (item.isHash) {
                    return (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => scrollToSection(e, item.hashId!)}
                        className={containerClasses}
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={containerClasses}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>

              {/* Developer Utility & Quick Action Console */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                {/* Command Copy Pill */}
                <button
                  onClick={copyCommand}
                  className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all group shadow-xs active:scale-[0.99]"
                  title="Click to copy npx command"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-cyan" />
                    <span>$ npx change-firewall</span>
                  </div>
                  {copied ? (
                    <span className="text-brand-success font-sans text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </span>
                  ) : (
                    <span className="text-[10px] font-sans text-[var(--text-muted)] group-hover:text-[var(--text-primary)] flex items-center gap-1">
                      <Copy className="w-3 h-3" />
                      Copy
                    </span>
                  )}
                </button>

                {/* Theme Selector Pill Inside Menu */}
                <div className="flex items-center p-1 bg-[var(--surface-100)] rounded-xl border border-[var(--border-subtle)] shrink-0 self-stretch sm:self-auto justify-center">
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      theme === 'light'
                        ? 'bg-[var(--surface-main)] text-[var(--text-primary)] shadow-xs font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      theme === 'dark'
                        ? 'bg-[var(--surface-200)] text-[var(--text-primary)] shadow-xs font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Dark</span>
                  </button>
                </div>

                {/* GitHub Repo Link */}
                <a
                  href="https://github.com/himanshYou2003/change-firewall"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-[var(--border-card)] text-xs font-semibold text-[var(--text-primary)] transition-all shadow-xs"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>

                {/* NPM Registry Link */}
                <a
                  href="https://www.npmjs.com/package/change-firewall"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 hover:bg-brand-cyan/20 text-brand-cyan text-xs font-semibold transition-all shadow-xs"
                >
                  <span>v0.1.4</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Keyboard & Touch Hint Footer */}
              <div className="pt-2 text-center sm:text-left flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] opacity-70">
                <span>Change Firewall Engine • Zero Hallucination AST</span>
                <span className="hidden sm:inline">Press Esc or ⌘M to toggle menu</span>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
