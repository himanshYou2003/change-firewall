export interface User {
  id: string;
  name: string;
  role: 'member' | 'admin';
}

export interface RequestContext {
  user?: User;
  params: Record<string, string>;
}
