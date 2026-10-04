'use client';

import dynamic from 'next/dynamic';

const IdeShell = dynamic(() => import('./IdeShell'), {
  ssr: false,
  loading: () => <div className="playground-loading" role="status"><span />Loading the interactive workspace…</div>,
});

export default function PlaygroundLoader() { return <IdeShell />; }

