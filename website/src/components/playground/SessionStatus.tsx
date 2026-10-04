'use client';

import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { anchorProps, COACHMARK_ANCHORS } from '@/lib/playground/anchors';
import type { PlaygroundSession } from '@/lib/playground/types';

export default function SessionStatus({ session, onStart }: { session: PlaygroundSession; onStart: () => void }) {
  const busy = session.state === 'provisioning' || session.state === 'seeding' || session.state === 'reconnecting';
  const connected = session.state === 'ready';
  return (
    <div className="playground-session-status" {...anchorProps(COACHMARK_ANCHORS.connectionBadge)}>
      <span className={`playground-status-dot ${connected ? 'is-live' : busy ? 'is-busy' : 'is-offline'}`} />
      {connected ? <Wifi aria-hidden="true" /> : busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
      <span>{connected ? 'Live sandbox' : busy ? (session.state === 'seeding' ? 'Seeding sample…' : 'Starting sandbox…') : session.state === 'expired' ? 'Session expired' : session.state === 'failed' ? 'Runtime unavailable' : 'Preview only'}</span>
      {!connected && !busy && <button type="button" onClick={onStart}>Start live playground</button>}
    </div>
  );
}

