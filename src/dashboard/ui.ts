import type { AnalysisReport } from '../types/index.js';

export function getDashboardHtml(report: AnalysisReport): string {
  const serialized = JSON.stringify(report).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Change Firewall — Behavior & Impact Intelligence</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070a13;
      --card-bg: #0f172a;
      --card-border: #1e293b;
      --card-hover: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #3b82f6;
      --accent-glow: rgba(59, 130, 246, 0.2);
      --purple: #8b5cf6;
      --red: #ef4444;
      --red-bg: rgba(239, 68, 68, 0.12);
      --orange: #f97316;
      --orange-bg: rgba(249, 115, 22, 0.12);
      --yellow: #eab308;
      --green: #10b981;
      --green-bg: rgba(16, 185, 129, 0.12);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 1280px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 28px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 0 24px rgba(59, 130, 246, 0.45);
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 13px;
      color: var(--text-muted);
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 18px;
      margin-bottom: 28px;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .metric-title {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 700;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .metric-desc {
      font-size: 12px;
      color: var(--text-muted);
    }
    .badge-high {
      color: var(--red);
      background: var(--red-bg);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
      width: fit-content;
    }
    .badge-medium {
      color: var(--orange);
      background: var(--orange-bg);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
      width: fit-content;
    }
    .badge-low {
      color: var(--green);
      background: var(--green-bg);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
      width: fit-content;
    }
    .tabs {
      display: flex;
      gap: 6px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 24px;
      overflow-x: auto;
    }
    .tab-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 600;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: var(--text);
    }
    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .findings-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .finding-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      transition: border-color 0.2s;
    }
    .finding-card:hover {
      border-color: #3b82f6;
    }
    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .finding-title {
      font-size: 17px;
      font-weight: 700;
    }
    .file-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: var(--accent);
      background: var(--accent-glow);
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 12px;
    }
    .finding-desc {
      color: #cbd5e1;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .evidence-box {
      background: #090e1a;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      border-left: 3px solid var(--accent);
    }
    .evidence-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .evidence-item {
      font-size: 13px;
      color: #e2e8f0;
      margin-left: 14px;
      margin-bottom: 4px;
    }
    .recommendation-box {
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #93c5fd;
    }
    .graph-container {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px;
      position: relative;
    }
    .graph-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .graph-legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .graph-svg {
      width: 100%;
      height: 480px;
      background: #090e1a;
      border-radius: 10px;
      border: 1px solid #1e293b;
    }
    .node-rect {
      cursor: pointer;
      transition: all 0.2s;
    }
    .node-rect:hover {
      filter: brightness(1.25);
    }
    .node-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      fill: #f8fafc;
      pointer-events: none;
    }
    .node-subtext {
      font-size: 9px;
      fill: #94a3b8;
      pointer-events: none;
    }
    .edge-line {
      stroke: #334155;
      stroke-width: 1.5;
      fill: none;
    }
    .edge-line.active {
      stroke: #3b82f6;
      stroke-width: 2.5;
    }
    .inspector-card {
      margin-top: 16px;
      background: #090e1a;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 16px;
      display: none;
    }
    .timeline {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-left: 28px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 6px;
      bottom: 6px;
      width: 2px;
      background: var(--card-border);
    }
    .timeline-item {
      position: relative;
      margin-bottom: 24px;
    }
    .timeline-dot {
      position: absolute;
      left: -28px;
      top: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent);
      border: 3px solid var(--bg);
    }
    .timeline-date {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .timeline-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }
    .timeline-author {
      font-size: 12px;
      color: #93c5fd;
      font-family: 'JetBrains Mono', monospace;
    }
    .graph-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
    }
    .graph-table th, .graph-table td {
      padding: 14px 18px;
      text-align: left;
      font-size: 14px;
      border-bottom: 1px solid var(--card-border);
    }
    .graph-table th {
      background: #090e1a;
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="brand-icon">⚡</div>
        <div>
          <div class="brand-title">Change Firewall</div>
          <div class="brand-subtitle">AI Code Change Behavioral Verification Engine</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <span id="live-indicator" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #10b981; background: rgba(16,185,129,0.12); padding: 5px 12px; border-radius: 9999px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
          LIVE WATCH
        </span>
        <div id="timestamp" style="font-size: 13px; color: var(--text-muted);"></div>
      </div>
    </header>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Overall Risk Score</div>
        <div class="metric-value" id="risk-score">--</div>
        <div id="risk-badge"></div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Behavioral Shifts</div>
        <div class="metric-value" id="behavior-count">--</div>
        <div class="metric-desc">Semantics & contract mutators detected</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Files Changed</div>
        <div class="metric-value" id="files-count">--</div>
        <div class="metric-desc" id="lines-diff"></div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Max Blast Radius</div>
        <div class="metric-value" id="max-blast">--</div>
        <div class="metric-desc">Downstream consumers affected</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('graph')">Impact Visual Map</button>
      <button class="tab-btn" onclick="switchTab('findings')">Behavioral Findings</button>
      <button class="tab-btn" onclick="switchTab('suspicious')">Suspicious Changes</button>
      <button class="tab-btn" onclick="switchTab('timeline')">Git Timeline</button>
      <button class="tab-btn" onclick="switchTab('blast')">Blast Radius Table</button>
      <button class="tab-btn" onclick="switchTab('risk')">Risk Factors</button>
      <button class="tab-btn" onclick="switchTab('files')">Changed Files</button>
    </div>

    <!-- TAB 1: Visual Interactive SVG Map (Section 25) -->
    <div id="tab-graph" class="tab-content active">
      <div class="graph-container">
        <div class="graph-header">
          <div>
            <div style="font-weight: 700; font-size: 16px;">Interactive Impact & Consumer Graph</div>
            <div style="font-size: 13px; color: var(--text-muted);">Click any node to inspect blast radius, callers, and related behavioral findings.</div>
          </div>
          <div class="graph-legend">
            <div class="legend-item"><div class="legend-dot" style="background: #8b5cf6;"></div> Modified Source</div>
            <div class="legend-item"><div class="legend-dot" style="background: #3b82f6;"></div> Dependent Consumer</div>
            <div class="legend-item"><div class="legend-dot" style="background: #ef4444;"></div> Protected Route / High Blast</div>
          </div>
        </div>
        <svg id="network-svg" class="graph-svg">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#475569" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#3b82f6" />
            </marker>
          </defs>
          <g id="svg-edges"></g>
          <g id="svg-nodes"></g>
        </svg>
        <div id="inspector-card" class="inspector-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span id="inspector-title" style="font-weight: 700; font-size: 15px; font-family: 'JetBrains Mono', monospace;"></span>
            <span id="inspector-badge"></span>
          </div>
          <div id="inspector-desc" style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;"></div>
          <div id="inspector-details" style="font-size: 13px;"></div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Findings -->
    <div id="tab-findings" class="tab-content">
      <div class="findings-list" id="findings-container"></div>
    </div>

    <!-- TAB 3: Suspicious Changes (Section 27) -->
    <div id="tab-suspicious" class="tab-content">
      <div class="findings-list" id="suspicious-container"></div>
    </div>

    <!-- TAB 4: Git Timeline (Section 26) -->
    <div id="tab-timeline" class="tab-content">
      <div class="finding-card">
        <div class="timeline" id="timeline-container"></div>
      </div>
    </div>

    <!-- TAB 5: Blast Radius Table -->
    <div id="tab-blast" class="tab-content">
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

    <!-- TAB 6: Risk Factors -->
    <div id="tab-risk" class="tab-content">
      <div class="findings-list" id="risk-factors-container"></div>
    </div>

    <!-- TAB 7: Changed Files -->
    <div id="tab-files" class="tab-content">
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

  <script>
    let currentReport = ${serialized};

    function renderReport(report) {
      document.getElementById('timestamp').textContent = 'Last updated: ' + new Date(report.timestamp).toLocaleTimeString();
      document.getElementById('risk-score').textContent = report.risk.score + ' / 100';
      
      const riskBadge = document.getElementById('risk-badge');
      riskBadge.className = report.risk.level === 'HIGH' || report.risk.level === 'CRITICAL' ? 'badge-high' : (report.risk.level === 'MEDIUM' ? 'badge-medium' : 'badge-low');
      riskBadge.textContent = report.risk.level + ' RISK';

      document.getElementById('behavior-count').textContent = report.behavioralChangesCount;
      document.getElementById('files-count').textContent = report.totalFilesChanged;
      document.getElementById('lines-diff').textContent = '+' + report.linesAdded + ' / -' + report.linesDeleted + ' lines';

      let maxConsumers = 0;
      for (const b of Object.values(report.blastRadiusMap)) {
        if (b.totalConsumers > maxConsumers) maxConsumers = b.totalConsumers;
      }
      document.getElementById('max-blast').textContent = maxConsumers;

      // 1. Render Interactive SVG Graph (Section 25)
      renderVisualGraph(report);

      // 2. Render Findings
      const findingsContainer = document.getElementById('findings-container');
      if (report.findings.length === 0) {
        findingsContainer.innerHTML = '<div class="finding-card"><p style="color: var(--green);">✓ No breaking behavioral changes or contract regressions detected.</p></div>';
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

      // 3. Render Suspicious Changes (Section 27)
      const suspiciousContainer = document.getElementById('suspicious-container');
      const suspiciousList = report.suspiciousChanges || [];
      if (suspiciousList.length === 0) {
        suspiciousContainer.innerHTML = '<div class="finding-card"><p style="color: var(--green);">✓ Zero suspicious anomaly patterns detected in current diff.</p></div>';
      } else {
        suspiciousContainer.innerHTML = suspiciousList.map(s => \`
          <div class="finding-card" style="border-left: 4px solid var(--orange);">
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

      // 4. Render Git Timeline (Section 26)
      const timelineContainer = document.getElementById('timeline-container');
      const timelineList = report.timeline || [];
      if (timelineList.length === 0) {
        timelineContainer.innerHTML = '<p style="color: var(--text-muted);">No Git commit history recorded yet.</p>';
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
        blastBody.innerHTML = '<tr><td colspan="5">No dependency relationships detected.</td></tr>';
      } else {
        blastBody.innerHTML = blastEntries.map(b => {
          const badgeClass = b.level === 'HIGH' ? 'badge-high' : (b.level === 'MEDIUM' ? 'badge-medium' : 'badge-low');
          return \`
            <tr>
              <td class="mono">\${b.filePath}</td>
              <td>\${b.directDependents.length}</td>
              <td>\${b.affectedRoutes.length > 0 ? b.affectedRoutes.join(', ') : 'None'}</td>
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
            <span class="finding-title">+\${rf.scoreContribution} pts: \${rf.factor}</span>
          </div>
          <div class="finding-desc">\${rf.reason}</div>
        </div>
      \`).join('');

      // 7. Render Changed Files Table
      const filesBody = document.getElementById('files-table-body');
      filesBody.innerHTML = report.changedFiles.map(cf => \`
        <tr>
          <td class="mono">\${cf.path}</td>
          <td><span class="badge-medium">\${cf.changeType}</span></td>
          <td style="color: var(--green);">+\${cf.linesAdded}</td>
          <td style="color: var(--red);">-\${cf.linesDeleted}</td>
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

      // Source modified files (Layer 0)
      blastEntries.forEach(([file, blast], idx) => {
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

      // Layout coordinates
      const layerNodes = [[], [], []];
      nodes.forEach((node) => {
        layerNodes[Math.min(node.layer, 2)].push(node);
      });

      const colX = [120, 440, 780];
      layerNodes.forEach((col, cIdx) => {
        const x = colX[cIdx];
        const gapY = Math.min(80, 420 / (col.length + 1));
        const startY = (460 - (col.length - 1) * gapY) / 2;
        col.forEach((node, rIdx) => {
          node.x = x;
          node.y = Math.max(40, startY + rIdx * gapY);
        });
      });

      // Draw Edges
      edges.forEach((edge) => {
        const fromNode = nodes.get(edge.from);
        const toNode = nodes.get(edge.to);
        if (!fromNode || !toNode) return;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = \`M \${fromNode.x + 80} \${fromNode.y} C \${fromNode.x + 180} \${fromNode.y}, \${toNode.x - 100} \${toNode.y}, \${toNode.x - 80} \${toNode.y}\`;
        path.setAttribute('d', d);
        path.setAttribute('class', 'edge-line');
        path.setAttribute('marker-end', 'url(#arrow)');
        path.dataset.from = fromNode.id;
        path.dataset.to = toNode.id;
        svgEdgesGroup.appendChild(path);
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', \`translate(\${node.x - 70}, \${node.y - 20})\`);

        let fill = '#0f172a';
        let stroke = '#3b82f6';
        let typeBadge = 'Consumer';

        if (node.type === 'source') {
          stroke = '#8b5cf6';
          typeBadge = 'Modified';
        } else if (node.type === 'route') {
          stroke = '#ef4444';
          typeBadge = 'Route';
        }

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '140');
        rect.setAttribute('height', '40');
        rect.setAttribute('rx', '8');
        rect.setAttribute('fill', fill);
        rect.setAttribute('stroke', stroke);
        rect.setAttribute('stroke-width', '1.5');
        rect.setAttribute('class', 'node-rect');

        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '10');
        titleText.setAttribute('y', '18');
        titleText.setAttribute('class', 'node-text');
        titleText.textContent = node.label.length > 15 ? node.label.slice(0, 14) + '…' : node.label;

        const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subText.setAttribute('x', '10');
        subText.setAttribute('y', '32');
        subText.setAttribute('class', 'node-subtext');
        subText.textContent = \`[\${typeBadge}] \${node.blast.totalConsumers} dependents\`;

        g.appendChild(rect);
        g.appendChild(titleText);
        g.appendChild(subText);

        g.addEventListener('click', () => {
          inspectNode(node, report);
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

      document.getElementById('inspector-desc').textContent = \`Node Role: \${node.type} | Direct Consumers: \${node.blast.directDependents ? node.blast.directDependents.length : 0} | Total Blast: \${node.blast.totalConsumers} consumer(s)\`;

      const findings = report.findings.filter(f => f.filePath === node.fullPath || f.affectedFiles.includes(node.fullPath));
      let detailsHtml = '';
      if (findings.length > 0) {
        detailsHtml += '<div style="font-weight: 700; margin-bottom: 4px; color: var(--accent);">Associated Findings:</div>';
        findings.forEach(f => {
          detailsHtml += \`<div style="margin-bottom: 6px;">• <strong>\${f.title}</strong>: \${f.description}</div>\`;
        });
      } else {
        detailsHtml += '<div style="color: var(--text-muted);">No breaking behavioral findings directly rooted in this node.</div>';
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
      event.target.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');
    }
  </script>
</body>
</html>`;
}
