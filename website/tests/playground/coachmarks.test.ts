import { describe, expect, it } from 'vitest';
import { COACHMARK_RULES, eligibleCoachmark } from '@/lib/playground/coachmarks';
import { initialState } from '@/lib/playground/reducer';

describe('playground coachmark rules', () => {
  it('prioritizes connection recovery over onboarding', () => {
    const state = { ...initialState, session: { ...initialState.session, state: 'failed' as const } };
    expect(eligibleCoachmark(state, {})?.id).toBe('connection-error');
  });

  it('does not repeat a dismissed rule until its rearm key changes', () => {
    const rule = COACHMARK_RULES.find(item => item.id === 'start')!;
    const dismissed = { [rule.id]: rule.rearmKey(initialState) };
    expect(eligibleCoachmark(initialState, dismissed)?.id).not.toBe('start');
    const reset = { ...initialState, resetCount: initialState.resetCount + 1 };
    expect(eligibleCoachmark(reset, dismissed)?.id).toBe('start');
  });

  it('teaches that committing changes the default HEAD comparison', () => {
    const lesson = COACHMARK_RULES.find(item => item.id === 'commit-lesson')!;
    expect(lesson.message).toContain('After committing');
    expect(lesson.message).toContain('HEAD~1');
  });
});
