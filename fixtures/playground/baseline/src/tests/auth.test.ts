import { requireAuth } from '../middleware/auth.js';

// This fixture is analyzed as source. It intentionally avoids a test-runner
// dependency so the public playground never downloads packages at runtime.
export function authenticatedUsersAreAccepted(): boolean {
  requireAuth({
    params: {},
    user: { id: 'user-1', name: 'Ada', role: 'member' },
  });
  return true;
}
