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
      title: 'Interactive Trailer',
      href: isDocs ? '/#simulator' : '#simulator',
      isHash: true,
      hashId: 'simulator',
    },
    {
      title: 'Superpowers',
      href: isDocs ? '/#superpowers' : '#superpowers',
      isHash: true,
      hashId: 'superpowers',
    },
    {
      title: 'MCP Integration',
      href: isDocs ? '/#mcp-hub' : '#mcp-hub',
      isHash: true,
      hashId: 'mcp-hub',
    },
    {
      title: 'Docs & Architecture',
      href: '/docs',
      isHash: false,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-main)] transition-colors duration-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Fire Shield Icon */}
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
            <span className="ml-2 text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[var(--surface-100)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              v0.1.4
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Large Desktops >= 1280px) */}
        <nav className="hidden xl:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[var(--text-secondary)]">
          <a
            href={isDocs ? '/#simulator' : '#simulator'}
            onClick={(e) => scrollToSection(e, 'simulator')}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Interactive Trailer
          </a>
          <a
            href={isDocs ? '/#superpowers' : '#superpowers'}
            onClick={(e) => scrollToSection(e, 'superpowers')}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Superpowers
          </a>
          <a
            href={isDocs ? '/#mcp-hub' : '#mcp-hub'}
            onClick={(e) => scrollToSection(e, 'mcp-hub')}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            MCP Integration
          </a>
          <Link
            href="/docs"
            className={`font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-all ${
              isDocs
                ? 'bg-[var(--surface-100)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                : 'hover:text-[var(--text-primary)]'
            }`}
          >
            Docs & Architecture
          </Link>
        </nav>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Copy Command (Desktop >= 1024px) */}
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

          {/* Clean Menu Toggle Button (< 1280px, iPad Mini / Air & Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-xs"
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

      {/* Clean Minimal Menu for Mobile & Tablets (No Card UI) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-40 xl:hidden animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Clean Menu Container with Solid Background */}
          <div className="fixed top-16 inset-x-0 z-50 bg-[var(--bg-main)] border-b border-[var(--border-subtle)] shadow-xl xl:hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="max-w-4xl mx-auto px-5 sm:px-8 py-6 space-y-4">
              {/* Minimal Nav List (No Cards) */}
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

              {/* Minimal Bottom Utility Row */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)]">
                {/* Command Line Copier */}
                <button
                  onClick={copyCommand}
                  className="flex items-center gap-2 hover:text-[var(--text-primary)] transition-colors text-left"
                  title="Click to copy quick start command"
                >
                  <Terminal className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                  <span>npx change-firewall</span>
                  {copied ? (
                    <span className="text-brand-success font-sans font-semibold text-[11px] ml-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Copied!
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 text-[var(--text-muted)] opacity-60" />
                  )}
                </button>

                {/* Minimal Clean Text Links */}
                <div className="flex items-center gap-5 font-sans text-xs">
                  <a
                    href="https://github.com/himanshYou2003/change-firewall"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.npmjs.com/package/change-firewall"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    NPM Package
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
