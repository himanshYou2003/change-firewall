'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const PredictiveArc = dynamic(() => import('@/components/originkit/ui/predictive-arc'), {
  ssr: false,
});

export default function EmailWaitlist() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || "You're subscribed! We'll notify you as new superpowers drop.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Network connection issue. Please try again in a moment.');
    }
  };

  return (
    <section id="waitlist" className="relative min-h-screen w-full flex items-center justify-center py-20 overflow-hidden">
      {/* Full-Screen Predictive Arc Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
        {mounted && (
          <PredictiveArc
            background={isDark ? '#07090e' : '#f5f2e8'}
            baseColor={isDark ? '#1e293b' : '#d1c8b7'}
            accentColor={isDark ? '#38bdf8' : '#ff5c26'}
            highlight={isDark ? '#ff6e38' : '#ff7a45'}
            density={130}
            dotSize={110}
            speed={70}
            arch={{
              peak: 45,
              archHeight: 70,
              thickness: 120,
              falloff: 250,
            }}
            pointer={{
              enabled: true,
              radius: 260,
              strength: 85,
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
            }}
          />
        )}
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-main)]/60 via-transparent to-[var(--bg-main)]/80 pointer-events-none" />
      </div>

      {/* Foreground Content Card */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pointer-events-auto">
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 text-center relative overflow-hidden border border-[var(--border-card)] shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-100)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-semibold mb-6">
            <Mail className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Developer Updates & AST Superpowers</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Never miss a breakthrough update.
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Get notified when new superpowers launch: Automated AI Self-Healing Patches (<code className="font-mono text-brand-cyan">--fix</code>), Python/Go AST engines, and GitHub PR review bots.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your developer email..."
                  required
                  disabled={status === 'loading'}
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--surface-50)] border border-[var(--border-subtle)] focus:border-[var(--text-primary)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-main)] hover:opacity-90 font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0 shadow-md"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Get Updates</span>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-success bg-brand-success/10 border border-brand-success/30 rounded-lg p-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-danger bg-brand-danger/10 border border-brand-danger/30 rounded-lg p-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <p className="mt-3 text-[11px] text-[var(--text-muted)]">
              🔒 Zero spam. Stored securely in MongoDB Atlas. Unsubscribe anytime.
            </p>
          </form>

          {/* Interactive Particle Hint */}
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-mono">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Interactive Predictive Arc Field</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-success" />
              <span>Compiler-Grounded Invariant Proofs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
