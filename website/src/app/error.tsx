'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
      <h2 className="text-xl font-bold text-white">Something went wrong</h2>
      <p className="text-xs text-slate-400 mt-2">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 rounded-lg bg-brand-cyan text-black font-semibold text-xs"
      >
        Try again
      </button>
    </div>
  );
}
