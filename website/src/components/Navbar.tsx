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
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
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

  // Handle ESC key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scrolling when menu is open on mobile
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
      title: 'Simulator',
      href: isDocs ? '/#simulator' : '#simulator',
      isHash: true,
      hashId: 'simulator',
    },
    {
      title: 'Features',
      href: isDocs ? '/#superpowers' : '#superpowers',
      isHash: true,
      hashId: 'superpowers',
    },
    {
      title: 'MCP',
      href: isDocs ? '/#mcp-hub' : '#mcp-hub',
      isHash: true,
      hashId: 'mcp-hub',
    },
    {
      title: 'Docs',
      href: '/docs',
      isHash: false,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-main)] transition-colors duration-200 shadow-xs backdrop-blur-md">
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Version */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-orange-500/25 dark:border-[var(--border-subtle)] group-hover:border-orange-500/50 transition-colors bg-orange-500/[0.08] dark:bg-black flex items-center justify-center shadow-xs shrink-0">
              <Image
                src="/logo.png"
                alt="Change Firewall Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)] whitespace-nowrap">
              Change Firewall
            </span>
          </Link>
          <a
            href="https://www.npmjs.com/package/change-firewall"
            target="_blank"
            rel="noreferrer"
            title="View package on npm"
            className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[var(--surface-100)] hover:bg-[var(--surface-200)] text-[var(--text-muted)] hover:text-brand-cyan border border-[var(--border-subtle)] transition-colors whitespace-nowrap shrink-0"
          >
            v0.1.8
          </a>
        </div>

        {/* Desktop Navigation Links (Tablets & Desktops >= 768px) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[var(--text-secondary)]">
          {NAV_ITEMS.map((item, idx) => {
            const isDocsLink = item.href === '/docs';
            const activeDocs = isDocsLink && isDocs;

            if (item.isHash) {
              return (
                <a
                  key={idx}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.hashId!)}
                  className="whitespace-nowrap hover:text-[var(--text-primary)] transition-colors py-1"
                >
                  {item.title}
                </a>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href}
                className={`whitespace-nowrap py-1 transition-colors ${
                  activeDocs
                    ? 'text-[var(--text-primary)] font-semibold border-b-2 border-brand-cyan'
                    : 'hover:text-[var(--text-primary)]'
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Copy Command (Desktops >= 1200px) */}
          <button
            onClick={copyCommand}
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-xs group whitespace-nowrap shrink-0"
            title="Click to copy quick start command"
          >
            <Terminal className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            <span className="text-[var(--text-primary)] font-medium">npx change-firewall</span>
            <div className="flex items-center gap-1 pl-2 border-l border-[var(--border-subtle)] text-[11px] font-sans">
              {copied ? (
                <span className="text-brand-success font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Copied
                </span>
              ) : (
                <span className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
                  <Copy className="w-3 h-3 opacity-60" />
                  <span>Copy</span>
                </span>
              )}
            </div>
          </button>

          {/* Beautiful GitHub Link */}
          <a
            href="https://github.com/himanshYou2003/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-[var(--border-card)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-200)] transition-all shadow-xs group shrink-0 whitespace-nowrap"
            aria-label="GitHub Repository"
            title="Star on GitHub"
          >
            <Github className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-200)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              Star
            </span>
          </a>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:scale-105 shadow-xs shrink-0"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Clean Menu Toggle Button (< 768px Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-xs shrink-0"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-brand-cyan" />
            ) : (
              <Menu className="w-4 h-4 text-[var(--text-primary)]" />
            )}
          </button>
        </div>
      </div>

      {/* Clean Minimal Menu for Mobile */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Clean Menu Container with Solid Background */}
          <div className="fixed top-16 inset-x-0 z-50 bg-[var(--bg-main)] border-b border-[var(--border-subtle)] shadow-xl md:hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6 space-y-5">
              {/* Minimal Nav List */}
              <nav className="flex flex-col divide-y divide-[var(--border-subtle)]/70">
                {NAV_ITEMS.map((item, idx) => {
                  const linkContent = (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[var(--text-muted)] opacity-50">
                          0{idx + 1}
                        </span>
                        <span className="text-base sm:text-lg font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
                    </>
                  );

                  const linkClasses =
                    'py-3.5 sm:py-4 flex items-center justify-between group transition-colors';

                  if (item.isHash) {
                    return (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => scrollToSection(e, item.hashId!)}
                        className={linkClasses}
                      >
                        {linkContent}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={linkClasses}
                    >
                      {linkContent}
                    </Link>
                  );
                })}
              </nav>

              {/* Developer Quick Actions Bar */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Copy NPX Pill */}
                <button
                  onClick={copyCommand}
                  className="group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-xs"
                  title="Click to copy quick start command"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-brand-cyan font-bold">$</span>
                    <span className="truncate text-[var(--text-primary)] font-medium">npx change-firewall</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-md bg-[var(--surface-200)] border border-[var(--border-subtle)] text-[11px] font-sans font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-brand-success" />
                        <span className="text-brand-success font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 opacity-60" />
                        <span>Copy</span>
                      </>
                    )}
                  </div>
                </button>

                {/* GitHub & NPM Action Buttons */}
                <div className="flex items-center gap-2.5">
                  {/* GitHub Button */}
                  <a
                    href="https://github.com/himanshYou2003/change-firewall"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-[var(--border-card)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-200)] transition-all shadow-xs group"
                    aria-label="GitHub Repository"
                  >
                    <Github className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                    <span>GitHub</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-200)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      ★ Star
                    </span>
                  </a>

                  {/* NPM Package Button */}
                  <a
                    href="https://www.npmjs.com/package/change-firewall"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-200)] transition-all shadow-xs group"
                  >
                    <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
                      npm
                    </span>
                    <span>v0.1.8</span>
                    <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover:text-brand-cyan transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
