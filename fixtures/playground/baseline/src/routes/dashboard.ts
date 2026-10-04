import { requireAuth } from '../middleware/auth.js';
import type { RequestContext } from '../types.js';

export function getDashboard(context: RequestContext): { greeting: string } {
  requireAuth(context);
  return { greeting: `Welcome ${context.user?.name ?? 'developer'}` };
}
