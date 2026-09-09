import type { AnalysisReport } from '../types/index.js';
import { LOGO_DATA_URI } from './logo.js';

export function getDashboardHtml(report: AnalysisReport): string {
  const serialized = JSON.stringify(report).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Change Firewall — AI Code Change Behavioral Verification Engine</title>
  <link rel="icon" type="image/png" href="${LOGO_DATA_URI}" />
  <link rel="apple-touch-icon" href="${LOGO_DATA_URI}" />
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

      --graph-bg: #080b13;
      --graph-panel-border: rgba(255, 255, 255, 0.08);
      --graph-node-bg: #0d121f;
      --graph-edge: #222f46;
      --graph-text: #f8fafc;
      --graph-subtext: #94a3b8;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

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
      max-width: 1440px;
      margin: 0 auto;
      padding: 24px 28px 48px;
    }

    @media (max-width: 640px) {
      .app-wrapper {
        padding: 16px 16px 36px;
      }
    }

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

    /* Tabs Bar */
    /* Tabs Navigation Container & Scrollable Bar */
    .tabs-nav-container {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 8px;
    }

    .tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      flex: 1;
      padding: 4px 2px 8px 2px;
      scrollbar-width: thin;
      scrollbar-color: var(--surface-300) transparent;
    }

    .tabs::-webkit-scrollbar {
      height: 6px;
    }

    .tabs::-webkit-scrollbar-track {
      background: var(--surface-100);
      border-radius: 9999px;
    }

    .tabs::-webkit-scrollbar-thumb {
      background: var(--surface-300);
      border-radius: 9999px;
    }

    .tabs::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    .tabs-scroll-btn {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--surface-100);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      user-select: none;
    }

    .tabs-scroll-btn:hover {
      background: var(--surface-200);
      color: var(--text-primary);
      border-color: var(--border-card);
      transform: scale(1.05);
    }

    .tab-btn {
      flex-shrink: 0;
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
      user-select: none;
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

    /* God-Level Graph Container & Canvas */
    .graph-container {
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 24px;
      position: relative;
      box-shadow: 0 4px 24px rgba(0,0,0,0.03);
    }

    .graph-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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
      gap: 12px;
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

    /* Floating Graph Control HUD */
    .graph-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: var(--surface-100);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .graph-toolbar-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .graph-toolbar-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    .graph-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 200px;
    }

    .graph-search-input {
      width: 100%;
      background: var(--surface-main);
      border: 1px solid var(--border-subtle);
      border-radius: 9px;
      padding: 6px 10px 6px 30px;
      font-size: 12px;
      font-family: var(--font-jetbrains);
      color: var(--text-primary);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .graph-search-input:focus {
      border-color: var(--brand-cyan);
      box-shadow: 0 0 10px var(--brand-cyan-bg);
    }

    .graph-search-icon {
      position: absolute;
      left: 9px;
      width: 13px;
      height: 13px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .graph-filter-group, .graph-layout-group, .graph-scope-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .graph-pill-btn {
      font-size: 11px;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 8px;
      background: var(--surface-main);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .graph-pill-btn:hover {
      color: var(--text-primary);
      border-color: var(--border-card);
      background: var(--surface-200);
    }

    .graph-pill-btn.active {
      background: var(--brand-cyan-bg);
      color: var(--brand-cyan);
      border-color: rgba(56, 189, 248, 0.4);
      box-shadow: 0 0 8px var(--brand-cyan-bg);
    }

    .graph-pill-btn svg {
      opacity: 0.85;
    }

    .graph-zoom-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .graph-tool-btn {
      height: 28px;
      padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: var(--surface-main);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
      transition: all 0.15s ease;
    }

    .graph-tool-btn:hover {
      background: var(--surface-200);
      color: var(--text-primary);
      border-color: var(--border-card);
    }

    .graph-stats-chip {
      font-size: 11px;
      font-family: var(--font-jetbrains);
      color: var(--text-muted);
      padding: 4px 8px;
      border-radius: 6px;
      background: var(--surface-main);
      border: 1px solid var(--border-subtle);
    }

    /* Infinite Canvas Viewport */
    .graph-canvas-wrapper {
      width: 100%;
      height: 620px;
      overflow: hidden;
      border-radius: 16px;
      border: 1px solid var(--graph-panel-border);
      background: var(--graph-bg);
      position: relative;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      box-shadow: inset 0 2px 14px rgba(0,0,0,0.08);
      transition: background-color 0.25s ease;
    }

    .graph-canvas-wrapper.is-dragging {
      cursor: grabbing;
    }

    .graph-canvas-wrapper.is-fullscreen {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 99999 !important;
      border-radius: 0 !important;
      border: none !important;
    }

    .fullscreen-exit-btn {
      position: absolute;
      top: 18px;
      right: 18px;
      z-index: 100000;
      display: none;
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      color: var(--text-primary);
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      backdrop-filter: blur(10px);
    }

    .graph-canvas-wrapper.is-fullscreen .fullscreen-exit-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .graph-svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }

    .viewport-group {
      transform-origin: 0 0;
      transition: transform 0.05s ease-out;
    }

    /* Radar Rings & Directory Clusters */
    .radar-ring {
      fill: none;
      stroke: var(--grid-line);
      stroke-width: 1.2;
      stroke-dasharray: 4 4;
      pointer-events: none;
    }

    .radar-label {
      font-family: var(--font-jetbrains);
      font-size: 10px;
      fill: var(--text-muted);
      letter-spacing: 1px;
      text-transform: uppercase;
      pointer-events: none;
    }

    .cluster-rect {
      fill: var(--surface-50);
      stroke: var(--border-subtle);
      stroke-width: 1.5;
      stroke-dasharray: 6 4;
      rx: 16;
      opacity: 0.65;
      transition: all 0.2s ease;
    }

    .cluster-rect:hover {
      stroke: var(--brand-cyan);
      opacity: 0.9;
    }

    .cluster-label {
      font-family: var(--font-jetbrains);
      font-size: 11px;
      font-weight: 700;
      fill: var(--brand-cyan);
      letter-spacing: 0.4px;
      pointer-events: none;
    }

    /* Interactive Radar Minimap */
    .graph-minimap {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: 170px;
      height: 104px;
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 24px rgba(0,0,0,0.25);
      z-index: 10;
      cursor: crosshair;
      user-select: none;
      backdrop-filter: blur(12px);
    }

    .minimap-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .minimap-viewrect {
      position: absolute;
      border: 1.5px solid var(--brand-cyan);
      background: rgba(56, 189, 248, 0.15);
      border-radius: 3px;
      pointer-events: none;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
    }

    /* Edge Hover Tooltip */
    .edge-tooltip {
      position: absolute;
      pointer-events: none;
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      border-radius: 8px;
      padding: 6px 12px;
      font-family: var(--font-jetbrains);
      font-size: 11px;
      color: var(--text-primary);
      box-shadow: 0 6px 20px rgba(0,0,0,0.28);
      z-index: 30;
      display: none;
      white-space: nowrap;
      transform: translate(-50%, -130%);
      transition: opacity 0.15s ease;
      backdrop-filter: blur(10px);
    }

    /* Nodes */
    .node-g {
      cursor: grab;
      transition: opacity 0.25s ease, filter 0.25s ease;
    }

    .node-g.is-dragging {
      cursor: grabbing !important;
    }

    .node-g:hover {
      filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.5));
    }

    .node-g.is-dimmed {
      opacity: 0.1 !important;
      filter: grayscale(80%);
    }

    .node-g.is-focused {
      opacity: 1 !important;
      filter: drop-shadow(0 0 16px var(--brand-cyan));
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

    /* Edges */
    .edge-line {
      fill: none;
      stroke-width: 1.8;
      stroke-linecap: round;
      cursor: pointer;
      transition: stroke-width 0.2s, opacity 0.25s ease, stroke 0.2s;
    }

    .edge-line:hover {
      stroke-width: 3.5 !important;
    }

    .edge-line.is-dimmed {
      opacity: 0.04 !important;
    }

    .edge-line.active {
      stroke-width: 3.2 !important;
      stroke-dasharray: 6 4;
      animation: edgeFlow 1s linear infinite;
    }

    @keyframes edgeFlow {
      from { stroke-dashoffset: 20; }
      to { stroke-dashoffset: 0; }
    }

    /* Inspector Card & Breadcrumb Trails */
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

    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin: 10px 0 14px;
      padding: 8px 12px;
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
    }

    .breadcrumb-pill {
      font-family: var(--font-jetbrains);
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--surface-200);
      border: 1px solid var(--border-subtle);
      color: var(--brand-cyan);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .breadcrumb-pill:hover {
      background: var(--brand-cyan-bg);
      border-color: var(--brand-cyan);
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

    /* Crash Simulator & Sandbox Styles */
    .badge-tab-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1px 7px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 9999px;
      background: var(--brand-danger-bg);
      color: var(--brand-danger);
      margin-left: 6px;
    }
    .badge-tab-pill.is-clean {
      background: var(--brand-success-bg);
      color: var(--brand-success);
    }

    .crash-sandbox-wrap {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .crash-clean-shield {
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 36px 24px;
      text-align: center;
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
    }
    .crash-clean-shield-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      color: var(--brand-success);
      background: var(--brand-success-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .crash-clean-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    .crash-clean-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      max-width: 540px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .crash-card {
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      border-left: 4px solid var(--brand-danger);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 4px 16px -2px rgba(220, 38, 38, 0.08);
      transition: all 0.2s ease;
    }
    .crash-card:hover {
      box-shadow: 0 8px 24px -2px rgba(220, 38, 38, 0.15);
    }

    .crash-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .crash-title-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .crash-exception-tag {
      font-family: var(--font-jetbrains);
      font-size: 14.5px;
      font-weight: 700;
      color: var(--brand-danger);
    }
    .crash-location {
      font-size: 12.5px;
      color: var(--text-muted);
      font-family: var(--font-jetbrains);
    }

    .crash-terminal {
      background: #090d16;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 14px 16px;
      color: #f8fafc;
      font-family: var(--font-jetbrains);
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.5);
    }
    .crash-terminal-topbar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 10.5px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .terminal-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }

    .call-ladder {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface-50);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 12px 16px;
      overflow-x: auto;
      font-size: 12.5px;
    }
    .ladder-node {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: fit-content;
    }
    .ladder-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .ladder-val {
      font-family: var(--font-jetbrains);
      font-weight: 600;
      color: var(--text-primary);
    }
    .ladder-arrow {
      color: var(--text-muted);
      font-size: 16px;
    }

    .proof-steps-box {
      background: var(--surface-50);
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      padding: 12px 16px;
    }
    .proof-steps-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .proof-step-item {
      font-size: 12px;
      font-family: var(--font-jetbrains);
      color: var(--text-secondary);
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .fix-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 10px 14px;
    }
    .fix-instruction-text {
      font-size: 12px;
      color: var(--brand-success);
      font-weight: 500;
    }

    /* AI Remediation Command Center Styles - Minimal & Elegant */
    .remediation-command-center {
      margin-top: 32px;
      background: var(--surface-card);
      border: 1px solid var(--border-card);
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      transition: border-color 0.2s ease;
    }
    .remediation-command-center:hover {
      border-color: var(--border-card);
    }

    .remediation-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: var(--surface-50);
      border-bottom: 1px solid var(--border-subtle);
      flex-wrap: wrap;
      gap: 12px;
    }
    .remediation-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .remediation-icon-glow {
      width: 34px;
      height: 34px;
      border-radius: 7px;
      background: var(--surface-100);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .remediation-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .remediation-badge-status {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
      background: var(--brand-warning-bg);
      color: var(--brand-warning);
    }
    .remediation-badge-status.is-clean {
      background: var(--brand-success-bg);
      color: var(--brand-success);
    }
    .remediation-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 1px;
    }

    .remediation-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .remediation-tabs {
      display: flex;
      background: var(--surface-100);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 2px;
      gap: 2px;
    }
    .remed-tab-btn {
      border: none;
      background: transparent;
      padding: 5px 11px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-muted);
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: var(--font-inter);
    }
    .remed-tab-btn:hover {
      color: var(--text-primary);
    }
    .remed-tab-btn.active {
      background: var(--surface-card);
      color: var(--text-primary);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border: 1px solid var(--border-subtle);
    }

    .copy-prompt-primary-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--text-primary);
      color: var(--surface-card);
      border: 1px solid var(--text-primary);
      border-radius: 6px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: var(--font-inter);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: all 0.15s ease;
    }
    .copy-prompt-primary-btn:hover {
      opacity: 0.88;
      transform: translateY(-1px);
    }
    .copy-prompt-primary-btn:active {
      transform: translateY(0);
    }

    .remediation-body {
      padding: 20px 24px;
    }
    .remediation-prompt-wrap {
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      background: var(--surface-50);
      overflow: hidden;
    }
    .prompt-meta-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: var(--surface-100);
      border-bottom: 1px solid var(--border-subtle);
      font-size: 11.5px;
    }
    .prompt-mode-label {
      font-weight: 600;
      color: var(--text-primary);
    }
    .prompt-tip {
      color: var(--text-muted);
    }
    .remediation-prompt-content {
      padding: 16px;
      font-family: var(--font-jetbrains);
      font-size: 12.5px;
      line-height: 1.6;
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 380px;
      overflow-y: auto;
      user-select: text;
    }

    /* Toast Notification */
    .cf-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 12px 20px;
      font-size: 13.5px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 99999;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    .cf-toast.show {
      transform: translateY(0);
      opacity: 1;
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
            <span class="brand-version-pill">v0.3.0</span>
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

    <div class="tabs-nav-container">
      <button class="tabs-scroll-btn" onclick="scrollTabs(-240)" title="Scroll tabs left" aria-label="Scroll tabs left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="tabs" id="main-tabs-bar">
        <button class="tab-btn active" data-tab="graph" onclick="switchTab('graph', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="6" y1="9" x2="6" y2="15"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
          Impact Visual Map
        </button>
        <button class="tab-btn" data-tab="findings" onclick="switchTab('findings', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Behavioral Findings
        </button>
        <button class="tab-btn" data-tab="crashes" onclick="switchTab('crashes', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Crash Simulator
          <span id="crashes-count-badge" class="badge-tab-pill">0</span>
        </button>
        <button class="tab-btn" data-tab="suspicious" onclick="switchTab('suspicious', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Suspicious Changes
        </button>
        <button class="tab-btn" data-tab="timeline" onclick="switchTab('timeline', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Git Timeline
        </button>
        <button class="tab-btn" data-tab="blast" onclick="switchTab('blast', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          Blast Radius Table
        </button>
        <button class="tab-btn" data-tab="risk" onclick="switchTab('risk', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/></svg>
          Risk Factors
        </button>
        <button class="tab-btn" data-tab="files" onclick="switchTab('files', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>
          Changed Files
        </button>
      </div>
      <button class="tabs-scroll-btn" onclick="scrollTabs(240)" title="Scroll tabs right" aria-label="Scroll tabs right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- TAB 1: World-Class Interactive SVG Graph -->
    <div id="tab-graph" class="tab-content active">
      <div class="graph-container">
        <div class="graph-header">
          <div>
            <div class="graph-title">Interactive Impact & Consumer Graph</div>
            <div class="graph-subtitle">Click any node to inspect blast radius, callers, and related behavioral findings. Drag to pan, scroll to zoom.</div>
          </div>
          <div class="graph-legend">
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

            <div class="legend-item">
              <span class="legend-icon-wrap" style="background: var(--brand-danger-bg); color: var(--brand-danger);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <div class="legend-dot" style="background: var(--brand-danger);"></div>
              <span>API Route / High Blast</span>
            </div>

            <div class="legend-item">
              <span class="legend-icon-wrap" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </span>
              <div class="legend-dot" style="background: #10b981;"></div>
              <span>Service</span>
            </div>

            <div class="legend-item">
              <span class="legend-icon-wrap" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              <div class="legend-dot" style="background: #f59e0b;"></div>
              <span>Auth Guard</span>
            </div>

            <div class="legend-item">
              <span class="legend-icon-wrap" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4"/>
                </svg>
              </span>
              <div class="legend-dot" style="background: #3b82f6;"></div>
              <span>DB Model</span>
            </div>
          </div>
        </div>

        <!-- Floating Glass Graph Controls Bar -->
        <div class="graph-toolbar">
          <div class="graph-toolbar-section">
            <div class="graph-search-wrap">
              <svg class="graph-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="graph-search" class="graph-search-input" placeholder="Search node, role, or consumer..." />
            </div>

            <div class="graph-filter-group">
              <span class="graph-toolbar-label">Role:</span>
              <button class="graph-pill-btn active" data-filter="all" onclick="filterGraphRole('all')">All</button>
              <button class="graph-pill-btn" data-filter="source" onclick="filterGraphRole('source')">Modified</button>
              <button class="graph-pill-btn" data-filter="route" onclick="filterGraphRole('route')">Routes</button>
              <button class="graph-pill-btn" data-filter="service" onclick="filterGraphRole('service')">Services</button>
              <button class="graph-pill-btn" data-filter="model" onclick="filterGraphRole('model')">Models</button>
              <button class="graph-pill-btn" data-filter="auth" onclick="filterGraphRole('auth')">Auth</button>
              <button class="graph-pill-btn" data-filter="test" onclick="filterGraphRole('test')">Tests</button>
              <button class="graph-pill-btn" data-filter="consumer" onclick="filterGraphRole('consumer')">Other</button>
            </div>

            <div class="graph-layout-group">
              <span class="graph-toolbar-label">Layout:</span>
              <button class="graph-pill-btn active" data-layout="dag" onclick="switchGraphLayout('dag')" title="Topological Sugiyama DAG with multi-lane wrapping">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v6M18 15v6M6 9a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3"/></svg>
                DAG Flow
              </button>
              <button class="graph-pill-btn" data-layout="radial" onclick="switchGraphLayout('radial')" title="Concentric blast radius rings from modified core">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/></svg>
                Radial Radar
              </button>
              <button class="graph-pill-btn" data-layout="force" onclick="switchGraphLayout('force')" title="Organic physics force-directed relaxation">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><line x1="8.5" y1="7.5" x2="15.5" y2="16.5"/></svg>
                Force Physics
              </button>
              <button class="graph-pill-btn" data-layout="cluster" onclick="switchGraphLayout('cluster')" title="Folder & directory compartment clusters">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Directory
              </button>
            </div>

            <div class="graph-scope-group">
              <span class="graph-toolbar-label">Scope:</span>
              <button class="graph-pill-btn active" data-scope="all" onclick="setBlastScope('all')" title="Entire reachable blast graph">All</button>
              <button class="graph-pill-btn" data-scope="1hop" onclick="setBlastScope('1hop')" title="1st-degree direct dependents only">1-Hop</button>
              <button class="graph-pill-btn" data-scope="routes" onclick="setBlastScope('routes')" title="Paths reaching public routes only">Routes</button>
            </div>
          </div>

          <div class="graph-zoom-controls">
            <span id="graph-stats-chip" class="graph-stats-chip">-- nodes</span>
            <button class="graph-tool-btn" onclick="zoomCanvas(1.25)" title="Zoom In">+</button>
            <button class="graph-tool-btn" onclick="zoomCanvas(0.8)" title="Zoom Out">-</button>
            <button class="graph-tool-btn" onclick="resetCanvasView()" title="Fit to View">⊡</button>
            <button class="graph-tool-btn" onclick="toggleFullscreen()" title="Toggle Fullscreen">⛶</button>
            <button class="graph-tool-btn" onclick="exportGraphSvg()" title="Export Vector SVG" style="font-size: 11px;">SVG</button>
            <button class="graph-tool-btn" onclick="exportGraphPng()" title="Export PNG Image" style="font-size: 11px;">PNG</button>
          </div>
        </div>

        <div class="graph-canvas-wrapper" id="graph-wrapper">
          <button class="fullscreen-exit-btn" id="exit-fullscreen-btn" onclick="toggleFullscreen()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            Exit Fullscreen (Esc)
          </button>
          <div id="edge-tooltip" class="edge-tooltip"></div>
          <svg id="network-svg" class="graph-svg">
            <defs id="svg-defs">
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#64748b" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#38bdf8" />
              </marker>
            </defs>
            <g id="viewport-group" class="viewport-group">
              <g id="svg-radar-rings"></g>
              <g id="svg-clusters"></g>
              <g id="svg-edges"></g>
              <g id="svg-nodes"></g>
            </g>
          </svg>

          <!-- Interactive Minimap Radar -->
          <div class="graph-minimap" id="graph-minimap" title="Click or drag to navigate graph">
            <canvas id="minimap-canvas" class="minimap-canvas" width="170" height="104"></canvas>
            <div id="minimap-viewrect" class="minimap-viewrect"></div>
          </div>
        </div>

        <div id="inspector-card" class="inspector-card">
          <div class="inspector-header">
            <span id="inspector-title" class="inspector-title"></span>
            <span id="inspector-badge"></span>
          </div>
          <div id="inspector-desc" class="inspector-desc"></div>
          <div id="inspector-breadcrumb" class="breadcrumb-trail" style="display: none;"></div>
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

    <!-- TAB 8: Crash Simulator Sandbox -->
    <div id="tab-crashes" class="tab-content">
      <div id="crash-sandbox-container" class="crash-sandbox-wrap"></div>
    </div>

    <!-- AI Agent Remediation Command Center -->
    <div class="remediation-command-center" id="remediation-command-center">
      <div class="remediation-header">
        <div class="remediation-header-left">
          <div class="remediation-icon-glow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div>
            <div class="remediation-title">
              <span>AI Agent Remediation Command Center</span>
              <span id="remediation-badge" class="remediation-badge-status">Analyzing diffs...</span>
            </div>
            <div class="remediation-subtitle">
              Deterministic, surgical prompts to copy & paste into Cursor, Claude, Antigravity, or Copilot
            </div>
          </div>
        </div>

        <div class="remediation-actions">
          <div class="remediation-tabs">
            <button class="remed-tab-btn active" id="btn-remed-safe" onclick="switchRemediationMode('safe')">
              🩹 Safe Fix Prompt
            </button>
            <button class="remed-tab-btn" id="btn-remed-minimal" onclick="switchRemediationMode('minimal')">
              ⚡ Minimal
            </button>
            <button class="remed-tab-btn" id="btn-remed-pr" onclick="switchRemediationMode('pr')">
              📝 PR Summary
            </button>
          </div>

          <button id="copy-prompt-btn" class="copy-prompt-primary-btn" onclick="copyActivePrompt()">
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span id="copy-btn-text">📋 Copy Prompt for AI Agent</span>
          </button>
        </div>
      </div>

      <div class="remediation-body">
        <div class="remediation-prompt-wrap">
          <div class="prompt-meta-bar">
            <span id="prompt-mode-indicator" class="prompt-mode-label">Mode: Safe Backwards-Compatible Fix</span>
            <span class="prompt-tip">💡 Ready to paste into Cursor / Claude / Antigravity / Copilot</span>
          </div>
          <pre id="remediation-prompt-text" class="remediation-prompt-content">Generating remediation prompt...</pre>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div id="cf-toast" class="cf-toast">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span id="cf-toast-text">Prompt copied to clipboard!</span>
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
        <a href="https://www.npmjs.com/package/change-firewall" target="_blank" rel="noreferrer">NPM v0.3.0</a>
      </div>
    </footer>
  </div>

  <script>
    var currentReport = ${serialized};

    // Theme Management - Defaults to Light Mode
    (function initTheme() {
      var saved = localStorage.getItem('cf-theme');
      var root = document.documentElement;
      if (saved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    })();

    var themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function() {
        var root = document.documentElement;
        var isDark = root.classList.contains('dark');
        if (isDark) {
          root.classList.remove('dark');
          localStorage.setItem('cf-theme', 'light');
        } else {
          root.classList.add('dark');
          localStorage.setItem('cf-theme', 'dark');
        }
        if (typeof renderVisualGraph === 'function' && typeof currentReport !== 'undefined') {
          renderVisualGraph(currentReport);
        }
      });
    }

    // Path & String Sanitizer Helpers (safe against unescaped newlines/regex tokens)
    function normalizeClientPath(p) {
      if (!p) return '';
      return String(p).split(String.fromCharCode(92)).join('/');
    }

    function getFileBaseName(p) {
      if (!p) return '';
      var slashIdx = Math.max(p.lastIndexOf('/'), p.lastIndexOf(String.fromCharCode(92)));
      return slashIdx >= 0 ? p.substring(slashIdx + 1) : p;
    }

    function getPathDirectory(p) {
      if (!p) return 'root';
      var normalized = p.split(String.fromCharCode(92)).join('/');
      var parts = normalized.split('/').filter(Boolean);
      return parts.length > 1 ? parts.slice(0, 2).join('/') : 'root';
    }

    function safeEscapeSelector(id) {
      if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(id);
      return String(id).split('"').join(String.fromCharCode(92) + '"');
    }

    var currentReport = ${serialized};

    // Global Canvas & Graph State
    var canvasScale = 1.0;
    var canvasPanX = 0;
    var canvasPanY = 0;
    var isDraggingCanvas = false;
    var startDragX = 0;
    var startDragY = 0;
    var currentLayout = 'dag'; // 'dag' | 'radial' | 'force' | 'cluster'
    var activeBlastScope = 'all'; // 'all' | '1hop' | 'routes'
    var activeRoleFilter = 'all'; // 'all' | 'source' | 'consumer' | 'route'
    var activeSearchQuery = '';
    var isFullscreen = false;

    // Node Dragging State
    var isDraggingNode = false;
    var draggedNode = null;
    var dragStartMouseX = 0;
    var dragStartMouseY = 0;
    var dragStartNodeX = 0;
    var dragStartNodeY = 0;

    // Graph Data Store
    var graphNodesMap = new Map();
    var graphEdgesList = [];
    var graphIncomingMap = new Map();
    var graphOutgoingMap = new Map();
    var graphBounds = { minX: 0, minY: 0, maxX: 1200, maxY: 600, width: 1200, height: 600 };

    function applyCanvasTransform() {
      var group = document.getElementById('viewport-group');
      if (group) {
        group.setAttribute('transform', 'translate(' + canvasPanX + ', ' + canvasPanY + ') scale(' + canvasScale + ')');
      }
      updateMinimapViewRect();
    }

    function zoomCanvas(factor) {
      var wrapper = document.getElementById('graph-wrapper');
      if (!wrapper) return;
      var rect = wrapper.getBoundingClientRect();
      var cx = rect.width / 2;
      var cy = rect.height / 2;

      var newScale = Math.max(0.1, Math.min(4.0, canvasScale * factor));
      canvasPanX = cx - (cx - canvasPanX) * (newScale / canvasScale);
      canvasPanY = cy - (cy - canvasPanY) * (newScale / canvasScale);
      canvasScale = newScale;
      applyCanvasTransform();
    }

    function resetCanvasView() {
      var wrapper = document.getElementById('graph-wrapper');
      var svg = document.getElementById('network-svg');
      if (!wrapper || !svg) return;

      var vb = svg.viewBox.baseVal;
      if (!vb || vb.width === 0) return;

      var rect = wrapper.getBoundingClientRect();
      var scaleX = (rect.width - 60) / vb.width;
      var scaleY = (rect.height - 60) / vb.height;
      canvasScale = Math.max(0.2, Math.min(1.15, Math.min(scaleX, scaleY)));

      canvasPanX = (rect.width - vb.width * canvasScale) / 2;
      canvasPanY = (rect.height - vb.height * canvasScale) / 2;
      applyCanvasTransform();
    }

    function centerOnNode(nodeId) {
      var node = graphNodesMap.get(nodeId);
      var wrapper = document.getElementById('graph-wrapper');
      if (!node || !wrapper) return;

      var rect = wrapper.getBoundingClientRect();
      canvasScale = Math.max(0.9, canvasScale);
      canvasPanX = rect.width / 2 - node.x * canvasScale;
      canvasPanY = rect.height / 2 - node.y * canvasScale;
      applyCanvasTransform();
    }

    function toggleFullscreen() {
      var wrapper = document.getElementById('graph-wrapper');
      if (!wrapper) return;
      isFullscreen = !isFullscreen;
      wrapper.classList.toggle('is-fullscreen', isFullscreen);
      setTimeout(resetCanvasView, 60);
    }

    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    });

    function switchGraphLayout(layout) {
      currentLayout = layout;
      document.querySelectorAll('.graph-layout-group .graph-pill-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.layout === layout);
      });
      renderVisualGraph(currentReport);
    }

    function setBlastScope(scope) {
      activeBlastScope = scope;
      document.querySelectorAll('.graph-scope-group .graph-pill-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.scope === scope);
      });
      renderVisualGraph(currentReport);
    }

    function filterGraphRole(role) {
      activeRoleFilter = role;
      document.querySelectorAll('.graph-filter-group .graph-pill-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.filter === role);
      });
      filterAndHighlightGraph(false);
    }

    // Pan, Zoom & Node Drag Event Listeners
    (function setupCanvasInteraction() {
      var wrapper = document.getElementById('graph-wrapper');
      if (!wrapper) return;

      wrapper.addEventListener('mousedown', function(e) {
        var nodeEl = e.target.closest('.node-g');
        if (nodeEl) {
          var nId = nodeEl.dataset.nodeId;
          var node = graphNodesMap.get(nId);
          if (node) {
            isDraggingNode = true;
            draggedNode = node;
            dragStartMouseX = e.clientX;
            dragStartMouseY = e.clientY;
            dragStartNodeX = node.x;
            dragStartNodeY = node.y;
            nodeEl.classList.add('is-dragging');
          }
          return;
        }

        if (e.target.closest('#graph-minimap') || e.target.closest('.graph-toolbar') || e.target.closest('.fullscreen-exit-btn')) return;

        isDraggingCanvas = true;
        startDragX = e.clientX - canvasPanX;
        startDragY = e.clientY - canvasPanY;
        wrapper.classList.add('is-dragging');
      });

      window.addEventListener('mousemove', function(e) {
        if (isDraggingNode && draggedNode) {
          var dx = (e.clientX - dragStartMouseX) / canvasScale;
          var dy = (e.clientY - dragStartMouseY) / canvasScale;
          draggedNode.x = dragStartNodeX + dx;
          draggedNode.y = dragStartNodeY + dy;

          var nodeEl = document.querySelector('.node-g[data-node-id="' + safeEscapeSelector(draggedNode.id) + '"]');
          if (nodeEl) {
            nodeEl.setAttribute('transform', 'translate(' + (draggedNode.x - 87.5) + ', ' + (draggedNode.y - 24) + ')');
          }
          updateConnectedEdges(draggedNode.id);
          drawMinimap();
          return;
        }

        if (isDraggingCanvas) {
          canvasPanX = e.clientX - startDragX;
          canvasPanY = e.clientY - startDragY;
          applyCanvasTransform();
        }
      });

      window.addEventListener('mouseup', function() {
        if (isDraggingNode) {
          if (draggedNode) {
            var nodeEl = document.querySelector('.node-g[data-node-id="' + safeEscapeSelector(draggedNode.id) + '"]');
            if (nodeEl) nodeEl.classList.remove('is-dragging');
          }
          isDraggingNode = false;
          draggedNode = null;
        }
        if (isDraggingCanvas) {
          isDraggingCanvas = false;
          wrapper.classList.remove('is-dragging');
        }
      });

      // Smooth Mouse Wheel Zoom
      wrapper.addEventListener('wheel', function(e) {
        e.preventDefault();
        var rect = wrapper.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        var zoomDelta = e.deltaY < 0 ? 1.14 : 0.88;
        var newScale = Math.max(0.1, Math.min(4.0, canvasScale * zoomDelta));

        canvasPanX = mouseX - (mouseX - canvasPanX) * (newScale / canvasScale);
        canvasPanY = mouseY - (mouseY - canvasPanY) * (newScale / canvasScale);
        canvasScale = newScale;
        applyCanvasTransform();
      }, { passive: false });

      // Double-click to fit view
      wrapper.addEventListener('dblclick', function(e) {
        if (!e.target.closest('.node-g') && !e.target.closest('#graph-minimap')) {
          resetCanvasView();
        }
      });

      // Live search input with auto-pan & center
      var searchInput = document.getElementById('graph-search');
      if (searchInput) {
        searchInput.addEventListener('input', function(e) {
          activeSearchQuery = e.target.value.toLowerCase().trim();
          filterAndHighlightGraph(true);
        });
      }
    })();

    // Edge Dragging Real-time Updates
    function updateConnectedEdges(nodeId) {
      graphEdgesList.forEach(function(edge, idx) {
        if (edge.from === nodeId || edge.to === nodeId) {
          var fromNode = graphNodesMap.get(edge.from);
          var toNode = graphNodesMap.get(edge.to);
          if (!fromNode || !toNode) return;

          var pathEl = document.querySelector('.edge-line[data-from="' + CSS.escape(edge.from) + '"][data-to="' + CSS.escape(edge.to) + '"]');
          var gradEl = document.getElementById('edge-grad-' + idx);
          if (pathEl) {
            var geom = getEdgeGeometry(fromNode, toNode, currentLayout);
            pathEl.setAttribute('d', geom.d);
            if (gradEl) {
              gradEl.setAttribute('x1', String(geom.x1));
              gradEl.setAttribute('y1', String(geom.y1));
              gradEl.setAttribute('x2', String(geom.x2));
              gradEl.setAttribute('y2', String(geom.y2));
            }
          }
        }
      });
    }

    // Geometry & Routing Calculator
    function getEdgeGeometry(fromNode, toNode, layout) {
      var nodeW = 175;
      var nodeH = 48;
      var d = '';
      var x1 = fromNode.x;
      var y1 = fromNode.y;
      var x2 = toNode.x;
      var y2 = toNode.y;

      if (layout === 'dag') {
        if (toNode.x > fromNode.x + 20) {
          x1 = fromNode.x + nodeW / 2;
          y1 = fromNode.y;
          x2 = toNode.x - nodeW / 2;
          y2 = toNode.y;
          var dx = x2 - x1;
          var cp = Math.min(180, Math.max(40, dx * 0.45));
          d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + cp) + ' ' + y1 + ', ' + (x2 - cp) + ' ' + y2 + ', ' + x2 + ' ' + y2;
        } else if (Math.abs(toNode.x - fromNode.x) <= 20) {
          x1 = fromNode.x + nodeW / 2;
          y1 = fromNode.y;
          x2 = toNode.x + nodeW / 2;
          y2 = toNode.y;
          var arc = Math.min(70, Math.abs(y2 - y1) * 0.4 + 35);
          d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + arc) + ' ' + y1 + ', ' + (x2 + arc) + ' ' + y2 + ', ' + x2 + ' ' + y2;
        } else {
          x1 = fromNode.x;
          y1 = fromNode.y + nodeH / 2;
          x2 = toNode.x;
          y2 = toNode.y + nodeH / 2;
          var bottom = Math.max(y1, y2) + 55;
          d = 'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + bottom + ', ' + x2 + ' ' + bottom + ', ' + x2 + ' ' + y2;
        }
      } else {
        var dx = toNode.x - fromNode.x;
        var dy = toNode.y - fromNode.y;
        var angle = Math.atan2(dy, dx);
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        x1 = fromNode.x + cos * (nodeW / 2);
        y1 = fromNode.y + sin * (nodeH / 2);
        x2 = toNode.x - cos * (nodeW / 2);
        y2 = toNode.y - sin * (nodeH / 2);

        var dist = Math.hypot(dx, dy);
        var normX = -sin * (dist * 0.12);
        var normY = cos * (dist * 0.12);
        var midX = (x1 + x2) / 2 + normX;
        var midY = (y1 + y2) / 2 + normY;

        d = 'M ' + x1 + ' ' + y1 + ' Q ' + midX + ' ' + midY + ' ' + x2 + ' ' + y2;
      }

      return { d: d, x1: x1, y1: y1, x2: x2, y2: y2 };
    }

    // Minimap Radar Navigation
    function drawMinimap() {
      var canvas = document.getElementById('minimap-canvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var pad = 24;
      var gw = Math.max(100, graphBounds.width);
      var gh = Math.max(100, graphBounds.height);
      var scale = Math.min((w - pad) / gw, (h - pad) / gh);
      var offX = (w - gw * scale) / 2 - graphBounds.minX * scale;
      var offY = (h - gh * scale) / 2 - graphBounds.minY * scale;

      // Draw edges
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? 'rgba(56, 189, 248, 0.25)' : 'rgba(3, 105, 161, 0.25)';
      graphEdgesList.forEach(function(e) {
        var from = graphNodesMap.get(e.from);
        var to = graphNodesMap.get(e.to);
        if (!from || !to) return;
        ctx.beginPath();
        ctx.moveTo(from.x * scale + offX, from.y * scale + offY);
        ctx.lineTo(to.x * scale + offX, to.y * scale + offY);
        ctx.stroke();
      });

      // Draw nodes
      graphNodesMap.forEach(function(n) {
        var nx = n.x * scale + offX;
        var ny = n.y * scale + offY;
        ctx.beginPath();
        ctx.arc(nx, ny, n.type === 'source' ? 3.5 : 2.5, 0, Math.PI * 2);
        if (n.type === 'source') ctx.fillStyle = '#a855f7';
        else if (n.type === 'route') ctx.fillStyle = '#f87171';
        else ctx.fillStyle = '#38bdf8';
        ctx.fill();
      });

      updateMinimapViewRect(scale, offX, offY);
    }

    function updateMinimapViewRect(scaleParam, offXParam, offYParam) {
      var wrapper = document.getElementById('graph-wrapper');
      var viewRect = document.getElementById('minimap-viewrect');
      var canvas = document.getElementById('minimap-canvas');
      if (!wrapper || !viewRect || !canvas) return;

      var w = canvas.width;
      var h = canvas.height;
      var gw = Math.max(100, graphBounds.width);
      var gh = Math.max(100, graphBounds.height);
      var scale = scaleParam !== undefined ? scaleParam : Math.min((w - 24) / gw, (h - 24) / gh);
      var offX = offXParam !== undefined ? offXParam : (w - gw * scale) / 2 - graphBounds.minX * scale;
      var offY = offYParam !== undefined ? offYParam : (h - gh * scale) / 2 - graphBounds.minY * scale;

      var rect = wrapper.getBoundingClientRect();
      var graphViewX = -canvasPanX / canvasScale;
      var graphViewY = -canvasPanY / canvasScale;
      var graphViewW = rect.width / canvasScale;
      var graphViewH = rect.height / canvasScale;

      var rx = Math.max(0, graphViewX * scale + offX);
      var ry = Math.max(0, graphViewY * scale + offY);
      var rw = Math.min(w, graphViewW * scale);
      var rh = Math.min(h, graphViewH * scale);

      viewRect.style.left = rx + 'px';
      viewRect.style.top = ry + 'px';
      viewRect.style.width = Math.max(14, rw) + 'px';
      viewRect.style.height = Math.max(10, rh) + 'px';
    }

    (function setupMinimapInteraction() {
      var minimap = document.getElementById('graph-minimap');
      if (!minimap) return;

      function panFromMinimap(e) {
        var rect = minimap.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;

        var w = 170;
        var h = 104;
        var gw = Math.max(100, graphBounds.width);
        var gh = Math.max(100, graphBounds.height);
        var scale = Math.min((w - 24) / gw, (h - 24) / gh);
        var offX = (w - gw * scale) / 2 - graphBounds.minX * scale;
        var offY = (h - gh * scale) / 2 - graphBounds.minY * scale;

        var targetGraphX = (mx - offX) / scale;
        var targetGraphY = (my - offY) / scale;

        var wrapper = document.getElementById('graph-wrapper');
        var wrapRect = wrapper.getBoundingClientRect();

        canvasPanX = wrapRect.width / 2 - targetGraphX * canvasScale;
        canvasPanY = wrapRect.height / 2 - targetGraphY * canvasScale;
        applyCanvasTransform();
      }

      var isDraggingMini = false;
      minimap.addEventListener('mousedown', function(e) {
        isDraggingMini = true;
        panFromMinimap(e);
      });
      window.addEventListener('mousemove', function(e) {
        if (isDraggingMini) panFromMinimap(e);
      });
      window.addEventListener('mouseup', function() {
        isDraggingMini = false;
      });
    })();

    // Export Vector SVG
    function exportGraphSvg() {
      var svg = document.getElementById('network-svg');
      if (!svg) return;
      var serializer = new XMLSerializer();
      var source = serializer.serializeToString(svg);
      source = '<?xml version="1.0" standalone="no"?>' + String.fromCharCode(10) + source;
      var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);

      var a = document.createElement('a');
      a.href = url;
      a.download = 'change-firewall-blast-graph-' + Date.now() + '.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Export PNG Image
    function exportGraphPng() {
      var svg = document.getElementById('network-svg');
      if (!svg) return;
      var serializer = new XMLSerializer();
      var source = '<?xml version="1.0" standalone="no"?>' + String.fromCharCode(10) + serializer.serializeToString(svg);
      var img = new Image();
      var svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(svgBlob);

      img.onload = function() {
        var canvas = document.createElement('canvas');
        var vb = svg.viewBox.baseVal;
        var width = vb && vb.width > 0 ? vb.width : 1600;
        var height = vb && vb.height > 0 ? vb.height : 900;
        canvas.width = width * 2;
        canvas.height = height * 2;
        var ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#080b13' : '#ede8dc';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        var pngUrl = canvas.toDataURL('image/png');
        var a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'change-firewall-blast-graph-' + Date.now() + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.src = url;
    }

    // Filter & Search Highlighter
    function filterAndHighlightGraph(autoCenterFirst) {
      var nodes = document.querySelectorAll('.node-g');
      var edges = document.querySelectorAll('.edge-line');

      if (!activeSearchQuery && activeRoleFilter === 'all') {
        nodes.forEach(function(n) { n.classList.remove('is-dimmed', 'is-focused'); });
        edges.forEach(function(e) { e.classList.remove('is-dimmed'); });
        return;
      }

      var matchedNodeIds = new Set();
      var firstMatchedId = null;

      nodes.forEach(function(n) {
        var id = n.dataset.nodeId || '';
        var role = n.dataset.role || '';
        var label = n.dataset.label || '';

        var roleMatch = activeRoleFilter === 'all' || role === activeRoleFilter;
        var searchMatch = !activeSearchQuery || id.toLowerCase().indexOf(activeSearchQuery) !== -1 || label.toLowerCase().indexOf(activeSearchQuery) !== -1;

        if (roleMatch && searchMatch) {
          n.classList.remove('is-dimmed');
          n.classList.add('is-focused');
          matchedNodeIds.add(id);
          if (!firstMatchedId) firstMatchedId = id;
        } else {
          n.classList.add('is-dimmed');
          n.classList.remove('is-focused');
        }
      });

      edges.forEach(function(e) {
        var from = e.dataset.from;
        var to = e.dataset.to;
        if (matchedNodeIds.has(from) || matchedNodeIds.has(to)) {
          e.classList.remove('is-dimmed');
        } else {
          e.classList.add('is-dimmed');
        }
      });

      if (autoCenterFirst && firstMatchedId) {
        centerOnNode(firstMatchedId);
      }
    }

    function renderReport(report) {
      if (!report) return;
      var timestamp = report.timestamp ? new Date(report.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
      var tsEl = document.getElementById('timestamp');
      if (tsEl) tsEl.textContent = 'Last updated: ' + timestamp;

      var risk = report.risk || { score: 0, level: 'LOW', factors: [] };
      var scoreEl = document.getElementById('risk-score');
      if (scoreEl) scoreEl.textContent = (risk.score != null ? risk.score : 0) + ' / 100';
      
      var riskBadge = document.getElementById('risk-badge');
      if (riskBadge) {
        var level = risk.level || 'LOW';
        riskBadge.className = level === 'HIGH' || level === 'CRITICAL' ? 'badge-high' : (level === 'MEDIUM' ? 'badge-medium' : 'badge-low');
        riskBadge.textContent = level + ' RISK';
      }

      var bCountEl = document.getElementById('behavior-count');
      if (bCountEl) bCountEl.textContent = report.behavioralChangesCount != null ? report.behavioralChangesCount : 0;

      var fCountEl = document.getElementById('files-count');
      if (fCountEl) fCountEl.textContent = report.totalFilesChanged != null ? report.totalFilesChanged : 0;

      var linesDiffEl = document.getElementById('lines-diff');
      if (linesDiffEl) {
        var added = report.linesAdded != null ? report.linesAdded : 0;
        var deleted = report.linesDeleted != null ? report.linesDeleted : 0;
        linesDiffEl.innerHTML = '<span style="color: var(--brand-success); font-weight: 600;">+' + added + '</span> / <span style="color: var(--brand-danger); font-weight: 600;">-' + deleted + '</span> lines';
      }

      var maxConsumers = 0;
      var blastMap = report.blastRadiusMap || {};
      for (var b of Object.values(blastMap)) {
        if (b && b.totalConsumers > maxConsumers) maxConsumers = b.totalConsumers;
      }
      var maxBlastEl = document.getElementById('max-blast');
      if (maxBlastEl) maxBlastEl.textContent = maxConsumers;

      // 1. Render Interactive SVG Graph (defensive wrapper)
      try {
        renderVisualGraph(report);
      } catch (graphErr) {
        console.error('Error rendering visual graph:', graphErr);
      }

      // 2. Render Findings
      var findingsContainer = document.getElementById('findings-container');
      if (findingsContainer) {
        var findingsList = report.findings || [];
        if (findingsList.length === 0) {
          findingsContainer.innerHTML = '<div class="finding-card"><p style="color: var(--brand-success); font-weight: 600;">✓ No breaking behavioral changes or contract regressions detected.</p></div>';
        } else {
          findingsContainer.innerHTML = findingsList.map(function(f) {
            var badgeClass = f.severity === 'HIGH' || f.severity === 'CRITICAL' ? 'badge-high' : (f.severity === 'MEDIUM' ? 'badge-medium' : 'badge-low');
            var evItems = (f.evidence || []).map(function(e) { return '<div class="evidence-item">• ' + e + '</div>'; }).join('');
            return '<div class="finding-card">' +
              '<div class="finding-header">' +
                '<span class="finding-title">' + (f.title || 'Behavioral Change') + '</span>' +
                '<span class="' + badgeClass + '">' + (f.severity || 'LOW') + '</span>' +
              '</div>' +
              '<div class="file-tag">' + (f.filePath || '') + '</div>' +
              '<div class="finding-desc">' + (f.description || '') + '</div>' +
              '<div class="evidence-box">' +
                '<div class="evidence-title">Observed Evidence</div>' +
                evItems +
              '</div>' +
              '<div class="recommendation-box">' +
                '<strong>Recommendation:</strong> ' + (f.recommendation || 'Review altered behaviors.') +
              '</div>' +
            '</div>';
          }).join('');
        }
      }

      // 3. Render Suspicious Changes
      var suspiciousContainer = document.getElementById('suspicious-container');
      if (suspiciousContainer) {
        var suspiciousList = report.suspiciousChanges || [];
        if (suspiciousList.length === 0) {
          suspiciousContainer.innerHTML = '<div class="finding-card"><p style="color: var(--brand-success); font-weight: 600;">✓ Zero suspicious anomaly patterns detected in current diff.</p></div>';
        } else {
          suspiciousContainer.innerHTML = suspiciousList.map(function(s) {
            var sEvItems = (s.evidence || []).map(function(e) { return '<div class="evidence-item">• ' + e + '</div>'; }).join('');
            return '<div class="finding-card" style="border-left: 3px solid var(--brand-warning);">' +
              '<div class="finding-header">' +
                '<span class="finding-title">' + (s.title || 'Suspicious Anomaly') + '</span>' +
                '<span class="badge-high">' + (s.severity || 'HIGH') + '</span>' +
              '</div>' +
              '<div class="file-tag">' + (s.filePath || '') + '</div>' +
              '<div class="finding-desc">' + (s.reason || '') + '</div>' +
              '<div class="evidence-box">' +
                '<div class="evidence-title">Suspicion Indicators</div>' +
                sEvItems +
              '</div>' +
            '</div>';
          }).join('');
        }
      }

      // 4. Render Git Timeline
      var timelineContainer = document.getElementById('timeline-container');
      if (timelineContainer) {
        var timelineList = report.timeline || [];
        if (timelineList.length === 0) {
          timelineContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">No Git commit history recorded yet.</p>';
        } else {
          timelineContainer.innerHTML = timelineList.map(function(t) {
            return '<div class="timeline-item">' +
              '<div class="timeline-dot"></div>' +
              '<div class="timeline-date">' + (t.date || '') + ' • <span class="timeline-author">' + (t.hash || '') + '</span> by ' + (t.author || '') + '</div>' +
              '<div class="timeline-title">' + (t.message || '') + '</div>' +
            '</div>';
          }).join('');
        }
      }

      // 5. Render Blast Radius Table
      var blastBody = document.getElementById('blast-table-body');
      if (blastBody) {
        var blastEntries = Object.values(blastMap);
        if (blastEntries.length === 0) {
          blastBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No dependency relationships detected in current diff. Working tree is clean.</td></tr>';
        } else {
          blastBody.innerHTML = blastEntries.map(function(b) {
            var badgeClass = b.level === 'HIGH' ? 'badge-high' : (b.level === 'MEDIUM' ? 'badge-medium' : 'badge-low');
            var directList = b.directDependents || [];
            var routeList = b.affectedRoutes || [];
            return '<tr>' +
              '<td class="mono" style="color: var(--brand-cyan); font-weight: 500;">' + b.filePath + '</td>' +
              '<td>' + directList.length + '</td>' +
              '<td>' + (routeList.length > 0 ? routeList.join(', ') : '<span style="color: var(--text-muted);">None</span>') + '</td>' +
              '<td><strong>' + (b.totalConsumers || 0) + '</strong> consumers</td>' +
              '<td><span class="' + badgeClass + '">' + (b.level || 'LOW') + '</span></td>' +
            '</tr>';
          }).join('');
        }
      }

      // 6. Render Risk Factors
      var riskContainer = document.getElementById('risk-factors-container');
      if (riskContainer) {
        var factors = (risk && risk.factors) || [];
        if (factors.length === 0) {
          riskContainer.innerHTML = '<div class="finding-card"><p style="color: var(--brand-success); font-weight: 600;">✓ Baseline safe risk score.</p></div>';
        } else {
          riskContainer.innerHTML = factors.map(function(rf) {
            return '<div class="finding-card">' +
              '<div class="finding-header">' +
                '<span class="finding-title" style="color: var(--brand-warning);">+' + (rf.scoreContribution || 0) + ' pts: ' + (rf.factor || '') + '</span>' +
              '</div>' +
              '<div class="finding-desc">' + (rf.reason || '') + '</div>' +
            '</div>';
          }).join('');
        }
      }

      // 7. Render Changed Files Table
      var filesBody = document.getElementById('files-table-body');
      if (filesBody) {
        var changedList = report.changedFiles || [];
        if (changedList.length === 0) {
          filesBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">No files modified in working tree. Working tree is clean.</td></tr>';
        } else {
          filesBody.innerHTML = changedList.map(function(cf) {
            return '<tr>' +
              '<td class="mono" style="font-weight: 500;">' + cf.path + '</td>' +
              '<td><span class="badge-medium">' + cf.changeType + '</span></td>' +
              '<td style="color: var(--brand-success); font-weight: 600; font-family: var(--font-jetbrains);">+' + (cf.linesAdded || 0) + '</td>' +
              '<td style="color: var(--brand-danger); font-weight: 600; font-family: var(--font-jetbrains);">-' + (cf.linesDeleted || 0) + '</td>' +
            '</tr>';
          }).join('');
        }
      }

      // 8. Render Crash Simulation Sandbox
      renderCrashSandbox(report);

      // 9. Render AI Agent Remediation Command Center
      renderRemediationCommandCenter(report);
    }

    var cachedRemediation = null;
    var activeRemediationMode = 'safe';

    function renderCrashSandbox(report) {
      var container = document.getElementById('crash-sandbox-container');
      var badge = document.getElementById('crashes-count-badge');
      var traces = (report && report.symbolicTraces) || [];

      if (badge) {
        badge.textContent = traces.length;
        if (traces.length === 0) {
          badge.className = 'badge-tab-pill is-clean';
        } else {
          badge.className = 'badge-tab-pill';
        }
      }

      if (!container) return;

      if (traces.length === 0) {
        container.innerHTML = 
          '<div class="crash-clean-shield">' +
            '<div class="crash-clean-shield-icon">' +
              '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>' +
            '</div>' +
            '<div class="crash-clean-title">Zero Runtime Crashes Proven</div>' +
            '<div class="crash-clean-desc">Change Firewall mathematically verified all downstream call sites across your dependency graph. No null dereferences, missing arguments, or broken export bindings were detected.</div>' +
          '</div>';
        return;
      }

      var cardsHtml = traces.map(function(t, idx) {
        var stepsHtml = (t.proofSteps || []).map(function(step) {
          return '<div class="proof-step-item">• ' + escapeHtml(step) + '</div>';
        }).join('');

        var fixBtnHtml = t.preventativeFix ? 
          '<div class="fix-action-bar">' +
            '<span class="fix-instruction-text"><strong>Suggested Fix:</strong> ' + escapeHtml(t.preventativeFix) + '</span>' +
            '<button class="copy-prompt-primary-btn" style="padding: 4px 10px; font-size: 11px;" onclick="copyCrashByIndex(' + idx + ')">📋 Copy Fix</button>' +
          '</div>' : '';

        return '<div class="crash-card">' +
          '<div class="crash-header">' +
            '<div class="crash-title-group">' +
              '<span class="crash-exception-tag">' + escapeHtml(t.simulatedException || 'Unhandled Runtime Exception') + '</span>' +
              '<span class="crash-location">Consumer File: ' + escapeHtml(t.consumerFile || 'unknown') + (t.consumerLine ? (':' + t.consumerLine) : '') + '</span>' +
            '</div>' +
            '<span class="badge-high">' + escapeHtml(t.failureType || 'CRASH') + '</span>' +
          '</div>' +

          '<div class="call-ladder">' +
            '<div class="ladder-node">' +
              '<span class="ladder-label">Source Module</span>' +
              '<span class="ladder-val">' + escapeHtml(t.sourceFile || 'source') + '</span>' +
            '</div>' +
            '<span class="ladder-arrow">➔</span>' +
            '<div class="ladder-node">' +
              '<span class="ladder-label">Caller Call-Site</span>' +
              '<span class="ladder-val">' + escapeHtml(t.consumerFile || 'consumer') + (t.consumerLine ? (':' + t.consumerLine) : '') + '</span>' +
            '</div>' +
            '<span class="ladder-arrow">➔</span>' +
            '<div class="ladder-node">' +
              '<span class="ladder-label">Runtime Event</span>' +
              '<span class="ladder-val" style="color: var(--brand-danger);">💥 Unhandled Exception</span>' +
            '</div>' +
          '</div>' +

          '<div class="crash-terminal">' +
            '<div class="crash-terminal-topbar">' +
              '<span class="terminal-dot" style="background: #ef4444;"></span>' +
              '<span class="terminal-dot" style="background: #f59e0b;"></span>' +
              '<span class="terminal-dot" style="background: #10b981;"></span>' +
              '<span style="margin-left: 8px;">Simulated Node.js Runtime Stack</span>' +
            '</div>' +
            '<div>Uncaught ' + escapeHtml(t.simulatedException || 'Exception') + '</div>' +
            '<div style="color: #94a3b8; margin-top: 4px;">    at ' + escapeHtml(t.sourceSymbol || 'callee') + ' (' + escapeHtml(t.sourceFile) + ')</div>' +
            '<div style="color: #94a3b8;">    at ' + escapeHtml(t.consumerSymbol || 'caller') + ' (' + escapeHtml(t.consumerFile) + (t.consumerLine ? (':' + t.consumerLine) : '') + ')</div>' +
          '</div>' +

          '<div class="proof-steps-box">' +
            '<div class="proof-steps-title">Symbolic Proof Steps</div>' +
            stepsHtml +
          '</div>' +

          fixBtnHtml +
        '</div>';
      }).join('');

      container.innerHTML = cardsHtml;
    }

    function renderRemediationCommandCenter(report) {
      cachedRemediation = (report && report.remediation) || null;
      var badge = document.getElementById('remediation-badge');

      if (badge) {
        if (cachedRemediation && cachedRemediation.hasIssues) {
          badge.className = 'remediation-badge-status';
          badge.textContent = (cachedRemediation.totalIssuesCount || 1) + ' Issue(s) Detected';
        } else {
          badge.className = 'remediation-badge-status is-clean';
          badge.textContent = '✓ All Contracts Intact';
        }
      }

      updateDisplayedPrompt();
    }

    function updateDisplayedPrompt() {
      var promptEl = document.getElementById('remediation-prompt-text');
      var modeIndicator = document.getElementById('prompt-mode-indicator');
      if (!promptEl) return;

      if (!cachedRemediation) {
        promptEl.textContent = 'All changes conform to expected behavioral contracts. No remediation needed.';
        if (modeIndicator) modeIndicator.textContent = 'Mode: Production Safe';
        return;
      }

      if (activeRemediationMode === 'minimal') {
        promptEl.textContent = cachedRemediation.minimalFixPrompt || 'No minimal fix instructions required.';
        if (modeIndicator) modeIndicator.textContent = 'Mode: Minimal Direct Action Prompt';
      } else if (activeRemediationMode === 'pr') {
        promptEl.textContent = cachedRemediation.prDescription || 'No PR summary available.';
        if (modeIndicator) modeIndicator.textContent = 'Mode: GitHub / GitLab Pull Request Summary';
      } else {
        promptEl.textContent = cachedRemediation.safeFixPrompt || 'All changes conform to expected behavioral contracts. No remediation needed.';
        if (modeIndicator) modeIndicator.textContent = 'Mode: Safe Backwards-Compatible Fix';
      }
    }

    window.switchRemediationMode = function(mode) {
      activeRemediationMode = mode;
      var btnSafe = document.getElementById('btn-remed-safe');
      var btnMin = document.getElementById('btn-remed-minimal');
      var btnPr = document.getElementById('btn-remed-pr');

      if (btnSafe) btnSafe.classList.remove('active');
      if (btnMin) btnMin.classList.remove('active');
      if (btnPr) btnPr.classList.remove('active');

      if (mode === 'minimal' && btnMin) btnMin.classList.add('active');
      else if (mode === 'pr' && btnPr) btnPr.classList.add('active');
      else if (btnSafe) btnSafe.classList.add('active');

      updateDisplayedPrompt();
    };

    window.copyActivePrompt = function() {
      var promptEl = document.getElementById('remediation-prompt-text');
      if (!promptEl) return;
      var text = promptEl.textContent || '';
      if (!text) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showCfToast('✓ Prompt Copied! Ready to paste into Cursor, Claude, or Copilot.');
          var copyBtnText = document.getElementById('copy-btn-text');
          if (copyBtnText) {
            var orig = copyBtnText.textContent;
            copyBtnText.textContent = '✓ Copied to Clipboard!';
            setTimeout(function() { copyBtnText.textContent = orig; }, 2200);
          }
        }).catch(function() {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    };

    window.copyCrashByIndex = function(idx) {
      var traces = (currentReport && currentReport.symbolicTraces) || [];
      var t = traces[idx];
      if (!t || !t.preventativeFix) return;
      var promptText = ['Fix the following runtime crash issue in ' + (t.sourceFile || '') + ':', t.preventativeFix].join(String.fromCharCode(10));
      copyDirectText(promptText, '✓ Crash fix copied to clipboard!');
    };

    function copyDirectText(text, successMsg) {
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showCfToast(successMsg || '✓ Copied to clipboard!');
        }).catch(function() {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    }

    function fallbackCopyText(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showCfToast('✓ Copied to clipboard!');
      } catch (err) {
        alert('Could not copy automatically. Please select text manually.');
      }
      document.body.removeChild(ta);
    }

    function showCfToast(msg) {
      var toast = document.getElementById('cf-toast');
      var toastText = document.getElementById('cf-toast-text');
      if (!toast) return;
      if (toastText) toastText.textContent = msg;
      toast.classList.add('show');
      setTimeout(function() {
        toast.classList.remove('show');
      }, 2800);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // ==========================================
    // God-Level Multi-Scale Graph Layout Engine
    // ==========================================
    function renderVisualGraph(report) {
      var svg = document.getElementById('network-svg');
      var svgDefs = document.getElementById('svg-defs');
      var svgRadarGroup = document.getElementById('svg-radar-rings');
      var svgClusterGroup = document.getElementById('svg-clusters');
      var svgNodesGroup = document.getElementById('svg-nodes');
      var svgEdgesGroup = document.getElementById('svg-edges');

      if (svgRadarGroup) svgRadarGroup.innerHTML = '';
      if (svgClusterGroup) svgClusterGroup.innerHTML = '';
      if (svgNodesGroup) svgNodesGroup.innerHTML = '';
      if (svgEdgesGroup) svgEdgesGroup.innerHTML = '';

      var blastEntries = Object.entries((report && report.blastRadiusMap) || {});
      var statsChip = document.getElementById('graph-stats-chip');
      if (blastEntries.length === 0) {
        if (statsChip) statsChip.textContent = '0 nodes • 0 edges';
        if (svgNodesGroup) {
          svgNodesGroup.innerHTML = '<text x="750" y="450" text-anchor="middle" fill="var(--text-muted)" font-family="var(--font-inter)" font-size="15" font-weight="500">No dependency blast radius detected in working tree (0 changed files).</text>';
        }
        drawMinimap();
        return;
      }

      var nodes = new Map();
      var edges = [];
      var edgeKeySet = new Set();

      function getNodeBehaviorRole(filePath) {
        if (report && report.behaviorGraph && report.behaviorGraph.nodes) {
          var bn = report.behaviorGraph.nodes[filePath] || report.behaviorGraph.nodes[normalizeClientPath(filePath)];
          if (bn && bn.role) return bn.role;
        }
        var lower = filePath.toLowerCase();
        if (lower.includes('/routes/') || lower.includes('/api/') || lower.endsWith('route.ts') || lower.endsWith('route.js') || lower.includes('controller')) return 'API_ROUTE';
        if (lower.includes('/services/') || lower.includes('/service/') || lower.endsWith('.service.ts') || lower.endsWith('.service.js')) return 'SERVICE';
        if (lower.includes('auth') || lower.includes('guard') || lower.includes('middleware') || lower.includes('permission')) return 'AUTH_BOUNDARY';
        if (lower.includes('model') || lower.includes('schema') || lower.includes('prisma') || lower.includes('entities')) return 'DATABASE_MODEL';
        if (lower.includes('.test.') || lower.includes('.spec.') || lower.includes('/tests/') || lower.includes('/__tests__/')) return 'TEST_SUITE';
        return 'INTERNAL_LOGIC';
      }

      function resolveVisualType(file, isSource) {
        if (isSource) return 'source';
        var r = getNodeBehaviorRole(file);
        if (r === 'API_ROUTE') return 'route';
        if (r === 'SERVICE') return 'service';
        if (r === 'AUTH_BOUNDARY') return 'auth';
        if (r === 'DATABASE_MODEL') return 'model';
        if (r === 'TEST_SUITE') return 'test';
        return 'consumer';
      }

      // 1. Collect all nodes
      blastEntries.forEach(function(entry) {
        var file = entry[0];
        var blast = entry[1];
        var bRole = getNodeBehaviorRole(file);
        nodes.set(file, {
          id: file,
          label: getFileBaseName(file),
          fullPath: file,
          type: 'source',
          behaviorRole: bRole,
          blast: blast,
        });
      });

      var behaviorEdgeMap = new Map();
      if (report && report.behaviorGraph && report.behaviorGraph.edges) {
        report.behaviorGraph.edges.forEach(function(e) {
          behaviorEdgeMap.set(e.source + '->' + e.target, e);
          behaviorEdgeMap.set(normalizeClientPath(e.source) + '->' + normalizeClientPath(e.target), e);
        });
      }

      blastEntries.forEach(function(entry) {
        var file = entry[0];
        var blast = entry[1];
        (blast.directDependents || []).forEach(function(dep) {
          if (!nodes.has(dep)) {
            var bRole = getNodeBehaviorRole(dep);
            var vType = resolveVisualType(dep, false);
            nodes.set(dep, {
              id: dep,
              label: getFileBaseName(dep),
              fullPath: dep,
              type: vType,
              behaviorRole: bRole,
              blast: (report.blastRadiusMap && report.blastRadiusMap[dep]) || { totalConsumers: 0, directDependents: [] },
            });
          }
          var edgeKey = file + '->' + dep;
          if (!edgeKeySet.has(edgeKey) && file !== dep) {
            edgeKeySet.add(edgeKey);
            var bEdge = behaviorEdgeMap.get(file + '->' + dep) || behaviorEdgeMap.get(dep + '->' + file);
            edges.push({
              from: file,
              to: dep,
              relationship: bEdge ? bEdge.relationship : 'imports',
              details: bEdge ? bEdge.details : undefined
            });
          }
        });

        (blast.affectedRoutes || []).forEach(function(route) {
          if (!nodes.has(route)) {
            var bRole = getNodeBehaviorRole(route);
            nodes.set(route, {
              id: route,
              label: getFileBaseName(route),
              fullPath: route,
              type: 'route',
              behaviorRole: bRole,
              blast: (report.blastRadiusMap && report.blastRadiusMap[route]) || { totalConsumers: 0, directDependents: [] },
            });
          }
        });
      });

      // 2. Filter by Blast Scope
      var filteredNodes = new Map(nodes);
      var filteredEdges = edges;

      if (activeBlastScope === '1hop') {
        var keepIds = new Set();
        nodes.forEach(function(n) {
          if (n.type === 'source') {
            keepIds.add(n.id);
            (n.blast.directDependents || []).forEach(function(d) { keepIds.add(d); });
          }
        });
        filteredNodes = new Map();
        nodes.forEach(function(n, id) {
          if (keepIds.has(id)) filteredNodes.set(id, n);
        });
        filteredEdges = edges.filter(function(e) { return keepIds.has(e.from) && keepIds.has(e.to); });
      } else if (activeBlastScope === 'routes') {
        var keepIds = new Set();
        nodes.forEach(function(n) {
          if (n.type === 'source' || n.type === 'route') keepIds.add(n.id);
        });
        filteredNodes = new Map();
        nodes.forEach(function(n, id) {
          if (keepIds.has(id)) filteredNodes.set(id, n);
        });
        filteredEdges = edges.filter(function(e) { return keepIds.has(e.from) && keepIds.has(e.to); });
      }

      // Update Global State
      graphNodesMap = filteredNodes;
      graphEdgesList = filteredEdges;

      // Update HUD stats
      var statsChip = document.getElementById('graph-stats-chip');
      if (statsChip) {
        statsChip.textContent = filteredNodes.size + ' nodes • ' + filteredEdges.length + ' edges';
      }

      // 3. Build Adjacency Graph
      var incoming = new Map();
      var outgoing = new Map();
      filteredNodes.forEach(function(n) {
        incoming.set(n.id, new Set());
        outgoing.set(n.id, new Set());
      });
      filteredEdges.forEach(function(e) {
        if (incoming.has(e.to)) incoming.get(e.to).add(e.from);
        if (outgoing.has(e.from)) outgoing.get(e.from).add(e.to);
      });
      graphIncomingMap = incoming;
      graphOutgoingMap = outgoing;

      // 4. Compute Topological Ranks (Sugiyama DAG)
      var ranks = new Map();
      var inDegrees = new Map();
      filteredNodes.forEach(function(n) { inDegrees.set(n.id, incoming.get(n.id).size); });

      var queue = [];
      filteredNodes.forEach(function(n) {
        if (inDegrees.get(n.id) === 0) {
          ranks.set(n.id, 0);
          queue.push(n.id);
        }
      });

      if (queue.length === 0 && filteredNodes.size > 0) {
        var minId = null;
        var minD = Infinity;
        filteredNodes.forEach(function(n) {
          var d = inDegrees.get(n.id);
          if (d < minD) { minD = d; minId = n.id; }
        });
        ranks.set(minId, 0);
        queue.push(minId);
      }

      var maxIter = filteredNodes.size * 2;
      var visitCounters = new Map();

      while (queue.length > 0) {
        var u = queue.shift();
        var uRank = ranks.get(u) || 0;
        var targets = outgoing.get(u) || new Set();

        targets.forEach(function(v) {
          var currentVRank = ranks.has(v) ? ranks.get(v) : -1;
          var count = (visitCounters.get(v) || 0) + 1;
          visitCounters.set(v, count);

          if (uRank + 1 > currentVRank && count <= maxIter) {
            ranks.set(v, uRank + 1);
            queue.push(v);
          }
        });
      }

      filteredNodes.forEach(function(n) {
        if (!ranks.has(n.id)) ranks.set(n.id, 0);
        n.rank = ranks.get(n.id);
      });

      var maxRank = 0;
      filteredNodes.forEach(function(n) { if (n.rank > maxRank) maxRank = n.rank; });
      filteredNodes.forEach(function(n) {
        if (n.type === 'route' && outgoing.get(n.id).size === 0) {
          n.rank = Math.max(n.rank, maxRank);
        }
      });
      maxRank = 0;
      filteredNodes.forEach(function(n) { if (n.rank > maxRank) maxRank = n.rank; });

      // Node card dimensions
      var nodeW = 175;
      var nodeH = 48;
      var totalSvgWidth = 1200;
      var totalSvgHeight = 650;

      // ==========================================
      // LAYOUT 1: Hierarchical DAG with Multi-Lane Wrapping
      // ==========================================
      if (currentLayout === 'dag') {
        var columns = Array.from({ length: maxRank + 1 }, function() { return []; });
        filteredNodes.forEach(function(n) { columns[n.rank].push(n); });

        var nodeSpacingY = 78;
        var cumulativeX = 140;
        var maxOverallY = 560;

        columns.forEach(function(col, cIdx) {
          if (cIdx > 0) {
            col.sort(function(a, b) {
              var aParents = Array.from(incoming.get(a.id) || []);
              var bParents = Array.from(incoming.get(b.id) || []);
              var aAvgY = aParents.length ? aParents.reduce(function(sum, pId) { return sum + (filteredNodes.get(pId) ? filteredNodes.get(pId).y : 0); }, 0) / aParents.length : 0;
              var bAvgY = bParents.length ? bParents.reduce(function(sum, pId) { return sum + (filteredNodes.get(pId) ? filteredNodes.get(pId).y : 0); }, 0) / bParents.length : 0;
              return aAvgY - bAvgY || a.label.localeCompare(b.label);
            });
          } else {
            col.sort(function(a, b) { return a.label.localeCompare(b.label); });
          }

          var numLanes = col.length > 8 ? Math.min(4, Math.ceil(Math.sqrt(col.length / 3))) : 1;
          var perLane = Math.ceil(col.length / numLanes);
          var laneWidth = 195;

          var colHeight = (perLane - 1) * nodeSpacingY;
          if (colHeight + 160 > maxOverallY) maxOverallY = colHeight + 160;

          col.forEach(function(node, rIdx) {
            var lane = Math.floor(rIdx / perLane);
            var row = rIdx % perLane;
            node.x = cumulativeX + lane * laneWidth;
            node.y = 80 + row * nodeSpacingY;
          });

          cumulativeX += numLanes * laneWidth + 140;
        });

        totalSvgWidth = Math.max(1200, cumulativeX + 60);
        totalSvgHeight = Math.max(650, maxOverallY);
      }

      // ==========================================
      // LAYOUT 2: Concentric Radial Blast Radar
      // ==========================================
      else if (currentLayout === 'radial') {
        var cx = 850;
        var cy = 600;
        var rings = [[], [], [], []]; // 0: sources, 1: direct, 2: transitive, 3: routes

        filteredNodes.forEach(function(n) {
          if (n.type === 'source') rings[0].push(n);
          else if (n.type === 'route') rings[3].push(n);
          else if (n.rank === 1) rings[1].push(n);
          else rings[2].push(n);
        });

        var radii = [140, 340, 540, 740];
        var ringLabels = ['Core Regressions', 'Tier 1 Dependents', 'Transitive Consumers', 'Public Endpoints'];

        if (svgRadarGroup) {
          radii.forEach(function(r, idx) {
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', String(cx));
            circle.setAttribute('cy', String(cy));
            circle.setAttribute('r', String(r));
            circle.setAttribute('class', 'radar-ring');
            svgRadarGroup.appendChild(circle);

            var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', String(cx + 10));
            txt.setAttribute('y', String(cy - r + 15));
            txt.setAttribute('class', 'radar-label');
            txt.textContent = ringLabels[idx];
            svgRadarGroup.appendChild(txt);
          });
        }

        rings.forEach(function(ringNodes, ringIdx) {
          var r = radii[ringIdx];
          var count = ringNodes.length;
          var angleStep = (2 * Math.PI) / Math.max(count, 1);
          ringNodes.forEach(function(node, i) {
            var angle = i * angleStep - Math.PI / 2;
            node.x = cx + Math.cos(angle) * r;
            node.y = cy + Math.sin(angle) * r;
          });
        });

        totalSvgWidth = cx * 2;
        totalSvgHeight = cy * 2;
      }

      // ==========================================
      // LAYOUT 3: Organic Force Physics Simulation
      // ==========================================
      else if (currentLayout === 'force') {
        var cx = 750;
        var cy = 480;
        var fIdx = 0;
        filteredNodes.forEach(function(n) {
          var angle = (fIdx++ / filteredNodes.size) * Math.PI * 2;
          var dist = 120 + Math.random() * 260;
          n.x = cx + Math.cos(angle) * dist;
          n.y = cy + Math.sin(angle) * dist;
          n.vx = 0;
          n.vy = 0;
        });

        var nodeArr = Array.from(filteredNodes.values());
        var kRep = 42000;
        var kSpring = 0.04;
        var l0 = 200;
        var damping = 0.78;

        for (var iter = 0; iter < 60; iter++) {
          for (var i = 0; i < nodeArr.length; i++) {
            for (var j = i + 1; j < nodeArr.length; j++) {
              var a = nodeArr[i];
              var b = nodeArr[j];
              var dx = b.x - a.x;
              var dy = b.y - a.y;
              var dist = Math.hypot(dx, dy) || 1;
              var f = kRep / (dist * dist);
              var fx = (dx / dist) * f;
              var fy = (dy / dist) * f;
              a.vx -= fx;
              a.vy -= fy;
              b.vx += fx;
              b.vy += fy;
            }
          }

          filteredEdges.forEach(function(e) {
            var a = filteredNodes.get(e.from);
            var b = filteredNodes.get(e.to);
            if (!a || !b) return;
            var dx = b.x - a.x;
            var dy = b.y - a.y;
            var dist = Math.hypot(dx, dy) || 1;
            var f = (dist - l0) * kSpring;
            var fx = (dx / dist) * f;
            var fy = (dy / dist) * f;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          });

          nodeArr.forEach(function(n) {
            n.vx += (cx - n.x) * 0.008;
            n.vy += (cy - n.y) * 0.008;
            n.x += n.vx * 0.5;
            n.y += n.vy * 0.5;
            n.vx *= damping;
            n.vy *= damping;
          });
        }

        totalSvgWidth = 1500;
        totalSvgHeight = 960;
      }

      // ==========================================
      // LAYOUT 4: Directory Compartment Clusters
      // ==========================================
      else if (currentLayout === 'cluster') {
        var groups = new Map();
        filteredNodes.forEach(function(n) {
          var dir = getPathDirectory(n.fullPath);
          if (!groups.has(dir)) groups.set(dir, []);
          groups.get(dir).push(n);
        });

        var clusterCols = Math.min(3, Math.ceil(Math.sqrt(groups.size)));
        var curCol = 0;
        var offsetX = 80;
        var offsetY = 80;
        var boxPad = 28;

        groups.forEach(function(dirNodes, dirName) {
          var itemsPerRow = Math.min(3, Math.ceil(Math.sqrt(dirNodes.length)));
          var boxW = itemsPerRow * (nodeW + 20) + boxPad * 2;
          var boxH = Math.ceil(dirNodes.length / itemsPerRow) * (nodeH + 20) + boxPad * 2 + 20;

          if (svgClusterGroup) {
            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', String(offsetX));
            rect.setAttribute('y', String(offsetY));
            rect.setAttribute('width', String(boxW));
            rect.setAttribute('height', String(boxH));
            rect.setAttribute('class', 'cluster-rect');
            svgClusterGroup.appendChild(rect);

            var title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            title.setAttribute('x', String(offsetX + boxPad));
            title.setAttribute('y', String(offsetY + 22));
            title.setAttribute('class', 'cluster-label');
            title.textContent = '📁 ' + dirName + ' (' + dirNodes.length + ')';
            svgClusterGroup.appendChild(title);
          }

          dirNodes.forEach(function(node, idx) {
            var r = Math.floor(idx / itemsPerRow);
            var c = idx % itemsPerRow;
            node.x = offsetX + boxPad + c * (nodeW + 20) + nodeW / 2;
            node.y = offsetY + boxPad + 30 + r * (nodeH + 20) + nodeH / 2;
          });

          curCol++;
          offsetX += boxW + 40;
          if (curCol >= clusterCols) {
            curCol = 0;
            offsetX = 80;
            offsetY += boxH + 40;
          }
        });

        totalSvgWidth = Math.max(1200, offsetX + 600);
        totalSvgHeight = Math.max(650, offsetY + 300);
      }

      // Calculate Graph Bounds for Minimap
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      filteredNodes.forEach(function(n) {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
      });
      graphBounds = {
        minX: Math.max(0, minX - 100),
        minY: Math.max(0, minY - 100),
        maxX: maxX + 100,
        maxY: maxY + 100,
        width: Math.max(600, maxX - minX + 200),
        height: Math.max(400, maxY - minY + 200)
      };

      // Update SVG viewBox and dimensions
      svg.setAttribute('viewBox', '0 0 ' + totalSvgWidth + ' ' + totalSvgHeight);

      // 5. Draw Clean, Smooth Connecting Edges
      var isDark = document.documentElement.classList.contains('dark');
      var edgeTooltip = document.getElementById('edge-tooltip');

      filteredEdges.forEach(function(edge, edgeIdx) {
        var fromNode = filteredNodes.get(edge.from);
        var toNode = filteredNodes.get(edge.to);
        if (!fromNode || !toNode) return;

        var getColor = function(type) {
          if (type === 'source') return isDark ? '#a855f7' : '#6d28d9';
          if (type === 'route') return isDark ? '#f43f5e' : '#dc2626';
          if (type === 'service') return isDark ? '#10b981' : '#059669';
          if (type === 'auth') return isDark ? '#f59e0b' : '#d97706';
          if (type === 'model') return isDark ? '#3b82f6' : '#2563eb';
          if (type === 'test') return isDark ? '#84cc16' : '#65a30d';
          return isDark ? '#38bdf8' : '#0369a1';
        };

        var colorFrom = getColor(fromNode.type);
        var colorTo = getColor(toNode.type);

        var gradId = 'edge-grad-' + edgeIdx;
        var grad = document.getElementById(gradId);
        if (!grad) {
          grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
          grad.setAttribute('id', gradId);
          grad.setAttribute('gradientUnits', 'userSpaceOnUse');
          svgDefs.appendChild(grad);
        }
        grad.innerHTML = '<stop offset="0%" stop-color="' + colorFrom + '" stop-opacity="' + (isDark ? 0.75 : 0.6) + '" />' +
          '<stop offset="100%" stop-color="' + colorTo + '" stop-opacity="' + (isDark ? 0.95 : 0.85) + '" />';

        var geom = getEdgeGeometry(fromNode, toNode, currentLayout);
        grad.setAttribute('x1', String(geom.x1));
        grad.setAttribute('y1', String(geom.y1));
        grad.setAttribute('x2', String(geom.x2));
        grad.setAttribute('y2', String(geom.y2));

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', geom.d);
        path.setAttribute('class', 'edge-line');
        path.setAttribute('stroke', 'url(#' + gradId + ')');
        path.setAttribute('marker-end', 'url(#arrow)');
        path.dataset.from = fromNode.id;
        path.dataset.to = toNode.id;

        // Interactive Edge Hover Tooltip
        path.addEventListener('mouseenter', function(ev) {
          if (edgeTooltip) {
            edgeTooltip.style.display = 'block';
            var relText = edge.relationship || (fromNode.type === 'source' ? 'imports' : 'downstream');
            if (edge.details) relText += ': ' + edge.details;
            edgeTooltip.innerHTML = '<span style="color: ' + colorFrom + '; font-weight:700;">' + fromNode.label + '</span> ➔ <span style="color: ' + colorTo + '; font-weight:700;">' + toNode.label + '</span> <span style="color: var(--text-muted); font-size: 10px;">(' + relText + ')</span>';
            var wrapRect = document.getElementById('graph-wrapper').getBoundingClientRect();
            edgeTooltip.style.left = (ev.clientX - wrapRect.left) + 'px';
            edgeTooltip.style.top = (ev.clientY - wrapRect.top) + 'px';
          }
        });
        path.addEventListener('mousemove', function(ev) {
          if (edgeTooltip) {
            var wrapRect = document.getElementById('graph-wrapper').getBoundingClientRect();
            edgeTooltip.style.left = (ev.clientX - wrapRect.left) + 'px';
            edgeTooltip.style.top = (ev.clientY - wrapRect.top) + 'px';
          }
        });
        path.addEventListener('mouseleave', function() {
          if (edgeTooltip) edgeTooltip.style.display = 'none';
        });

        svgEdgesGroup.appendChild(path);
      });

      // 6. Draw Nodes with Icons, Badges & Drag Listeners
      filteredNodes.forEach(function(node) {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', 'translate(' + (node.x - nodeW / 2) + ', ' + (node.y - nodeH / 2) + ')');
        g.setAttribute('class', 'node-g');
        g.dataset.nodeId = node.id;
        g.dataset.role = node.type;
        g.dataset.label = node.label;

        var fill = isDark ? '#0e1322' : '#ffffff';
        var stroke = isDark ? '#38bdf8' : '#0369a1';
        var iconColor = stroke;
        var typeBadge = 'Consumer';
        var iconPath = 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5';

        if (node.type === 'source') {
          stroke = isDark ? '#a855f7' : '#6d28d9';
          iconColor = stroke;
          typeBadge = 'Modified';
          iconPath = 'M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z';
        } else if (node.type === 'route') {
          stroke = isDark ? '#f43f5e' : '#dc2626';
          iconColor = stroke;
          typeBadge = 'API Route';
          iconPath = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01';
        } else if (node.type === 'service') {
          stroke = isDark ? '#10b981' : '#059669';
          iconColor = stroke;
          typeBadge = 'Service';
          iconPath = 'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6';
        } else if (node.type === 'auth') {
          stroke = isDark ? '#f59e0b' : '#d97706';
          iconColor = stroke;
          typeBadge = 'Auth Guard';
          iconPath = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';
        } else if (node.type === 'model') {
          stroke = isDark ? '#3b82f6' : '#2563eb';
          iconColor = stroke;
          typeBadge = 'DB Model';
          iconPath = 'M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4';
        } else if (node.type === 'test') {
          stroke = isDark ? '#84cc16' : '#65a30d';
          iconColor = stroke;
          typeBadge = 'Test Suite';
          iconPath = 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11';
        }

        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', String(nodeW));
        rect.setAttribute('height', String(nodeH));
        rect.setAttribute('rx', '12');
        rect.setAttribute('fill', fill);
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('stroke-width', '1.6');
        rect.setAttribute('class', 'node-rect');

        var iconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        iconG.setAttribute('transform', 'translate(10, 16)');
        var iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        iconSvg.setAttribute('d', iconPath);
        iconSvg.setAttribute('fill', 'none');
        iconSvg.setAttribute('stroke', iconColor);
        iconSvg.setAttribute('stroke-width', '1.8');
        iconSvg.setAttribute('stroke-linecap', 'round');
        iconSvg.setAttribute('stroke-linejoin', 'round');
        iconSvg.setAttribute('transform', 'scale(0.7)');
        iconG.appendChild(iconSvg);

        var titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '32');
        titleText.setAttribute('y', '21');
        titleText.setAttribute('class', 'node-text');
        titleText.textContent = node.label.length > 15 ? node.label.slice(0, 14) + '…' : node.label;

        var subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subText.setAttribute('x', '32');
        subText.setAttribute('y', '36');
        subText.setAttribute('class', 'node-subtext');
        subText.textContent = '[' + typeBadge + '] ' + node.blast.totalConsumers + ' deps';

        g.appendChild(rect);
        g.appendChild(iconG);
        g.appendChild(titleText);
        g.appendChild(subText);

        // Click to focus blast radius & inspect
        g.addEventListener('click', function(ev) {
          ev.stopPropagation();
          inspectNode(node, report, incoming, outgoing);

          var connectedNodes = new Set([node.id]);
          var connectedEdges = new Set();

          // Transitive Downstream
          var downQueue = [node.id];
          while (downQueue.length) {
            var curr = downQueue.shift();
            (outgoing.get(curr) || []).forEach(function(child) {
              connectedEdges.add(curr + '->' + child);
              if (!connectedNodes.has(child)) {
                connectedNodes.add(child);
                downQueue.push(child);
              }
            });
          }

          // Transitive Upstream
          var upQueue = [node.id];
          while (upQueue.length) {
            var curr = upQueue.shift();
            (incoming.get(curr) || []).forEach(function(parent) {
              connectedEdges.add(parent + '->' + curr);
              if (!connectedNodes.has(parent)) {
                connectedNodes.add(parent);
                upQueue.push(parent);
              }
            });
          }

          // Dim unrelated nodes and highlight active path
          document.querySelectorAll('.node-g').forEach(function(el) {
            var nId = el.dataset.nodeId;
            if (connectedNodes.has(nId)) {
              el.classList.remove('is-dimmed');
              el.classList.add('is-focused');
            } else {
              el.classList.add('is-dimmed');
              el.classList.remove('is-focused');
            }
          });

          document.querySelectorAll('.edge-line').forEach(function(el) {
            var key = el.dataset.from + '->' + el.dataset.to;
            if (connectedEdges.has(key)) {
              el.classList.remove('is-dimmed');
              el.classList.add('active');
              el.setAttribute('marker-end', 'url(#arrow-active)');
            } else {
              el.classList.add('is-dimmed');
              el.classList.remove('active');
              el.setAttribute('marker-end', 'url(#arrow)');
            }
          });
        });

        svgNodesGroup.appendChild(g);
      });

      // Canvas click clears selection & resets focus
      svg.onclick = function(e) {
        if (e.target.tagName === 'svg' || e.target.id === 'viewport-group' || e.target.id === 'svg-edges' || e.target.id === 'svg-radar-rings' || e.target.id === 'svg-clusters') {
          document.querySelectorAll('.node-g').forEach(function(n) { n.classList.remove('is-dimmed', 'is-focused'); });
          document.querySelectorAll('.edge-line').forEach(function(el) {
            el.classList.remove('is-dimmed', 'active');
            el.setAttribute('marker-end', 'url(#arrow)');
          });
          document.getElementById('inspector-card').style.display = 'none';
        }
      };

      // Draw initial minimap radar
      drawMinimap();

      // Initial auto-fit on load
      setTimeout(resetCanvasView, 60);
    }

    // Interactive Inspector with Breadcrumb Trace Route
    function inspectNode(node, report, incoming, outgoing) {
      var card = document.getElementById('inspector-card');
      card.style.display = 'block';
      document.getElementById('inspector-title').textContent = node.fullPath;
      
      var badge = document.getElementById('inspector-badge');
      var roleText = (node.behaviorRole || node.type).toUpperCase().replace(/_/g, ' ');
      badge.className = node.type === 'source' ? 'badge-medium' : (node.type === 'route' ? 'badge-high' : 'badge-low');
      badge.textContent = roleText;

      var dirCount = (node.blast && node.blast.directDependents) ? node.blast.directDependents.length : 0;
      var totalCount = (node.blast && node.blast.totalConsumers) != null ? node.blast.totalConsumers : 0;
      document.getElementById('inspector-desc').textContent = 'Role: ' + roleText + ' • Direct Dependents: ' + dirCount + ' • Total Blast Radius: ' + totalCount + ' consumer(s)';

      // Build interactive blast chain breadcrumbs
      var breadcrumbEl = document.getElementById('inspector-breadcrumb');
      if (incoming && outgoing) {
        var chain = [node.id];
        var curr = node.id;
        while (incoming.has(curr) && incoming.get(curr).size > 0) {
          var parent = Array.from(incoming.get(curr))[0];
          chain.unshift(parent);
          curr = parent;
          if (chain.length > 5) break;
        }
        curr = node.id;
        while (outgoing.has(curr) && outgoing.get(curr).size > 0) {
          var child = Array.from(outgoing.get(curr))[0];
          chain.push(child);
          curr = child;
          if (chain.length > 8) break;
        }

        if (chain.length > 1) {
          breadcrumbEl.style.display = 'flex';
          breadcrumbEl.innerHTML = '<span style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-right: 4px;">Blast Path:</span>' +
            chain.map(function(cId, idx) {
              var label = getFileBaseName(cId);
              var isCurrent = cId === node.id;
              var arrow = idx < chain.length - 1 ? '<span style="color: var(--text-muted); font-size: 11px;">➔</span>' : '';
              return '<button class="breadcrumb-pill ' + (isCurrent ? 'active' : '') + '" data-center-node="' + encodeURIComponent(cId) + '">' + label + '</button> ' + arrow;
            }).join('');
        } else {
          breadcrumbEl.style.display = 'none';
        }
      }

      var findings = (report.findings || []).filter(function(f) { return f.filePath === node.fullPath || (f.affectedFiles && f.affectedFiles.indexOf(node.fullPath) !== -1); });
      var detailsHtml = '';
      if (findings.length > 0) {
        detailsHtml += '<div style="font-weight: 700; margin-bottom: 6px; color: var(--brand-cyan);">Associated Findings:</div>';
        findings.forEach(function(f) {
          detailsHtml += '<div style="margin-bottom: 6px; padding: 8px 12px; background: var(--surface-card); border-radius: 8px; border: 1px solid var(--border-subtle); font-family: var(--font-jetbrains); font-size: 12px;">• <strong>' + f.title + '</strong>: ' + f.description + '</div>';
        });
      } else {
        detailsHtml += '<div style="color: var(--text-muted); font-size: 13px;">No breaking behavioral findings directly rooted in this node.</div>';
      }

      // Render All Downstream Consumers (Complete List without Truncation)
      var directDeps = (node.blast && node.blast.directDependents) || [];
      var indirectDeps = (node.blast && node.blast.indirectDependents) || [];
      var allDeps = directDeps.concat(indirectDeps.filter(function(x) { return directDeps.indexOf(x) === -1; }));

      if (allDeps.length > 0) {
        detailsHtml += '<div style="margin-top: 16px; margin-bottom: 6px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--brand-cyan); display: flex; justify-content: space-between; align-items: center;">' +
          '<span>All Downstream Consumers (' + allDeps.length + ' total):</span>' +
          '<span style="font-size: 10px; font-weight: 500; color: var(--text-muted);">Click to jump</span>' +
        '</div>';
        detailsHtml += '<div style="display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; padding-right: 4px;">';
        allDeps.forEach(function(dep) {
          var isDirect = directDeps.indexOf(dep) !== -1;
          var depRole = (report.behaviorGraph && report.behaviorGraph.nodes && (report.behaviorGraph.nodes[dep] || report.behaviorGraph.nodes[normalizeClientPath(dep)]))?.role || (isDirect ? 'DIRECT' : 'INDIRECT');
          detailsHtml += '<button class="consumer-jump-btn" data-center-node="' + encodeURIComponent(dep) + '" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; width: 100%; text-align: left; background: var(--surface-card); border: 1px solid var(--border-subtle); border-radius: 6px; cursor: pointer; transition: all 0.2s;">' +
            '<span style="font-family: var(--font-jetbrains); font-size: 12px; color: var(--text-normal); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + dep + '</span>' +
            '<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ' + (isDirect ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-hover)') + '; color: ' + (isDirect ? 'var(--brand-cyan)' : 'var(--text-muted)') + '; font-weight: 600; white-space: nowrap; margin-left: 8px;">' + depRole.replace(/_/g, ' ') + '</span>' +
          '</button>';
        });
        detailsHtml += '</div>';
      }

      // Critical Execution Paths
      if (report.behaviorGraph && report.behaviorGraph.criticalPaths) {
        var touchingPaths = report.behaviorGraph.criticalPaths.filter(function(cp) {
          return cp.steps && cp.steps.some(function(s) {
            return s === node.id || s === node.fullPath || s === normalizeClientPath(node.fullPath);
          });
        });
        if (touchingPaths.length > 0) {
          detailsHtml += '<div style="margin-top: 16px; margin-bottom: 6px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--brand-danger);">' +
            '⚡ Critical Execution Paths (' + touchingPaths.length + '):' +
          '</div>';
          touchingPaths.forEach(function(cp) {
            detailsHtml += '<div style="margin-bottom: 6px; padding: 8px 12px; background: rgba(244, 63, 94, 0.08); border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.2); font-size: 12px;">' +
              '<div style="font-weight: 700; color: var(--brand-danger);">' + cp.name + ' <span style="font-size: 10px; padding: 1px 5px; border-radius: 4px; background: rgba(244, 63, 94, 0.2);">' + cp.riskLevel + '</span></div>' +
              '<div style="color: var(--text-muted); font-size: 11px; margin-top: 2px;">' + cp.description + '</div>' +
              '<div style="color: var(--brand-cyan); font-family: var(--font-jetbrains); font-size: 10px; margin-top: 4px;">' + cp.steps.join(' ➔ ') + '</div>' +
            '</div>';
          });
        }
      }

      document.getElementById('inspector-details').innerHTML = detailsHtml;

      var inspectorDetails = document.getElementById('inspector-details');
      if (inspectorDetails && !inspectorDetails.dataset.listenerAttached) {
        inspectorDetails.dataset.listenerAttached = 'true';
        inspectorDetails.addEventListener('click', function(e) {
          var btn = e.target.closest('.consumer-jump-btn');
          if (btn && btn.dataset.centerNode) {
            centerOnNode(decodeURIComponent(btn.dataset.centerNode));
          }
        });
      }
    }

    var breadcrumbEl = document.getElementById('inspector-breadcrumb');
    if (breadcrumbEl) {
      breadcrumbEl.addEventListener('click', function(e) {
        var btn = e.target.closest('.breadcrumb-pill');
        if (btn && btn.dataset.centerNode) {
          centerOnNode(decodeURIComponent(btn.dataset.centerNode));
        }
      });
    }

    // Initial render
    try {
      renderReport(currentReport);
    } catch (err) {
      console.error("Initial renderReport error:", err);
    }

    // Fallback fetch: If initial report was empty, fetch /api/report
    if (!currentReport || !currentReport.risk) {
      fetch('/api/report')
        .then(function(res) { return res.json(); })
        .then(function(data) {
          currentReport = data;
          renderReport(data);
        })
        .catch(function(err) {
          console.error("Failed to fetch /api/report:", err);
        });
    }

    // Live Server-Sent Events stream
    if (typeof EventSource !== 'undefined') {
      var evtSource = new EventSource('/api/events');
      evtSource.onmessage = function(e) {
        try {
          var updated = JSON.parse(e.data);
          currentReport = updated;
          renderReport(updated);
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };
      evtSource.onerror = function() {
        var ind = document.getElementById('live-indicator');
        if (ind) ind.style.display = 'none';
      };
    }

    window.scrollTabs = function(distance) {
      var bar = document.getElementById('main-tabs-bar');
      if (bar) {
        bar.scrollBy({ left: distance, behavior: 'smooth' });
      }
    };

    var mainTabsBar = document.getElementById('main-tabs-bar');
    if (mainTabsBar) {
      mainTabsBar.addEventListener('wheel', function(e) {
        if (e.deltaY !== 0) {
          mainTabsBar.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });
    }

    window.switchTab = function(tabId, el) {
      var targetBtn = el || (window.event ? (window.event.currentTarget || window.event.target) : null);
      document.querySelectorAll('.tab-btn').forEach(function(btn) { btn.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
      var btnToActivate = null;
      if (targetBtn) {
        btnToActivate = targetBtn.closest ? targetBtn.closest('.tab-btn') : targetBtn;
        if (btnToActivate) btnToActivate.classList.add('active');
      } else {
        var foundBtn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
        if (foundBtn) {
          foundBtn.classList.add('active');
          btnToActivate = foundBtn;
        }
      }
      var targetContent = document.getElementById('tab-' + tabId);
      if (targetContent) targetContent.classList.add('active');
      if (btnToActivate && btnToActivate.scrollIntoView) {
        btnToActivate.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      if (tabId === 'graph') {
        setTimeout(resetCanvasView, 50);
      }
    };
  </script>
</body>
</html>`;
}
