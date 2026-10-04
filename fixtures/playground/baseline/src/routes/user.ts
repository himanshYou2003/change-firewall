import { requireAuth } from '../middleware/auth.js';
import { findUser } from '../services/userService.js';
import type { RequestContext, User } from '../types.js';

export async function getUser(context: RequestContext): Promise<User> {
  requireAuth(context);
  return findUser(context.params.id);
}
