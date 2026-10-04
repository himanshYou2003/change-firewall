'use client';

import { useState } from 'react';
import { Braces, Check, Copy, Loader2, Play, Sparkles } from 'lucide-react';

interface Props {
  connected: boolean;
  onTest: (tool: string, args?: Record<string, unknown>) => Promise<unknown>;
}

export default function McpTestPane({ connected, onTest }: Props) {
  const [tool, setTool] = useState('analyze_changes');
  const [targetFile, setTargetFile] = useState('src/middleware/auth.ts');
  const [agentIntent, setAgentIntent] = useState('Refactor user authentication and role verification');
  const [result, setResult] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    { name: 'analyze_changes', desc: 'Compiler-grounded AST diff, contract analysis, and blast radius for all changes' },
    { name: 'evaluate_preflight', desc: 'Pre-flight check against recording contract invariants' },
    { name: 'compute_blast_radius', desc: 'Calculates the direct & indirect downstream impact for a specific file' },
    { name: 'explain_file_impact', desc: 'Explains architectural role, consumers, and commit history for a file' },
    { name: 'get_behavior_graph', desc: 'Produces the dependency and consumer DAG for a file' },
    { name: 'audit_agent_intent', desc: 'Audits stated prompt/intent vs. actual uncommitted code mutations' },
  ];

  const currentTool = tools.find(t => t.name === tool) || tools[0];
  const requiresFile = tool === 'compute_blast_radius' || tool === 'explain_file_impact' || tool === 'get_behavior_graph';
  const requiresIntent = tool === 'audit_agent_intent';

  const runTest = async () => {
    setBusy(true);
    setResult('');
    try {
      const args: Record<string, unknown> = {};
      if (requiresFile) args.file = targetFile.trim() || 'src/middleware/auth.ts';
      if (requiresIntent) args.intent = agentIntent.trim() || 'Refactor user authentication and role verification';

      const data = await onTest(tool, args);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'MCP request failed');
    } finally {
      setBusy(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="playground-mcp" aria-label="MCP Protocol Test">
      <header className="playground-mcp-header">
        <Braces />
        <div>
          <h3>MCP Test Client</h3>
          <p>Live Model Context Protocol server handshake running inside your isolated workspace.</p>
        </div>
      </header>

      <div className="playground-mcp-body">
        <label className="playground-mcp-field">
          <span className="playground-mcp-label">Select Tool</span>
          <select value={tool} onChange={e => { setTool(e.target.value); setResult(''); }} aria-label="Select MCP tool">
            {tools.map(item => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <small className="playground-mcp-hint">{currentTool.desc}</small>
        </label>

        {requiresFile && (
          <label className="playground-mcp-field">
            <span className="playground-mcp-label">Target File</span>
            <input
              type="text"
              value={targetFile}
              onChange={e => setTargetFile(e.target.value)}
              placeholder="e.g. src/middleware/auth.ts"
              aria-label="Target file path"
            />
          </label>
        )}

        {requiresIntent && (
          <label className="playground-mcp-field">
            <span className="playground-mcp-label">Agent Intent / Commit Prompt</span>
            <input
              type="text"
              value={agentIntent}
              onChange={e => setAgentIntent(e.target.value)}
              placeholder="e.g. Fix CSS layout styling"
              aria-label="Agent intent prompt"
            />
          </label>
        )}

        <div className="playground-mcp-actions">
          <button type="button" disabled={busy} onClick={runTest} className="playground-mcp-run-btn">
            {busy ? (
              <>
                <Loader2 className="animate-spin" size={13} /> Running genuine handshake…
              </>
            ) : (
              <>
                <Play size={13} /> {connected ? 'Run MCP test' : 'Connect & Run MCP test'}
              </>
            )}
          </button>
          {result && (
            <button type="button" onClick={copyResult} className="playground-mcp-copy-btn" title="Copy Output">
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>

        <div className="playground-mcp-output-wrap">
          <div className="playground-mcp-output-header">
            <span>JSON-RPC 2.0 Response</span>
            {result && <span className="playground-mcp-badge"><Sparkles size={10} /> Active</span>}
          </div>
          <pre className="playground-mcp-pre">
            {result || 'initialize → initialized → tools/list → ' + tool + ' call response'}
          </pre>
        </div>
      </div>
    </section>
  );
}
