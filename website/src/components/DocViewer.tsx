'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DOCS_TREE, DocItem } from '@/lib/docs-data';
import {
  Search,
  Copy,
  Check,
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  GitBranch,
  Terminal,
  Sparkles,
  Sun,
  Moon,
  ExternalLink,
  Code2,
  X,
  Lightbulb,
  AlertTriangle,
  Info,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Target,
  Layers,
  Cpu,
  Layers3,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Rich Inline Formatted Text Renderer supporting bold, italic, inline code, diffs, and colored status chips
function FormattedText({ text }: { text: string }) {
  if (!text) return null;

  // Match tokens:
  // 1. **bold**
  // 2. *italic*
  // 3. `inline-code`
  // 4. (+X / -Y) diff counts
  // 5. Special keywords & mutation tags
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\(\+[0-9]+\s*\/\s*-[0-9]+\)|STEALTH_MUTATION|CONTRACT MUTATION|DEPENDENCY SHIFT|PURE REFACTOR|Exit code [01]|0[–-]100 risk score|under 200ms|< 200ms|100% offline & local execution|100% offline|change-firewall)/g;

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-[var(--text-primary)]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return (
            <em key={i} className="italic text-brand-cyan dark:text-sky-300 font-medium">
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[var(--surface-200)] text-brand-cyan dark:text-sky-300 font-mono text-[12px] font-medium border border-[var(--border-subtle)]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (/^\(\+[0-9]+\s*\/\s*-[0-9]+\)$/.test(part)) {
          const match = part.match(/^\(\+([0-9]+)\s*\/\s*-([0-9]+)\)$/);
          if (match) {
            return (
              <span key={i} className="inline-flex items-center gap-1 mx-1 font-mono text-xs select-none">
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  +{match[1]}
                </span>
                <span className="text-[var(--text-muted)]">/</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30">
                  -{match[2]}
                </span>
              </span>
            );
          }
        }
        if (part === 'STEALTH_MUTATION') {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs"
            >
              🚨 STEALTH_MUTATION
            </span>
          );
        }
        if (part === 'CONTRACT MUTATION') {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs"
            >
              ⚠️ CONTRACT MUTATION
            </span>
          );
        }
        if (part === 'DEPENDENCY SHIFT') {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-xs"
            >
              📦 DEPENDENCY SHIFT
            </span>
          );
        }
        if (part === 'PURE REFACTOR') {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs"
            >
              ✨ PURE REFACTOR
            </span>
          );
        }
        if (part === 'Exit code 0') {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            >
              ✓ Exit Code 0
            </span>
          );
        }
        if (part === 'Exit code 1') {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
            >
              ✕ Exit Code 1
            </span>
          );
        }
        if (/0[–-]100 risk score/i.test(part)) {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            >
              🎯 0–100 Risk Score
            </span>
          );
        }
        if (/under 200ms|< 200ms/i.test(part)) {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            >
              ⚡ &lt;200ms
            </span>
          );
        }
        if (/100% offline/i.test(part)) {
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md font-mono text-[11px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
            >
              🔒 100% Offline & Local
            </span>
          );
        }
        if (part === 'change-firewall') {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-brand-cyan/15 text-brand-cyan font-mono text-xs font-semibold border border-brand-cyan/25"
            >
              change-firewall
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Modern Admonition Callout Box with Icon, Glow and Highlights
function CalloutBox({
  callout,
}: {
  callout: { type: 'tip' | 'warning' | 'info'; text: string };
}) {
  const isWarning = callout.type === 'warning';
  const isTip = callout.type === 'tip';

  return (
    <div
      className={`relative rounded-2xl p-5 my-6 border shadow-sm transition-all duration-200 overflow-hidden ${
        isWarning
          ? 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30 border-l-4 border-l-rose-500'
          : isTip
          ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 border-l-4 border-l-emerald-500'
          : 'bg-gradient-to-r from-brand-cyan/10 via-brand-cyan/5 to-transparent border-brand-cyan/30 border-l-4 border-l-brand-cyan'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isWarning
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
              : isTip
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-brand-cyan/20 text-brand-cyan'
          }`}
        >
          {isWarning ? (
            <AlertTriangle className="w-5 h-5" />
          ) : isTip ? (
            <Lightbulb className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isWarning
                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  : isTip
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-brand-cyan/20 text-brand-cyan'
              }`}
            >
              {isWarning
                ? '⚠️ Critical Behavioral Warning'
                : isTip
                ? '💡 Pro Tip & Best Practice'
                : 'ℹ️ Why Use This Command?'}
            </span>
          </div>
          <div className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] font-medium">
            <FormattedText text={callout.text} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern macOS Terminal Code Window with Syntax Highlighting & Line Copy
function CodeSnippetBox({
  code,
  language = 'bash',
  onCopyAll,
  isCopied,
}: {
  code: string;
  language?: string;
  onCopyAll: () => void;
  isCopied: boolean;
}) {
  const [copiedLine, setCopiedLine] = useState<number | null>(null);

  const copySingleLine = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedLine(idx);
    setTimeout(() => setCopiedLine(null), 1800);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-8 rounded-2xl border border-[var(--border-card)] overflow-hidden shadow-lg bg-[#0a0d14] text-slate-100">
      {/* Terminal Window Chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121722] border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-2">
          {/* macOS 3 dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
          <span className="text-xs font-mono text-slate-400 font-medium">
            {language === 'bash' ? 'terminal — zsh' : `${language} snippet`}
          </span>
        </div>

        <button
          onClick={onCopyAll}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-brand-cyan hover:text-white transition-all border border-slate-700/80 shadow-xs"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto space-y-1">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Step header or comment
          if (trimmed.startsWith('#')) {
            const stepMatch = trimmed.match(/^#\s*(\d+)\.\s*(.*)/);
            if (stepMatch) {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 pt-3 pb-1 first:pt-0 border-t border-slate-800/60 first:border-t-0 text-xs font-mono"
                >
                  <span className="px-1.5 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan font-bold text-[10px] tracking-wider">
                    {stepMatch[1].padStart(2, '0')}
                  </span>
                  <span className="text-slate-300 italic font-medium">
                    {stepMatch[2]}
                  </span>
                </div>
              );
            }
            return (
              <div key={idx} className="text-slate-500 italic py-0.5 text-xs">
                {line}
              </div>
            );
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Executable command line
          const isCommand = language === 'bash';
          return (
            <div
              key={idx}
              className="group/line flex items-center justify-between py-1 px-2 -mx-2 rounded-md hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2 overflow-x-auto">
                {isCommand && (
                  <span className="text-emerald-400 font-bold select-none">$</span>
                )}
                <span>
                  {/* Highlight flags like --open, --staged, etc. */}
                  {line.split(/(\s--?[a-zA-Z0-9_-]+(?:=[^\s]+)?)/).map((chunk, cIdx) => {
                    if (chunk.startsWith(' -') || chunk.startsWith('--')) {
                      return (
                        <span key={cIdx} className="text-amber-300 font-medium">
                          {chunk}
                        </span>
                      );
                    }
                    if (chunk.includes('npx change-firewall')) {
                      return (
                        <span key={cIdx} className="text-white font-bold">
                          {chunk}
                        </span>
                      );
                    }
                    return <span key={cIdx} className="text-slate-200">{chunk}</span>;
                  })}
                </span>
              </div>

              {isCommand && (
                <button
                  onClick={() => copySingleLine(trimmed, idx)}
                  title="Copy command"
                  className="opacity-0 group-hover/line:opacity-100 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1 shrink-0 ml-2"
                >
                  {copiedLine === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="px-4 py-2 bg-[#121722]/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local execution · &lt;200ms latency</span>
        </span>
        <span className="text-slate-500">Zero token costs</span>
      </div>
    </div>
  );
}

// Executive Specification / Key Capability Cards (Converted from Bullet Points)
function SpecificationCards({ points }: { points: string[] }) {
  if (!points || points.length === 0) return null;

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-brand-cyan" />
        <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Key Capabilities & Specifications
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {points.map((bp, i) => {
          // Parse "Title: Description" or standalone bullet
          const colonIdx = bp.indexOf(':');
          const hasColon = colonIdx > 0 && colonIdx < 65;
          const title = hasColon ? bp.slice(0, colonIdx).trim() : null;
          const description = hasColon ? bp.slice(colonIdx + 1).trim() : bp;

          // Choose contextual emoji
          let emoji = '✦';
          let accentColor = 'border-brand-cyan/30 text-brand-cyan bg-brand-cyan/10';

          const lower = bp.toLowerCase();
          if (lower.includes('risk score') || lower.includes('score')) {
            emoji = '🎯';
            accentColor = 'border-amber-500/30 text-amber-500 bg-amber-500/10';
          } else if (lower.includes('mutation') || lower.includes('behavioral')) {
            emoji = '🧬';
            accentColor = 'border-purple-500/30 text-purple-500 bg-purple-500/10';
          } else if (lower.includes('blast radius') || lower.includes('caller')) {
            emoji = '💥';
            accentColor = 'border-rose-500/30 text-rose-500 bg-rose-500/10';
          } else if (lower.includes('offline') || lower.includes('telemetry') || lower.includes('local')) {
            emoji = '🛡️';
            accentColor = 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10';
          } else if (lower.includes('exit code 0') || lower.includes('safe')) {
            emoji = '🟢';
            accentColor = 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10';
          } else if (lower.includes('exit code 1') || lower.includes('blocked') || lower.includes('fail')) {
            emoji = '🔴';
            accentColor = 'border-rose-500/30 text-rose-500 bg-rose-500/10';
          } else if (lower.includes('best practice') || lower.includes('tip')) {
            emoji = '💡';
            accentColor = 'border-amber-500/30 text-amber-500 bg-amber-500/10';
          } else if (lower.includes('compiler') || lower.includes('ast') || lower.includes('fast')) {
            emoji = '⚡';
            accentColor = 'border-cyan-500/30 text-cyan-500 bg-cyan-500/10';
          }

          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-[var(--surface-100)]/70 hover:bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 transition-all shadow-xs flex items-start gap-3.5 group"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm border shadow-2xs ${accentColor}`}
              >
                <span>{emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] mb-1 group-hover:text-brand-cyan transition-colors">
                    {title}
                  </h4>
                )}
                <div className="text-xs sm:text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  <FormattedText text={description} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Reference Matrix & Table with Keyboard Keycaps (<kbd>) and Status Chips
function TableMatrix({
  table,
}: {
  table: { headers: string[]; rows: string[][] };
}) {
  return (
    <div className="my-8 rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-sm bg-[var(--surface-50)]">
      <div className="px-4 py-3 bg-[var(--surface-100)] border-b border-[var(--border-subtle)] flex items-center gap-2">
        <Layers className="w-4 h-4 text-brand-cyan" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Reference Matrix & Behavior Specs
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[var(--surface-100)]/80 text-[var(--text-primary)] border-b border-[var(--border-subtle)] font-mono text-[11px] uppercase tracking-wider">
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} className="py-3 px-4 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {table.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[var(--surface-100)]/70 transition-colors">
                {row.map((cell, cIdx) => {
                  const isShortcutColumn = cIdx === 0 && table.headers[0].toLowerCase().includes('key');
                  const isVerdict = cell.includes('ALIGNED') || cell.includes('DRIFT') || cell.includes('MUTATION');

                  return (
                    <td key={cIdx} className="py-3 px-4 text-[var(--text-secondary)] leading-relaxed">
                      {isShortcutColumn ? (
                        <div className="flex flex-wrap items-center gap-1.5 font-mono">
                          {cell.split(/(\sor\s|\s\/\s)/).map((segment, sIdx) => {
                            if (segment === ' or ' || segment === ' / ') {
                              return (
                                <span key={sIdx} className="text-[var(--text-muted)] text-[10px]">
                                  {segment.trim()}
                                </span>
                              );
                            }
                            return (
                              <kbd
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-[var(--surface-200)] border border-[var(--border-card)] shadow-xs text-xs font-bold text-brand-cyan"
                              >
                                {segment.trim()}
                              </kbd>
                            );
                          })}
                        </div>
                      ) : isVerdict ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs font-bold border ${
                            cell.includes('ALIGNED')
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : cell.includes('MINOR_DRIFT')
                              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
                              : cell.includes('HIGH_DRIFT')
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {cell}
                        </span>
                      ) : (
                        <FormattedText text={cell} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DocViewer() {
  const { theme, toggleTheme } = useTheme();

  // Flat list of all documents
  const allFiles = useMemo(() => {
    return DOCS_TREE.flatMap((f) => f.files);
  }, []);

  const [selectedId, setSelectedId] = useState<string>('why-change-firewall');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);

  const selectFile = (fileId: string) => {
    setSelectedId(fileId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);

  // Folders expand/collapse state (all open by default)
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    DOCS_TREE.forEach((folder) => {
      initial[folder.id] = true;
    });
    return initial;
  });

  // Auto-close navigator on mobile & tablet portrait screens initially
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);



  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    DOCS_TREE.forEach((f) => {
      allOpen[f.id] = true;
    });
    setOpenFolders(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    DOCS_TREE.forEach((f) => {
      allClosed[f.id] = false;
    });
    setOpenFolders(allClosed);
  };

  // Filtered folders by search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_TREE;
    const q = searchQuery.toLowerCase();

    return DOCS_TREE.map((folder) => {
      const matchingFiles = folder.files.filter(
        (file) =>
          file.title.toLowerCase().includes(q) ||
          file.description.toLowerCase().includes(q) ||
          file.fileName.toLowerCase().includes(q) ||
          (file.badge && file.badge.toLowerCase().includes(q))
      );
      return {
        ...folder,
        files: matchingFiles,
      };
    }).filter((folder) => folder.files.length > 0);
  }, [searchQuery]);

  // Current selected document
  const activeDoc = useMemo(() => {
    return allFiles.find((f) => f.id === selectedId) || allFiles[0];
  }, [allFiles, selectedId]);

  // Previous and Next document
  const prevDoc = useMemo(() => {
    if (!activeDoc.content.prevDocId) return null;
    return allFiles.find((f) => f.id === activeDoc.content.prevDocId) || null;
  }, [allFiles, activeDoc]);

  const nextDoc = useMemo(() => {
    if (!activeDoc.content.nextDocId) return null;
    return allFiles.find((f) => f.id === activeDoc.content.nextDocId) || null;
  }, [allFiles, activeDoc]);

  // Dynamic Gutter line numbers calculated strictly from actual article content height
  const articleRef = useRef<HTMLElement>(null);
  const [lineCount, setLineCount] = useState<number>(1);

  useEffect(() => {
    if (!articleRef.current) return;

    const updateLineCount = () => {
      if (articleRef.current) {
        // Line height is 28px (h-7 / leading-7). Article has py-8 (32px * 2 = 64px).
        const contentHeight = Math.max(articleRef.current.scrollHeight, articleRef.current.offsetHeight);
        const lines = Math.max(1, Math.round((contentHeight - 64) / 28));
        setLineCount(lines);
      }
    };

    updateLineCount();

    const rafId = requestAnimationFrame(updateLineCount);

    const observer = new ResizeObserver(() => {
      updateLineCount();
    });

    observer.observe(articleRef.current);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [selectedId, activeDoc]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyFilePath = () => {
    navigator.clipboard.writeText(`docs/${activeDoc.folderId}/${activeDoc.fileName}`);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div
      className={`w-full h-full m-0 p-0 transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[var(--bg-main)] flex flex-col'
          : 'flex-1 flex flex-col overflow-hidden'
      }`}
    >
      {/* macOS Xcode Window Container touching all edges: 0 margin, 0 padding */}
      <div className="w-full h-full flex flex-col flex-1 min-h-0 bg-[var(--surface-main)] border-b border-[var(--border-subtle)] overflow-hidden">
        {/* macOS Xcode Window Header Bar */}
        <div className="h-11 px-4 bg-[var(--surface-100)] border-b border-[var(--border-subtle)] flex items-center justify-between select-none shrink-0">
          {/* Left: Traffic lights */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 group/lights mr-3">
              <button
                onClick={() => isFullscreen && setIsFullscreen(false)}
                title="Toggle Fullscreen"
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover/lights:opacity-100 leading-none">✕</span>
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Toggle Navigator Sidebar"
                className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="text-[8px] font-bold text-black/60 opacity-0 group-hover/lights:opacity-100 leading-none">—</span>
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen'}
                className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="text-[7px] font-bold text-black/60 opacity-0 group-hover/lights:opacity-100 leading-none">⛶</span>
              </button>
            </div>

            {/* Sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-[var(--surface-200)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Toggle Navigator Sidebar"
            >
              {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            </button>

            {/* Line numbers toggle */}
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors hidden sm:flex items-center gap-1 ${
                showLineNumbers
                  ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30'
                  : 'hover:bg-[var(--surface-200)] text-[var(--text-muted)]'
              }`}
              title="Toggle Editor Line Numbers"
            >
              <Code2 className="w-3 h-3" />
              <span>Gutter</span>
            </button>
          </div>

          {/* Center: Xcode Project Header & Git Status */}
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)] hidden sm:inline">
              Change-Firewall
            </span>
            <span className="text-[var(--text-muted)] hidden sm:inline">—</span>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-200)] text-[var(--text-muted)]">
              <GitBranch className="w-3 h-3 text-brand-cyan" />
              <span>main</span>
            </span>
            <span className="text-[11px] text-brand-cyan font-mono truncate max-w-[180px] sm:max-w-none">
              {activeDoc.fileName}
            </span>
          </div>

          {/* Right: Quick Toolbar Tools */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle in Xcode Bar */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-200)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Switch Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--surface-200)] hover:bg-[var(--surface-300)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1"
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span className="hidden sm:inline text-[10px]">Exit</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline text-[10px]">Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Xcode Main Workspace Body - Edge to Edge */}
        <div className="relative flex-1 min-h-0 flex overflow-hidden">
          {/* Mobile & Tablet Portrait Backdrop Overlay */}
          {sidebarOpen && (
            <div
              className="absolute inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Left Sidebar: Xcode / VS Code Style Project Explorer touching the left edge */}
          {sidebarOpen && (
            <aside className="absolute lg:static inset-y-0 left-0 z-40 w-72 sm:w-80 h-full border-r border-[var(--border-subtle)] bg-[var(--surface-50)] flex flex-col shrink-0 select-none overflow-hidden shadow-2xl lg:shadow-none">
              {/* Explorer Header */}
              <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  Project Navigator
                </span>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
                  <button
                    onClick={expandAll}
                    className="hover:text-[var(--text-primary)] px-1 py-0.5 rounded hover:bg-[var(--surface-200)]"
                  >
                    +All
                  </button>
                  <span>|</span>
                  <button
                    onClick={collapseAll}
                    className="hover:text-[var(--text-primary)] px-1 py-0.5 rounded hover:bg-[var(--surface-200)]"
                  >
                    -All
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden ml-1 p-1 rounded hover:bg-[var(--surface-200)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    aria-label="Close Project Navigator"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Search Filter Box */}
              <div className="p-2 border-b border-[var(--border-subtle)]">
                <div className="relative">
                  <Search className="w-3 h-3 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter files (⌘P)..."
                    className="w-full pl-7 pr-2.5 py-1 bg-[var(--surface-100)] border border-[var(--border-subtle)] focus:border-brand-cyan rounded-md text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Tree View Structure */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-xs">
                <div className="px-2 py-1 flex items-center gap-2 text-[11px] font-bold text-[var(--text-primary)]">
                  <div className="w-4 h-4 rounded overflow-hidden border border-orange-500/20 dark:border-orange-500/40 bg-orange-500/[0.08] dark:bg-black flex items-center justify-center shrink-0 transition-colors">
                    <Image src="/logo.png" alt="Logo" width={16} height={16} className="w-full h-full object-cover" />
                  </div>
                  <span>CHANGE-FIREWALL</span>
                </div>

                {filteredTree.map((folder) => {
                  const isOpen = searchQuery ? true : !!openFolders[folder.id];

                  return (
                    <div key={folder.id} className="space-y-0.5">
                      {/* Folder Item */}
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-[var(--surface-100)] transition-colors flex items-center justify-between text-[var(--text-primary)] group"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isOpen ? (
                            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                          )}
                          {isOpen ? (
                            <FolderOpen className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-brand-cyan/80 shrink-0" />
                          )}
                          <span className="font-semibold text-[11px] truncate">
                            {folder.title}
                          </span>
                        </div>

                        {/* File count */}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-200)] text-[var(--text-muted)] shrink-0 ml-1.5 font-mono">
                          {folder.files.length}
                        </span>
                      </button>

                      {/* File Children in Folder with Tree Lines */}
                      {isOpen && (
                        <div className="pl-4 space-y-0.5 relative">
                          {folder.files.map((file, fIdx) => {
                            const isSelected = file.id === selectedId;
                            const isLast = fIdx === folder.files.length - 1;

                            return (
                              <button
                                key={file.id}
                                onClick={() => selectFile(file.id)}
                                className={`w-full text-left px-2 py-1 rounded text-xs transition-all flex items-center justify-between group ${
                                  isSelected
                                    ? 'bg-brand-cyan/15 text-brand-cyan font-medium shadow-sm border-l-2 border-brand-cyan'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)]'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {/* Visual tree branch connector */}
                                  <span className="text-[var(--text-muted)] opacity-60 font-mono text-[10px]">
                                    {isLast ? '└─' : '├─'}
                                  </span>
                                  <FileText
                                    className={`w-3 h-3 shrink-0 ${
                                      isSelected ? 'text-brand-cyan' : 'text-[var(--text-muted)]'
                                    }`}
                                  />
                                  <span className="truncate text-[11px]">{file.fileName}</span>
                                </div>

                                {/* Custom Badge */}
                                {file.badge && (
                                  <span
                                    className={`text-[9px] font-sans px-1.5 py-0.2 rounded shrink-0 ml-1.5 font-medium ${
                                      isSelected
                                        ? 'bg-brand-cyan/20 text-brand-cyan'
                                        : 'bg-[var(--surface-200)] text-[var(--text-muted)]'
                                    }`}
                                  >
                                    {file.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigator Bottom Bar */}
              <div className="p-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono flex items-center justify-between bg-[var(--surface-100)]">
                <span>{allFiles.length} documentation files</span>
                <span className="text-brand-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                  Synced
                </span>
              </div>
            </aside>
          )}

          {/* Right Editor Area - Edge to Edge */}
          <main className="flex-1 min-h-0 flex flex-col bg-[var(--surface-main)] overflow-hidden">
            {/* Xcode Editor Tab Bar */}
            <div className="h-9 bg-[var(--surface-100)]/70 border-b border-[var(--border-subtle)] flex items-center justify-between px-3 shrink-0 select-none overflow-x-auto">
              <div className="flex items-center gap-1">
                <div className="px-3 py-1 bg-[var(--surface-main)] border-r border-l border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] flex items-center gap-2 rounded-t shadow-sm">
                  <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                  <span className="font-semibold">{activeDoc.fileName}</span>
                  <span className="text-[10px] text-[var(--text-muted)] opacity-60">●</span>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={copyFilePath}
                  className="px-2 py-0.5 rounded text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-200)] transition-colors flex items-center gap-1"
                  title="Copy Document Relative Path"
                >
                  {copiedPath ? (
                    <>
                      <Check className="w-3 h-3 text-brand-success" />
                      <span className="text-brand-success">Path Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Path</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Xcode Breadcrumbs Ribbon */}
            <div className="px-3 sm:px-5 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface-50)] text-xs font-mono text-[var(--text-muted)] flex items-center gap-2 shrink-0 overflow-x-auto whitespace-nowrap">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-1 p-1 rounded hover:bg-[var(--surface-200)] text-brand-cyan shrink-0"
                title="Open Project Navigator"
                aria-label="Open Project Navigator"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
              <span className="text-brand-cyan">Change-Firewall</span>
              <span>›</span>
              <span>docs</span>
              <span>›</span>
              <span>{activeDoc.folderTitle}</span>
              <span>›</span>
              <span className="text-[var(--text-primary)] font-semibold">{activeDoc.fileName}</span>

              <div className="ml-auto flex items-center gap-1 text-[11px] shrink-0 pl-2">
                <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                <span>{activeDoc.readingTime}</span>
              </div>
            </div>

            {/* Document Content with Optional Line Numbers */}
            <div className="flex-1 min-h-0 overflow-y-auto flex w-full">
              {/* Optional Line Numbers Column - Dynamically scaled to match content */}
              {showLineNumbers && (
                <div className="w-10 sm:w-12 py-8 bg-[var(--surface-50)] border-r border-[var(--border-subtle)] select-none text-right pr-2.5 font-mono text-xs text-[var(--text-muted)] opacity-40 shrink-0 hidden sm:block">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className="h-7 leading-7">
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}

              {/* Article View - Full Screen Right with synchronized vertical padding */}
              <article
                ref={articleRef}
                className="flex-1 min-w-0 py-8 px-4 sm:px-8 md:px-10 lg:px-12 w-full max-w-none"
              >
                {/* Article Header */}
                <div className="border-b border-[var(--border-subtle)] pb-6 mb-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center gap-1.5">
                      <Folder className="w-3 h-3 text-brand-cyan" />
                      <span>{activeDoc.folderTitle}</span>
                    </span>
                    {activeDoc.badge && (
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{activeDoc.badge}</span>
                      </span>
                    )}
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>100% Deterministic</span>
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      <span>{activeDoc.readingTime}</span>
                    </span>
                  </div>

                  {/* Document Title with command badge */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight flex flex-wrap items-center gap-3">
                    <span>{activeDoc.title.replace(/\s*\([^)]+\)/, '')}</span>
                    {activeDoc.title.includes('(') && (
                      <span className="text-sm sm:text-base font-mono font-bold px-3 py-1 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
                        {activeDoc.title.match(/\(([^)]+)\)/)?.[1] || ''}
                      </span>
                    )}
                  </h1>

                  {/* Lead Description */}
                  <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-3 leading-relaxed font-normal">
                    {activeDoc.description}
                  </p>
                </div>

                {/* Article Content Body */}
                <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {/* Executive Overview Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-100)]/50 border border-[var(--border-subtle)] text-sm sm:text-base text-[var(--text-primary)] leading-relaxed shadow-xs">
                    <div className="flex items-center gap-2 mb-2.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-cyan">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Executive Overview</span>
                    </div>
                    <p className="leading-relaxed">
                      <FormattedText text={activeDoc.content.overview} />
                    </p>
                  </div>

                  {/* Callout Box (Admonition) */}
                  {activeDoc.content.callout && (
                    <CalloutBox callout={activeDoc.content.callout} />
                  )}

                  {/* Code Example Box (macOS Terminal Style) */}
                  {activeDoc.content.codeExample && (
                    <CodeSnippetBox
                      code={activeDoc.content.codeExample}
                      language={activeDoc.content.codeLanguage || 'bash'}
                      onCopyAll={() => copyCode(activeDoc.content.codeExample || '')}
                      isCopied={copied}
                    />
                  )}

                  {/* Comparison / Reference Table */}
                  {activeDoc.content.table && (
                    <TableMatrix table={activeDoc.content.table} />
                  )}

                  {/* Executive Specification / Capability Cards */}
                  {activeDoc.content.bulletPoints && (
                    <SpecificationCards points={activeDoc.content.bulletPoints} />
                  )}
                </div>

                {/* Bottom Navigation Cards */}
                <div className="mt-14 pt-6 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prevDoc ? (
                    <button
                      onClick={() => setSelectedId(prevDoc.id)}
                      className="p-4 rounded-xl bg-[var(--surface-100)]/80 hover:bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-left transition-all flex items-center gap-3 group shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4 text-brand-cyan group-hover:-translate-x-1 transition-transform" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-mono">
                          Previous Article
                        </span>
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate block">
                          {prevDoc.title}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextDoc ? (
                    <button
                      onClick={() => setSelectedId(nextDoc.id)}
                      className="p-4 rounded-xl bg-[var(--surface-100)]/80 hover:bg-[var(--surface-100)] border border-[var(--border-subtle)] hover:border-brand-cyan/40 text-right transition-all flex items-center justify-end gap-3 group shadow-sm"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-mono">
                          Next Article
                        </span>
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate block">
                          {nextDoc.title}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-cyan group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              </article>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
