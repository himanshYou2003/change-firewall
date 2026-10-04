import type { RequestContext, User } from '../types.js';

export async function getUser(context: RequestContext): Promise<User> {
  return {
    id: context.params.id,
    name: 'Ada',
    role: 'member',
  };
}
