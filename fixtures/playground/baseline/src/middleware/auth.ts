import type { RequestContext } from '../types.js';

export function requireAuth(context: RequestContext): void {
  if (!context.user) {
    throw new Error('Unauthorized');
  }
}
