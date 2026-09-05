'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

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
      <div className="w-full h-full flex flex-col bg-[var(--surface-main)] border-b border-[var(--border-subtle)] overflow-hidden">
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
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Xcode / VS Code Style Project Explorer touching the left edge */}
          {sidebarOpen && (
            <aside className="w-72 sm:w-80 border-r border-[var(--border-subtle)] bg-[var(--surface-50)] flex flex-col shrink-0 select-none overflow-hidden">
              {/* Explorer Header */}
              <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  Project Navigator
                </span>

                <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-muted)]">
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
                                onClick={() => setSelectedId(file.id)}
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
          <main className="flex-1 flex flex-col bg-[var(--surface-main)] overflow-hidden">
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
            <div className="px-5 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface-50)] text-xs font-mono text-[var(--text-muted)] flex items-center gap-2 shrink-0">
              <span className="text-brand-cyan">Change-Firewall</span>
              <span>›</span>
              <span>docs</span>
              <span>›</span>
              <span>{activeDoc.folderTitle}</span>
              <span>›</span>
              <span className="text-[var(--text-primary)] font-semibold">{activeDoc.fileName}</span>

              <div className="ml-auto flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                <span>{activeDoc.readingTime}</span>
              </div>
            </div>

            {/* Document Content with Optional Line Numbers */}
            <div className="flex-1 overflow-y-auto flex">
              {/* Optional Line Numbers Column */}
              {showLineNumbers && (
                <div className="w-10 sm:w-12 py-8 bg-[var(--surface-50)] border-r border-[var(--border-subtle)] select-none text-right pr-2.5 font-mono text-xs text-[var(--text-muted)] opacity-40 shrink-0 hidden sm:block">
                  {Array.from({ length: 60 }, (_, i) => (
                    <div key={i} className="leading-7">
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}

              {/* Article View */}
              <article className="flex-1 p-6 sm:p-10 max-w-4xl">
                {/* Article Header */}
                <div className="border-b border-[var(--border-subtle)] pb-6 mb-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                      {activeDoc.folderTitle}
                    </span>
                    {activeDoc.badge && (
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-medium">
                        {activeDoc.badge}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                    {activeDoc.title}
                  </h1>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 leading-relaxed">
                    {activeDoc.description}
                  </p>
                </div>

                {/* Article Content Body */}
                <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {/* Overview Text */}
                  <p className="text-base text-[var(--text-primary)] leading-relaxed font-normal">
                    {activeDoc.content.overview}
                  </p>

                  {/* Callout Box */}
                  {activeDoc.content.callout && (
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 my-5 shadow-sm ${
                        activeDoc.content.callout.type === 'warning'
                          ? 'glass-panel-danger text-rose-500 dark:text-rose-200'
                          : 'bg-brand-cyan/10 border-brand-cyan/30 text-cyan-700 dark:text-cyan-200'
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed font-medium">
                        {activeDoc.content.callout.text}
                      </div>
                    </div>
                  )}

                  {/* Code Example Box */}
                  {activeDoc.content.codeExample && (
                    <div className="my-6 rounded-xl border border-[var(--border-card)] overflow-hidden shadow-md">
                      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-100)] border-b border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
                        <span className="uppercase font-semibold text-brand-cyan">
                          {activeDoc.content.codeLanguage || 'bash'}
                        </span>
                        <button
                          onClick={() => copyCode(activeDoc.content.codeExample || '')}
                          className="flex items-center gap-1.5 text-xs text-brand-cyan hover:text-[var(--text-primary)] transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-brand-success" />
                              <span className="text-brand-success font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 code-dark-panel font-mono text-xs overflow-x-auto leading-relaxed">
                        <code>{activeDoc.content.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* Comparison Table */}
                  {activeDoc.content.table && (
                    <div className="my-6 overflow-x-auto rounded-xl border border-[var(--border-subtle)] shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--surface-100)] text-[var(--text-primary)] border-b border-[var(--border-subtle)] font-mono">
                          <tr>
                            {activeDoc.content.table.headers.map((h, i) => (
                              <th key={i} className="py-3 px-4 font-bold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--surface-50)] font-sans">
                          {activeDoc.content.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[var(--surface-100)]/60 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="py-3 px-4 text-[var(--text-secondary)] whitespace-pre-line leading-relaxed"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Bullet Points */}
                  {activeDoc.content.bulletPoints && (
                    <ul className="space-y-2.5 mt-4 text-xs font-normal">
                      {activeDoc.content.bulletPoints.map((bp, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[var(--text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0 mt-1.5" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
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
