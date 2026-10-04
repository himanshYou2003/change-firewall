import type { RequestContext } from '../types.js';

export function requireAuth(context: RequestContext): void {
  if (!context.user || context.user.role !== 'admin') {
    throw new Error('Forbidden: admin role required');
  }
}
