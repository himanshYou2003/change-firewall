import { requireAuth } from '../middleware/auth.js';
import { findUser } from '../services/userService.js';
import type { RequestContext, User } from '../types.js';

export async function getUser(context: RequestContext): Promise<{ user: User | null }> {
  requireAuth(context);
  const user = findUser(context.params.id);
  return { user };
}
