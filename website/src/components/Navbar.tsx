'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isDocs = pathname?.startsWith('/docs');

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/90 backdrop-blur-xl transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Official Fire Shield Icon */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-orange-500/20 border border-orange-500/30 group-hover:scale-105 transition-transform bg-black flex items-center justify-center">
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
            <span className="ml-2 text-[10px] sm:text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
              v0.1.4
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[var(--text-secondary)]">
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
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            MCP Integration
          </a>
          <Link
            href="/docs"
            className={`flex items-center gap-1.5 font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-all ${
              isDocs
                ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 shadow-sm'
                : 'hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Docs & Architecture</span>
          </Link>
        </nav>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark / Light Theme Toggle */}
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

          {/* Quick Copy Command (Desktop) */}
          <button
            onClick={copyCommand}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
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

          {/* NPM Badge Button */}
          <a
            href="https://www.npmjs.com/package/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 transition-all shadow-sm"
          >
            NPM Package
          </a>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-main)]/95 backdrop-blur-2xl px-4 py-5 space-y-3">
          <a
            href={isDocs ? '/#simulator' : '#simulator'}
            onClick={(e) => scrollToSection(e, 'simulator')}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)] transition-all"
          >
            Interactive Trailer
          </a>
          <a
            href={isDocs ? '/#superpowers' : '#superpowers'}
            onClick={(e) => scrollToSection(e, 'superpowers')}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)] transition-all"
          >
            Superpowers
          </a>
          <a
            href={isDocs ? '/#mcp-hub' : '#mcp-hub'}
            onClick={(e) => scrollToSection(e, 'mcp-hub')}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)] transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>MCP Integration</span>
          </a>
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              isDocs
                ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30'
                : 'text-[var(--text-primary)] hover:bg-[var(--surface-100)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Docs & Architecture</span>
          </Link>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <button
              onClick={copyCommand}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
              <span>npx change-firewall</span>
              {copied && <Check className="w-3.5 h-3.5 text-brand-success" />}
            </button>

            <a
              href="https://www.npmjs.com/package/change-firewall"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 text-center"
            >
              NPM
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
