import { fetchProfile } from '../client/api.js';
import type { RequestContext } from '../types.js';

export async function renderProfile(context: RequestContext): Promise<string> {
  const name = await fetchProfile(context);
  return `<h1>${name}</h1>`;
}
