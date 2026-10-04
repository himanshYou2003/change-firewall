import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Nested workspace packages own their test configuration and scripts.
    // Keep the root suite scoped to the root package.
    include: ['test/**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
