import type { AnalysisReport } from '../types/index.js';
import { LOGO_DATA_URI } from './logo.js';

export function getDashboardHtml(report: AnalysisReport): string {
  const serialized = JSON.stringify(report).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Change Firewall — AI Code Change Behavioral Verification Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-jetbrains: 'JetBrains Mono', monospace;

      /* Light mode palette: Warm cream / parchment */
      --bg-main: #f5f2e8;
      --surface-main: #fdfbf7;
      --surface-card: #fdfbf7;
      --surface-50: #faf7f0;
      --surface-100: #ede8dc;
      --surface-200: #e2dbcdda;
      --surface-300: #d1c8b7;
      --surface-400: #9e9480;
      --text-primary: #181512;
      --text-secondary: #3d3832;
      --text-muted: #6e665c;
      --border-subtle: rgba(40, 32, 24, 0.08);
      --border-card: rgba(40, 32, 24, 0.12);
      --glass-bg: rgba(253, 251, 247, 0.88);
      --glass-glow-bg: rgba(255, 255, 255, 0.96);
      --grid-line: rgba(40, 32, 24, 0.04);

      /* Brand Accents for Light Mode */
      --brand-cyan: #0369a1;
      --brand-cyan-bg: rgba(3, 105, 161, 0.1);
      --brand-blue: #1d4ed8;
      --brand-blue-bg: rgba(29, 78, 216, 0.1);
      --brand-purple: #6d28d9;
      --brand-purple-bg: rgba(109, 40, 217, 0.1);
      --brand-pink: #be185d;
      --brand-danger: #dc2626;
      --brand-danger-bg: rgba(220, 38, 38, 0.1);
      --brand-warning: #b45309;
      --brand-warning-bg: rgba(180, 83, 9, 0.1);
      --brand-success: #15803d;
      --brand-success-bg: rgba(21, 128, 61, 0.1);

      --graph-bg: #ede8dc;
      --graph-panel-border: rgba(40, 32, 24, 0.12);
      --graph-node-bg: #fdfbf7;
      --graph-edge: #b5ac9b;
      --graph-text: #181512;
      --graph-subtext: #6e665c;
    }

    html.dark {
      /* Dark mode palette: Deep obsidian / slate */
      --bg-main: #07090e;
      --surface-main: #0d1117;
      --surface-card: #0f172a;
      --surface-50: #0a0d14;
      --surface-100: #121722;
      --surface-200: #171d2b;
      --surface-300: #1f2739;
      --surface-400: #2b364e;
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-card: rgba(255, 255, 255, 0.12);
      --glass-bg: rgba(13, 17, 26, 0.72);
      --glass-glow-bg: rgba(18, 24, 38, 0.85);
      --grid-line: rgba(255, 255, 255, 0.03);

      /* Brand Accents for Dark Mode */
      --brand-cyan: #38bdf8;
      --brand-cyan-bg: rgba(56, 189, 248, 0.12);
      --brand-blue: #60a5fa;
      --brand-blue-bg: rgba(96, 165, 250, 0.12);
      --brand-purple: #a855f7;
      --brand-purple-bg: rgba(168, 85, 247, 0.12);
      --brand-pink: #f472b6;
      --brand-danger: #f87171;
      --brand-danger-bg: rgba(248, 113, 113, 0.12);
      --brand-warning: #f59e0b;
      --brand-warning-bg: rgba(245, 158, 11, 0.12);
      --brand-success: #34d399;
      --brand-success-bg: rgba(52, 211, 153, 0.12);

      --graph-bg: #090e1a;
      --graph-panel-border: rgba(255, 255, 255, 0.1);
      --graph-node-bg: #0f172a;
      --graph-edge: #334155;
      --graph-text: #f8fafc;
      --graph-subtext: #94a3b8;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    /* Custom Selection Match */
    ::selection {
      background-color: #d1c8b7;
      color: #181512;
    }
    ::-moz-selection {
      background-color: #d1c8b7;
      color: #181512;
    }

    body {
      background-color: var(--bg-main);
      color: var(--text-primary);
      font-family: var(--font-inter);
      min-height: 100vh;
      line-height: 1.5;
      position: relative;
      overflow-x: hidden;
      transition: background-color 0.25s ease, color 0.25s ease;
    }

    /* Ambient Website Grid & Glow Backgrounds */
    .bg-grid {
      position: fixed;
      inset: 0;
      background-size: 36px 36px;
      background-image:
        linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
      pointer-events: none;
      z-index: 0;
    }

    .bg-radial {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle 800px at 50% -100px, rgba(249, 115, 22, 0.08), transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    html.dark .bg-radial {
      background: radial-gradient(circle 800px at 50% -100px, rgba(249, 115, 22, 0.12), transparent 70%);
    }

    .app-wrapper {
      position: relative;
      z-index: 1;
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px 28px 48px;
    }

    @media (max-width: 640px) {
      .app-wrapper {
        padding: 16px 16px 36px;
      }
    }

    /* Glass Header */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding-bottom: 22px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 28px;
      flex-wrap: wrap;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-logo-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(249, 115, 22, 0.28);
      background: rgba(249, 115, 22, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(249, 115, 22, 0.15);
      flex-shrink: 0;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .brand-logo-wrap:hover {
      transform: scale(1.04);
      border-color: rgba(249, 115, 22, 0.5);
    }

    .brand-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .brand-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text-primary);
    }

    .brand-version-pill {
      font-size: 11px;
      font-family: var(--font-jetbrains);
      font-weight: 600;
      padding: 1px 7px;
      border-radius: 9999px;
      background: var(--surface-100);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    .brand-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 1px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .live-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-jetbrains);
      letter-spacing: 0.5px;
      color: var(--brand-success);
      background: var(--brand-success-bg);
      border: 1px solid rgba(34, 197, 94, 0.25);
      padding: 5px 12px;
      border-radius: 9999px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--brand-success);
      box-shadow: 0 0 10px var(--brand-success);
      animation: pulse-dot 2s infinite ease-in-out;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    .timestamp-box {
      font-size: 12px;
      font-family: var(--font-jetbrains);
      color: var(--text-muted);
      background: var(--surface-100);
      padding: 6px 12px;
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
    }

    /* Dark / Light Mode Toggle Button */
    .theme-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 11px;
      background: var(--surface-100);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .theme-toggle-btn:hover {
      background: var(--surface-200);
      color: var(--text-primary);
      border-color: var(--border-card);
      transform: scale(1.04);
    }

    .theme-toggle-btn svg {
      width: 16px;
      height: 16px;
      stroke-width: 2;
    }

    .sun-icon { display: none; }
    .moon-icon { display: block; }
    html.dark .sun-icon { display: block; color: #facc15; }
    html.dark .moon-icon { display: none; }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .metric-card {
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .metric-card:hover {
      border-color: var(--border-card);
      box-shadow: 0 6px 24px rgba(0,0,0,0.06);
      transform: translateY(-1px);
    }

    .metric-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--border-card), transparent);
    }

    .metric-title {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .metric-value {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
      color: var(--text-primary);
      font-family: var(--font-jetbrains);
    }

    .metric-desc {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Severity Badges matching website */
    .badge-high {
      color: var(--brand-danger);
      background: var(--brand-danger-bg);
      border: 1px solid rgba(239, 68, 68, 0.25);
      padding: 3px 9px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-jetbrains);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      width: fit-content;
    }

    .badge-medium {
      color: var(--brand-warning);
      background: var(--brand-warning-bg);
      border: 1px solid rgba(245, 158, 11, 0.25);
      padding: 3px 9px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-jetbrains);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      width: fit-content;
    }

    .badge-low {
      color: var(--brand-success);
      background: var(--brand-success-bg);
      border: 1px solid rgba(34, 197, 94, 0.25);
      padding: 3px 9px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-jetbrains);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      width: fit-content;
    }

    /* Tabs Bar matching website pill style */
    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
      margin-bottom: 24px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tabs::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      background: var(--surface-100);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .tab-btn:hover {
      color: var(--text-primary);
      background: var(--surface-200);
      border-color: var(--border-card);
    }

    .tab-btn.active {
      color: var(--text-primary);
      background: var(--surface-main);
      border-color: var(--brand-cyan);
      box-shadow: 0 0 14px var(--brand-cyan-bg);
    }

    .tab-btn svg {
      width: 14px;
      height: 14px;
      stroke-width: 2;
      opacity: 0.8;
    }

    .tab-content {
      display: none;
      animation: fadeIn 0.15s ease;
    }

    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Interactive Graph Section (Tab 1) */
    .graph-container {
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 18px;
      padding: 24px;
      position: relative;
      box-shadow: 0 4px 24px rgba(0,0,0,0.03);
    }

    .graph-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .graph-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
    }

    .graph-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .graph-legend {
      display: flex;
      gap: 14px;
      font-size: 12px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--surface-100);
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
    }

    .legend-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 5px;
    }

    .legend-icon-wrap svg {
      width: 12px;
      height: 12px;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .graph-svg {
      width: 100%;
      height: 490px;
      background: var(--graph-bg);
      border-radius: 14px;
      border: 1px solid var(--graph-panel-border);
      transition: background-color 0.25s ease, border-color 0.25s ease;
    }

    .node-g {
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .node-g:hover {
      filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.35));
    }

    .node-rect {
      transition: all 0.2s ease;
    }

    .node-text {
      font-family: var(--font-jetbrains);
      font-size: 11px;
      font-weight: 600;
      fill: var(--graph-text);
      pointer-events: none;
    }

    .node-subtext {
      font-family: var(--font-jetbrains);
      font-size: 9.5px;
      fill: var(--graph-subtext);
      pointer-events: none;
    }

    .edge-line {
      stroke: var(--graph-edge);
      stroke-width: 1.6;
      fill: none;
      transition: stroke 0.2s, stroke-width 0.2s;
    }

    .edge-line.active {
      stroke: var(--brand-cyan);
      stroke-width: 2.6;
    }

    .inspector-card {
      margin-top: 20px;
      background: var(--surface-100);
      border: 1px solid var(--border-card);
      border-radius: 14px;
      padding: 20px;
      display: none;
      animation: fadeIn 0.2s ease;
    }

    .inspector-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .inspector-title {
      font-weight: 700;
      font-size: 15px;
      font-family: var(--font-jetbrains);
      color: var(--text-primary);
    }

    .inspector-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 12px;
      font-family: var(--font-jetbrains);
    }

    .inspector-details {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    /* Findings / Cards */
    .findings-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .finding-card {
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 22px 24px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.03);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .finding-card:hover {
      border-color: var(--border-card);
      box-shadow: 0 6px 24px rgba(0,0,0,0.05);
    }

    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      gap: 12px;
    }

    .finding-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .file-tag {
      font-family: var(--font-jetbrains);
      font-size: 12.5px;
      color: var(--brand-cyan);
      background: var(--brand-cyan-bg);
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 12px;
    }

    .finding-desc {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 16px;
      line-height: 1.6;
    }

    .evidence-box {
      background: var(--surface-100);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 14px;
      border-left: 3px solid var(--brand-cyan);
    }

    .evidence-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    .evidence-item {
      font-size: 13px;
      font-family: var(--font-jetbrains);
      color: var(--text-secondary);
      margin-left: 10px;
      margin-bottom: 4px;
    }

    .recommendation-box {
      background: var(--brand-cyan-bg);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
      color: var(--brand-cyan);
      line-height: 1.5;
    }

    /* Timeline */
    .timeline {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-left: 32px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      background: var(--border-subtle);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 24px;
    }

    .timeline-dot {
      position: absolute;
      left: -32px;
      top: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--brand-cyan);
      border: 3px solid var(--surface-card);
      box-shadow: 0 0 10px var(--brand-cyan-bg);
    }

    .timeline-date {
      font-size: 12px;
      font-family: var(--font-jetbrains);
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .timeline-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .timeline-author {
      color: var(--brand-purple);
      font-weight: 600;
    }

    /* Tables */
    .table-card {
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }

    .graph-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .graph-table th, .graph-table td {
      padding: 14px 20px;
      font-size: 13px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .graph-table th {
      background: var(--surface-100);
      color: var(--text-muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 700;
    }

    .graph-table tr:last-child td {
      border-bottom: none;
    }

    .graph-table tr:hover td {
      background: var(--surface-50);
    }

    .mono {
      font-family: var(--font-jetbrains);
      font-size: 12.5px;
    }

    /* Footer */
    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 12px;
    }

    footer a {
      color: var(--brand-cyan);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="bg-radial"></div>

  <div class="app-wrapper">
    <header>
      <div class="brand">
        <div class="brand-logo-wrap">
          <img src="${LOGO_DATA_URI}" alt="Change Firewall Logo" class="brand-logo-img" />
        </div>
        <div>
          <div class="brand-title-wrap">
            <span class="brand-title">Change Firewall</span>
            <span class="brand-version-pill">v0.1.8</span>
          </div>
          <div class="brand-subtitle">AI Code Change Behavioral Verification Engine</div>
        </div>
      </div>

      <div class="header-actions">
        <span id="live-indicator" class="live-badge">
          <span class="live-dot"></span>
          LIVE WATCH
        </span>
        <div id="timestamp" class="timestamp-box"></div>
        <button id="theme-toggle" class="theme-toggle-btn" title="Toggle Light / Dark Mode" aria-label="Toggle Theme">
          <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </header>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">
          <span>Overall Risk Score</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="metric-value" id="risk-score">--</div>
        <div id="risk-badge"></div>
      </div>
      <div class="metric-card">
        <div class="metric-title">
          <span>Behavioral Shifts</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="metric-value" id="behavior-count">--</div>
        <div class="metric-desc">Semantics & contract mutators detected</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">
          <span>Files Changed</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
        </div>
        <div class="metric-value" id="files-count">--</div>
        <div class="metric-desc" id="lines-diff"></div>
      </div>
      <div class="metric-card">
        <div class="metric-title">
          <span>Max Blast Radius</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/></svg>
        </div>
        <div class="metric-value" id="max-blast">--</div>
        <div class="metric-desc">Downstream consumers affected</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('graph')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="6" y1="9" x2="6" y2="15"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
        Impact Visual Map
      </button>
      <button class="tab-btn" onclick="switchTab('findings')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Behavioral Findings
      </button>
      <button class="tab-btn" onclick="switchTab('suspicious')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Suspicious Changes
      </button>
      <button class="tab-btn" onclick="switchTab('timeline')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Git Timeline
      </button>
      <button class="tab-btn" onclick="switchTab('blast')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
        Blast Radius Table
      </button>
      <button class="tab-btn" onclick="switchTab('risk')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/></svg>
        Risk Factors
      </button>
      <button class="tab-btn" onclick="switchTab('files')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>
        Changed Files
      </button>
    </div>

    <!-- TAB 1: Visual Interactive SVG Map -->
    <div id="tab-graph" class="tab-content active">
      <div class="graph-container">
        <div class="graph-header">
          <div>
            <div class="graph-title">Interactive Impact & Consumer Graph</div>
            <div class="graph-subtitle">Click any node to inspect blast radius, callers, and related behavioral findings.</div>
          </div>
          <div class="graph-legend">
            <!-- Modified Source with Icon -->
            <div class="legend-item">
              <span class="legend-icon-wrap" style="background: var(--brand-purple-bg); color: var(--brand-purple);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </span>
              <div class="legend-dot" style="background: var(--brand-purple);"></div>
              <span>Modified Source</span>
            </div>

            <!-- Dependent Consumer with Icon -->
            <div class="legend-item">
              <span class="legend-icon-wrap" style="background: var(--brand-cyan-bg); color: var(--brand-cyan);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
              </span>
              <div class="legend-dot" style="background: var(--brand-cyan);"></div>
              <span>Dependent Consumer</span>
            </div>

            <!-- Protected Route / High Blast with Icon -->
            <div class="legend-item">
              <span class="legend-icon-wrap" style="background: var(--brand-danger-bg); color: var(--brand-danger);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <div class="legend-dot" style="background: var(--brand-danger);"></div>
              <span>Protected Route / High Blast</span>
            </div>
          </div>
        </div>

        <svg id="network-svg" class="graph-svg">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>
          <g id="svg-edges"></g>
          <g id="svg-nodes"></g>
        </svg>

        <div id="inspector-card" class="inspector-card">
          <div class="inspector-header">
            <span id="inspector-title" class="inspector-title"></span>
            <span id="inspector-badge"></span>
          </div>
          <div id="inspector-desc" class="inspector-desc"></div>
          <div id="inspector-details" class="inspector-details"></div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Findings -->
    <div id="tab-findings" class="tab-content">
      <div class="findings-list" id="findings-container"></div>
    </div>

    <!-- TAB 3: Suspicious Changes -->
    <div id="tab-suspicious" class="tab-content">
      <div class="findings-list" id="suspicious-container"></div>
    </div>

    <!-- TAB 4: Git Timeline -->
    <div id="tab-timeline" class="tab-content">
      <div class="finding-card">
        <div class="timeline" id="timeline-container"></div>
      </div>
    </div>

    <!-- TAB 5: Blast Radius Table -->
    <div id="tab-blast" class="tab-content">
      <div class="table-card">
        <table class="graph-table">
          <thead>
            <tr>
              <th>Modified File</th>
              <th>Direct Dependents</th>
              <th>Affected Routes</th>
              <th>Total Blast Radius</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody id="blast-table-body"></tbody>
        </table>
      </div>
    </div>

    <!-- TAB 6: Risk Factors -->
    <div id="tab-risk" class="tab-content">
      <div class="findings-list" id="risk-factors-container"></div>
    </div>

    <!-- TAB 7: Changed Files -->
    <div id="tab-files" class="tab-content">
      <div class="table-card">
        <table class="graph-table">
          <thead>
            <tr>
              <th>Path</th>
              <th>Type</th>
              <th>Lines Added</th>
              <th>Lines Deleted</th>
            </tr>
          </thead>
          <tbody id="files-table-body"></tbody>
        </table>
      </div>
    </div>

    <footer>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 700; color: var(--text-primary);">Change Firewall</span>
        <span>•</span>
        <span>Deterministic Behavior & Blast Radius Analysis</span>
      </div>
      <div>
        <a href="https://github.com/himanshYou2003/change-firewall" target="_blank" rel="noreferrer">GitHub</a>
        <span style="margin: 0 8px; opacity: 0.4;">|</span>
        <a href="https://www.npmjs.com/package/change-firewall" target="_blank" rel="noreferrer">NPM v0.1.8</a>
      </div>
    </footer>
  </div>

  <script>
    // Theme Management
    (function initTheme() {
      const saved = localStorage.getItem('cf-theme');
      const root = document.documentElement;
      if (saved === 'light') {
        root.classList.remove('dark');
      } else if (saved === 'dark') {
        root.classList.add('dark');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
      }
    })();

    document.getElementById('theme-toggle').addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      if (isDark) {
        root.classList.remove('dark');
        localStorage.setItem('cf-theme', 'light');
      } else {
        root.classList.add('dark');
        localStorage.setItem('cf-theme', 'dark');
      }
      renderVisualGraph(currentReport);
    });

    let currentReport = ${serialized};

    function renderReport(report) {
      document.getElementById('timestamp').textContent = 'Last updated: ' + new Date(report.timestamp).toLocaleTimeString();
      document.getElementById('risk-score').textContent = report.risk.score + ' / 100';
      
      const riskBadge = document.getElementById('risk-badge');
      riskBadge.className = report.risk.level === 'HIGH' || report.risk.level === 'CRITICAL' ? 'badge-high' : (report.risk.level === 'MEDIUM' ? 'badge-medium' : 'badge-low');
      riskBadge.textContent = report.risk.level + ' RISK';

      document.getElementById('behavior-count').textContent = report.behavioralChangesCount;
      document.getElementById('files-count').textContent = report.totalFilesChanged;
      document.getElementById('lines-diff').innerHTML = '<span style="color: var(--brand-success); font-weight: 600;">+' + report.linesAdded + '</span> / <span style="color: var(--brand-danger); font-weight: 600;">-' + report.linesDeleted + '</span> lines';

      let maxConsumers = 0;
      for (const b of Object.values(report.blastRadiusMap)) {
        if (b.totalConsumers > maxConsumers) maxConsumers = b.totalConsumers;
      }
      document.getElementById('max-blast').textContent = maxConsumers;

      // 1. Render Interactive SVG Graph
      renderVisualGraph(report);

      // 2. Render Findings
      const findingsContainer = document.getElementById('findings-container');
      if (report.findings.length === 0) {
        findingsContainer.innerHTML = '<div class="finding-card"><p style="color: var(--brand-success); font-weight: 600;">✓ No breaking behavioral changes or contract regressions detected.</p></div>';
      } else {
        findingsContainer.innerHTML = report.findings.map(f => {
          const badgeClass = f.severity === 'HIGH' || f.severity === 'CRITICAL' ? 'badge-high' : (f.severity === 'MEDIUM' ? 'badge-medium' : 'badge-low');
          return \`
            <div class="finding-card">
              <div class="finding-header">
                <span class="finding-title">\${f.title}</span>
                <span class="\${badgeClass}">\${f.severity}</span>
              </div>
              <div class="file-tag">\${f.filePath}</div>
              <div class="finding-desc">\${f.description}</div>
              <div class="evidence-box">
                <div class="evidence-title">Observed Evidence</div>
                \${f.evidence.map(e => \`<div class="evidence-item">• \${e}</div>\`).join('')}
              </div>
              <div class="recommendation-box">
                <strong>Recommendation:</strong> \${f.recommendation}
              </div>
            </div>
          \`;
        }).join('');
      }

      // 3. Render Suspicious Changes
      const suspiciousContainer = document.getElementById('suspicious-container');
      const suspiciousList = report.suspiciousChanges || [];
      if (suspiciousList.length === 0) {
        suspiciousContainer.innerHTML = '<div class="finding-card"><p style="color: var(--brand-success); font-weight: 600;">✓ Zero suspicious anomaly patterns detected in current diff.</p></div>';
      } else {
        suspiciousContainer.innerHTML = suspiciousList.map(s => \`
          <div class="finding-card" style="border-left: 3px solid var(--brand-warning);">
            <div class="finding-header">
              <span class="finding-title">\${s.title}</span>
              <span class="badge-high">\${s.severity}</span>
            </div>
            <div class="file-tag">\${s.filePath}</div>
            <div class="finding-desc">\${s.reason}</div>
            <div class="evidence-box">
              <div class="evidence-title">Suspicion Indicators</div>
              \${s.evidence.map(e => \`<div class="evidence-item">• \${e}</div>\`).join('')}
            </div>
          </div>
        \`).join('');
      }

      // 4. Render Git Timeline
      const timelineContainer = document.getElementById('timeline-container');
      const timelineList = report.timeline || [];
      if (timelineList.length === 0) {
        timelineContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">No Git commit history recorded yet.</p>';
      } else {
        timelineContainer.innerHTML = timelineList.map(t => \`
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-date">\${t.date} • <span class="timeline-author">\${t.hash}</span> by \${t.author}</div>
            <div class="timeline-title">\${t.message}</div>
          </div>
        \`).join('');
      }

      // 5. Render Blast Radius Table
      const blastBody = document.getElementById('blast-table-body');
      const blastEntries = Object.values(report.blastRadiusMap);
      if (blastEntries.length === 0) {
        blastBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No dependency relationships detected.</td></tr>';
      } else {
        blastBody.innerHTML = blastEntries.map(b => {
          const badgeClass = b.level === 'HIGH' ? 'badge-high' : (b.level === 'MEDIUM' ? 'badge-medium' : 'badge-low');
          return \`
            <tr>
              <td class="mono" style="color: var(--brand-cyan); font-weight: 500;">\${b.filePath}</td>
              <td>\${b.directDependents.length}</td>
              <td>\${b.affectedRoutes.length > 0 ? b.affectedRoutes.join(', ') : '<span style="color: var(--text-muted);">None</span>'}</td>
              <td><strong>\${b.totalConsumers}</strong> consumers</td>
              <td><span class="\${badgeClass}">\${b.level}</span></td>
            </tr>
          \`;
        }).join('');
      }

      // 6. Render Risk Factors
      const riskContainer = document.getElementById('risk-factors-container');
      riskContainer.innerHTML = report.risk.factors.map(rf => \`
        <div class="finding-card">
          <div class="finding-header">
            <span class="finding-title" style="color: var(--brand-warning);">+\${rf.scoreContribution} pts: \${rf.factor}</span>
          </div>
          <div class="finding-desc">\${rf.reason}</div>
        </div>
      \`).join('');

      // 7. Render Changed Files Table
      const filesBody = document.getElementById('files-table-body');
      filesBody.innerHTML = report.changedFiles.map(cf => \`
        <tr>
          <td class="mono" style="font-weight: 500;">\${cf.path}</td>
          <td><span class="badge-medium">\${cf.changeType}</span></td>
          <td style="color: var(--brand-success); font-weight: 600; font-family: var(--font-jetbrains);">+\${cf.linesAdded}</td>
          <td style="color: var(--brand-danger); font-weight: 600; font-family: var(--font-jetbrains);">-\${cf.linesDeleted}</td>
        </tr>
      \`).join('');
    }

    // Interactive Visual SVG Graph Engine
    function renderVisualGraph(report) {
      const svgNodesGroup = document.getElementById('svg-nodes');
      const svgEdgesGroup = document.getElementById('svg-edges');
      svgNodesGroup.innerHTML = '';
      svgEdgesGroup.innerHTML = '';

      const blastEntries = Object.entries(report.blastRadiusMap);
      if (blastEntries.length === 0) return;

      const nodes = new Map();
      const edges = [];

      // Layer 0: Source modified files
      blastEntries.forEach(([file, blast]) => {
        nodes.set(file, {
          id: file,
          label: file.split('/').pop(),
          fullPath: file,
          type: 'source',
          layer: 0,
          blast,
        });

        // Layer 1: Direct dependents
        blast.directDependents.forEach((dep) => {
          const isRoute = blast.affectedRoutes.includes(dep);
          if (!nodes.has(dep)) {
            nodes.set(dep, {
              id: dep,
              label: dep.split('/').pop(),
              fullPath: dep,
              type: isRoute ? 'route' : 'consumer',
              layer: isRoute ? 2 : 1,
              blast: report.blastRadiusMap[dep] || { totalConsumers: 0, directDependents: [] },
            });
          }
          edges.push({ from: file, to: dep });
        });

        // Layer 2: Affected routes
        blast.affectedRoutes.forEach((route) => {
          if (!nodes.has(route)) {
            nodes.set(route, {
              id: route,
              label: route.split('/').pop(),
              fullPath: route,
              type: 'route',
              layer: 2,
              blast: report.blastRadiusMap[route] || { totalConsumers: 0, directDependents: [] },
            });
          }
        });
      });

      // Coordinates layout
      const layerNodes = [[], [], []];
      nodes.forEach((node) => {
        layerNodes[Math.min(node.layer, 2)].push(node);
      });

      const colX = [120, 460, 820];
      layerNodes.forEach((col, cIdx) => {
        const x = colX[cIdx];
        const gapY = Math.min(84, 430 / (col.length + 1));
        const startY = (470 - (col.length - 1) * gapY) / 2;
        col.forEach((node, rIdx) => {
          node.x = x;
          node.y = Math.max(45, startY + rIdx * gapY);
        });
      });

      // Draw Edges
      edges.forEach((edge) => {
        const fromNode = nodes.get(edge.from);
        const toNode = nodes.get(edge.to);
        if (!fromNode || !toNode) return;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = \`M \${fromNode.x + 85} \${fromNode.y} C \${fromNode.x + 190} \${fromNode.y}, \${toNode.x - 105} \${toNode.y}, \${toNode.x - 85} \${toNode.y}\`;
        path.setAttribute('d', d);
        path.setAttribute('class', 'edge-line');
        path.setAttribute('marker-end', 'url(#arrow)');
        path.dataset.from = fromNode.id;
        path.dataset.to = toNode.id;
        svgEdgesGroup.appendChild(path);
      });

      const isDark = document.documentElement.classList.contains('dark');

      // Draw Nodes with Icons
      nodes.forEach((node) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', \`translate(\${node.x - 75}, \${node.y - 22})\`);
        g.setAttribute('class', 'node-g');

        let fill = isDark ? '#0f172a' : '#ffffff';
        let stroke = isDark ? '#38bdf8' : '#0369a1';
        let iconColor = stroke;
        let typeBadge = 'Consumer';
        let iconPath = 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5'; // layers

        if (node.type === 'source') {
          stroke = isDark ? '#a855f7' : '#6d28d9';
          iconColor = stroke;
          typeBadge = 'Modified';
          iconPath = 'M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'; // edit
        } else if (node.type === 'route') {
          stroke = isDark ? '#f87171' : '#dc2626';
          iconColor = stroke;
          typeBadge = 'Route';
          iconPath = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01'; // shield
        }

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '150');
        rect.setAttribute('height', '44');
        rect.setAttribute('rx', '10');
        rect.setAttribute('fill', fill);
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('stroke-width', '1.6');
        rect.setAttribute('class', 'node-rect');

        // Node SVG Icon
        const iconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconG.setAttribute('transform', 'translate(10, 14)');
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        iconSvg.setAttribute('d', iconPath);
        iconSvg.setAttribute('fill', 'none');
        iconSvg.setAttribute('stroke', iconColor);
        iconSvg.setAttribute('stroke-width', '1.8');
        iconSvg.setAttribute('stroke-linecap', 'round');
        iconSvg.setAttribute('stroke-linejoin', 'round');
        iconSvg.setAttribute('transform', 'scale(0.65)');
        iconG.appendChild(iconSvg);

        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '30');
        titleText.setAttribute('y', '19');
        titleText.setAttribute('class', 'node-text');
        titleText.textContent = node.label.length > 14 ? node.label.slice(0, 13) + '…' : node.label;

        const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subText.setAttribute('x', '30');
        subText.setAttribute('y', '33');
        subText.setAttribute('class', 'node-subtext');
        subText.textContent = \`[\${typeBadge}] \${node.blast.totalConsumers} deps\`;

        g.appendChild(rect);
        g.appendChild(iconG);
        g.appendChild(titleText);
        g.appendChild(subText);

        g.addEventListener('click', () => {
          inspectNode(node, report);
          // Highlight connected edges
          document.querySelectorAll('.edge-line').forEach(el => {
            if (el.dataset.from === node.id || el.dataset.to === node.id) {
              el.classList.add('active');
              el.setAttribute('marker-end', 'url(#arrow-active)');
            } else {
              el.classList.remove('active');
              el.setAttribute('marker-end', 'url(#arrow)');
            }
          });
        });

        svgNodesGroup.appendChild(g);
      });
    }

    function inspectNode(node, report) {
      const card = document.getElementById('inspector-card');
      card.style.display = 'block';
      document.getElementById('inspector-title').textContent = node.fullPath;
      
      const badge = document.getElementById('inspector-badge');
      badge.className = node.type === 'source' ? 'badge-medium' : (node.type === 'route' ? 'badge-high' : 'badge-low');
      badge.textContent = node.type.toUpperCase();

      document.getElementById('inspector-desc').textContent = \`Node Role: \${node.type.toUpperCase()} • Direct Dependents: \${node.blast.directDependents ? node.blast.directDependents.length : 0} • Total Blast Radius: \${node.blast.totalConsumers} consumer(s)\`;

      const findings = report.findings.filter(f => f.filePath === node.fullPath || (f.affectedFiles && f.affectedFiles.includes(node.fullPath)));
      let detailsHtml = '';
      if (findings.length > 0) {
        detailsHtml += '<div style="font-weight: 700; margin-bottom: 6px; color: var(--brand-cyan);">Associated Findings:</div>';
        findings.forEach(f => {
          detailsHtml += \`<div style="margin-bottom: 6px; padding: 8px 12px; background: var(--surface-card); border-radius: 8px; border: 1px solid var(--border-subtle); font-family: var(--font-jetbrains); font-size: 12px;">• <strong>\${f.title}</strong>: \${f.description}</div>\`;
        });
      } else {
        detailsHtml += '<div style="color: var(--text-muted); font-size: 13px;">No breaking behavioral findings directly rooted in this node.</div>';
      }

      document.getElementById('inspector-details').innerHTML = detailsHtml;
    }

    // Initial render
    renderReport(currentReport);

    // Live Server-Sent Events stream
    if (typeof EventSource !== 'undefined') {
      const evtSource = new EventSource('/api/events');
      evtSource.onmessage = function(e) {
        try {
          const updated = JSON.parse(e.data);
          currentReport = updated;
          renderReport(updated);
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };
      evtSource.onerror = function() {
        document.getElementById('live-indicator').style.display = 'none';
      };
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      event.currentTarget.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');
    }
  </script>
</body>
</html>`;
}
