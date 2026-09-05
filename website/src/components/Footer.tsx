'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Github, Heart, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#05070a] py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-surface-100 border border-white/10 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-brand-cyan" />
          </div>
          <span className="font-bold text-white tracking-tight">Change Firewall</span>
          <span className="text-slate-600">|</span>
          <span>MIT Licensed & Open Source</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/docs" className="hover:text-white transition-colors">
            Documentation
          </Link>
          <a
            href="https://www.npmjs.com/package/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            NPM Registry
          </a>
          <a
            href="https://github.com/himanshYou2003/change-firewall"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Created by</span>
          <span className="text-slate-300 font-semibold">Himanshu</span>
          <span>• 2026</span>
        </div>
      </div>
    </footer>
  );
}
