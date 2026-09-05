import { describe, it, expect } from 'vitest';
import { getFileHistory } from '../src/core/git/history.js';

describe('Git History Intelligence', () => {
  it('gracefully returns zeroes for uncommitted files or non-repo paths', async () => {
    const history = await getFileHistory('non-existent-file.ts', process.cwd());
    expect(history.totalCommits).toBe(0);
    expect(history.uniqueAuthors).toBe(0);
    expect(history.recentCommits).toEqual([]);
    expect(history.isHighChurn).toBe(false);
  });
});
