'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Github } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on documentation route so Xcode IDE touches the application edge completely
  if (pathname?.startsWith('/docs')) {
    return null;
  }

  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-main)] py-12 relative z-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--surface-100)] border border-[var(--border-subtle)] flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-brand-cyan" />
          </div>
          <span className="font-bold text-[var(--text-primary)] tracking-tight">Change Firewall</span>
          <span className="opacity-40">|</span>
          <span>MIT Licensed & Open Source</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/docs" className="hover:text-[var(--text-primary)] transition-colors">
            Documentation & Architecture
          </Link>
          <a
            href="https://www.npmjs.com/package/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            NPM Package v0.1.4
          </a>
          <a
            href="https://github.com/himanshYou2003/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <span>Crafted by</span>
          <span className="text-[var(--text-primary)] font-semibold">Himanshu</span>
          <span>• 2026</span>
        </div>
      </div>
    </footer>
  );
}
