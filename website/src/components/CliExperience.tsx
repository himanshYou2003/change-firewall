'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, BookOpen, Command, Terminal } from 'lucide-react';
import { commandGroups } from '@/lib/playground/commands';
import { useTheme } from '@/components/ThemeProvider';

const FormulaStream = dynamic(() => import('@/components/originkit/ui/formula-stream'), {
  ssr: false,
});

export default function CliExperience() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [family, setFamily] = useState('Analyze');
  const commands = commandGroups[family] || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const tryCommand = (command: string) => {
    const target = document.getElementById('playground') || document.getElementById('simulator');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.dispatchEvent(new CustomEvent('change-firewall:playground-command', { detail: { command } }));
  };

  return (
    <section id="cli" className="py-16 sm:py-24 relative bg-[var(--surface-50)]/50 border-y border-[var(--border-subtle)] overflow-hidden scroll-mt-[68px]">
      {/* Background Formula Stream with Low Opacity & Live Global Hover */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-25 dark:opacity-30 z-0 overflow-hidden">
        {mounted && (
          <FormulaStream
            background="transparent"
            textColor={isDark ? 'rgba(248, 250, 252, 0.45)' : 'rgba(24, 21, 18, 0.35)'}
            accent={isDark ? '#38bdf8' : '#ff5c26'}
            density={16}
            speed={50}
            curve={35}
            gap={90}
            hover={160}
            reach={260}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
              backgroundColor: 'transparent',
            }}
          />
        )}
      </div>

      <div className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-9">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[11px] font-mono font-semibold text-brand-cyan mb-3">
            <Command className="w-3.5 h-3.5" /> COMPLETE COMMAND GUIDE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Learn the CLI through real runs
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Each example fills editable text in the playground terminal. Press Enter to run the installed CLI and read its actual output.
          </p>
        </div>
        <div className="cli-cookbook">
          <nav aria-label="Command families">
            {Object.keys(commandGroups).map((name) => (
              <button
                type="button"
                key={name}
                className={family === name ? 'is-active' : ''}
                onClick={() => setFamily(name)}
              >
                {name}
              </button>
            ))}
          </nav>
          <div className="cli-cookbook-list">
            {commands.map((item) => (
              <article key={item.id}>
                <div>
                  <span>{item.family}</span>
                  <h3>{item.title}</h3>
                  <p>
                    {item.description} {item.note}
                  </p>
                  <code>{item.command}</code>
                </div>
                <button type="button" onClick={() => tryCommand(item.command)}>
                  <Terminal /> Try in playground <ArrowUpRight />
                </button>
              </article>
            ))}
          </div>
        </div>
        <p className="cli-cookbook-footnote">
          <BookOpen /> The installed command’s <code>--help</code> remains the source of truth. The guide never supplies replacement terminal output.
        </p>
      </div>
    </section>
  );
}
