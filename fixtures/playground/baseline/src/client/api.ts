import { getUser } from '../routes/user.js';
import type { RequestContext } from '../types.js';

export async function fetchProfile(context: RequestContext): Promise<string> {
  const user = await getUser(context);
  return user.name;
}
