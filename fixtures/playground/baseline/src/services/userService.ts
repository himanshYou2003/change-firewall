import type { User } from '../types.js';

const users: User[] = [
  { id: 'user-1', name: 'Ada', role: 'member' },
  { id: 'admin-1', name: 'Grace', role: 'admin' },
];

export function findUser(id: string, fallback?: User): User {
  return users.find((user) => user.id === id) ?? fallback ?? users[0];
}
