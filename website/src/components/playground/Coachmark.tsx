'use client';

import { Lightbulb, X } from 'lucide-react';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import { useEffect } from 'react';
import type { CoachmarkRule } from '@/lib/playground/coachmarks';

export default function Coachmark({ rule, onAction, onDismiss }: { rule?: CoachmarkRule; onAction: (rule: CoachmarkRule) => void; onDismiss: (rule: CoachmarkRule) => void }) {
  const { refs, floatingStyles } = useFloating({ placement: 'bottom', middleware: [offset(10), flip(), shift({ padding: 12 })], whileElementsMounted: autoUpdate });

  useEffect(() => {
    if (!rule) return;
    const anchor = document.querySelector<HTMLElement>(`[data-coachmark-anchor="${rule.anchor}"]`);
    refs.setReference(anchor);
    return () => refs.setReference(null);
  }, [refs, rule]);

  if (!rule) return null;
  return <aside ref={refs.setFloating} className="playground-coachmark" style={floatingStyles} role="status" data-coachmark-popover>
    <button type="button" className="playground-coachmark-close" onClick={() => onDismiss(rule)} aria-label="Dismiss tip"><X /></button>
    <div className="playground-coachmark-icon"><Lightbulb /></div>
    <div><strong>{rule.title}</strong><p>{rule.message}</p>{rule.action && <button type="button" onClick={() => onAction(rule)}>{rule.action.label}</button>}</div>
  </aside>;
}
