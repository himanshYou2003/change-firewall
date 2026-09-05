'use client';

import React, { useState, useMemo } from 'react';
import { DOCS_DATA, DOC_CATEGORIES, DocSection } from '@/lib/docs-data';
import { Search, Copy, Check, Terminal, BookOpen, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function DocViewer() {
  const [selectedId, setSelectedId] = useState<string>(DOCS_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return DOCS_DATA;
    const q = searchQuery.toLowerCase();
    return DOCS_DATA.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeDoc = useMemo(() => {
    return DOCS_DATA.find((d) => d.id === selectedId) || DOCS_DATA[0];
  }, [selectedId]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-white/10 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          {/* Search bar */}
          <div className="relative mb-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-9 pr-3.5 py-2 bg-surface-100 border border-white/10 focus:border-brand-cyan rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan/30 transition-all font-sans"
            />
          </div>

          {/* Grouped by category */}
          <div className="space-y-6">
            {DOC_CATEGORIES.map((cat) => {
              const catSections = filteredSections.filter((s) => s.category === cat);
              if (catSections.length === 0) return null;

              return (
                <div key={cat}>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-cyan/80 px-2 mb-2">
                    {cat}
                  </h4>
                  <div className="space-y-1">
                    {catSections.map((item) => {
                      const isActive = item.id === selectedId;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                            isActive
                              ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0 ml-2">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Documentation Viewer Content */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 sm:p-10 border border-white/10 min-h-[500px]">
          {/* Header */}
          <div className="border-b border-white/[0.08] pb-6 mb-8">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-brand-cyan">
              <span>{activeDoc.category}</span>
              {activeDoc.badge && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/20">
                    {activeDoc.badge}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeDoc.title}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {activeDoc.description}
            </p>
          </div>

          {/* Overview text */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
            <p>{activeDoc.content.overview}</p>

            {/* Callout alert if present */}
            {activeDoc.content.callout && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 my-5 ${
                  activeDoc.content.callout.type === 'warning'
                    ? 'bg-brand-danger/10 border-brand-danger/30 text-rose-200'
                    : 'bg-brand-cyan/10 border-brand-cyan/30 text-cyan-200'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{activeDoc.content.callout.text}</span>
              </div>
            )}

            {/* Code example if present */}
            {activeDoc.content.codeExample && (
              <div className="my-6 rounded-xl border border-white/10 overflow-hidden bg-[#090d15]">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-100 border-b border-white/[0.06] text-xs font-mono text-slate-400">
                  <span className="uppercase">{activeDoc.content.codeLanguage || 'bash'}</span>
                  <button
                    onClick={() => copyCode(activeDoc.content.codeExample || '')}
                    className="flex items-center gap-1.5 text-xs text-brand-cyan hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-brand-success" />
                        <span className="text-brand-success">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{activeDoc.content.codeExample}</code>
                </pre>
              </div>
            )}

            {/* Comparison Table if present */}
            {activeDoc.content.table && (
              <div className="my-6 overflow-x-auto">
                <table className="w-full text-left text-xs border border-white/10 rounded-xl overflow-hidden">
                  <thead className="bg-surface-100 text-slate-200 border-b border-white/10">
                    <tr>
                      {activeDoc.content.table.headers.map((h, i) => (
                        <th key={i} className="py-3 px-4 font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] bg-black/20 font-sans">
                    {activeDoc.content.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.02]">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-3 px-4 text-slate-300 whitespace-pre-line leading-relaxed">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bullet points if present */}
            {activeDoc.content.bulletPoints && (
              <ul className="space-y-2 mt-4 text-xs">
                {activeDoc.content.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
