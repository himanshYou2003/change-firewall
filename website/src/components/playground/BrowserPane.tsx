'use client';

import { ExternalLink, Loader2, MonitorStop, RefreshCw } from 'lucide-react';
import type { PreviewState } from '@/lib/playground/types';

export default function BrowserPane({ preview, onOpenExternal, onRefresh }: { preview?: PreviewState; onOpenExternal: () => void; onRefresh: () => void }) {
  if (!preview) return <div className="playground-browser-empty"><MonitorStop /><h3>No dashboard is running</h3><p>Run <code>npx change-firewall --open</code> for a real snapshot, or <code>npx change-firewall watch</code> for live updates.</p></div>;
  if (preview.status === 'loading') return <div className="playground-browser-empty"><Loader2 className="animate-spin" /><h3>Connecting to the dashboard…</h3></div>;
  if (preview.status === 'stopped' || preview.status === 'error' || !preview.url) return <div className="playground-browser-empty"><MonitorStop /><h3>{preview.status === 'stopped' ? 'Dashboard stopped' : 'Dashboard unavailable'}</h3><p>{preview.message || 'The runtime did not provide a usable preview.'}</p></div>;
  return (
    <section className="playground-browser" aria-label="Change Firewall dashboard preview">
      <div className="playground-browser-bar">
        <span>{preview.mode === 'watch' ? 'Live watch dashboard' : preview.mode === 'demo' ? 'CLI synthetic demo' : 'Snapshot dashboard'}</span>
        <button type="button" onClick={onRefresh}><RefreshCw /> Refresh</button>
        <button type="button" onClick={onOpenExternal}><ExternalLink /> Open in new tab</button>
      </div>
      {preview.mode === 'snapshot' && <p className="playground-snapshot-note">Snapshot: rerun the command or use watch after editing files.</p>}
      <iframe title="Real Change Firewall dashboard" src={preview.url} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" />
    </section>
  );
}

