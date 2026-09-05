import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { FileDiff, FileChangeType } from '../../types/index.js';

const execFileAsync = promisify(execFile);

async function runGit(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('git', args, {
    cwd,
    maxBuffer: 20 * 1024 * 1024, // 20MB
  });
  return stdout;
}

export async function isGitRepo(cwd: string): Promise<boolean> {
  try {
    const stdout = await runGit(['rev-parse', '--is-inside-work-tree'], cwd);
    return stdout.trim() === 'true';
  } catch {
    return false;
  }
}

export async function getCurrentBranch(cwd: string): Promise<string | undefined> {
  try {
    const stdout = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

export async function getHeadCommit(cwd: string): Promise<string | undefined> {
  try {
    const stdout = await runGit(['rev-parse', '--short', 'HEAD'], cwd);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

export interface CollectDiffOptions {
  cwd: string;
  base?: string;
  staged?: boolean;
}

export async function collectFileDiffs(options: CollectDiffOptions): Promise<FileDiff[]> {
  const { cwd, base, staged } = options;

  const isRepo = await isGitRepo(cwd);
  if (!isRepo) {
    return [];
  }

  const baseRef = base || 'HEAD';
  const diffs: FileDiff[] = [];

  // Check if HEAD exists (could be fresh repo with no commits)
  let hasCommits = true;
  try {
    await runGit(['rev-parse', '--verify', 'HEAD'], cwd);
  } catch {
    hasCommits = false;
  }

  if (!hasCommits) {
    // Initial commit scenario - all files in directory are untracked/added
    const statusOut = await runGit(['status', '--porcelain', '-uall'], cwd);
    const lines = statusOut.split('\n').filter((l) => l.trim().length > 0);

    for (const line of lines) {
      const filePath = line.substring(3).trim();
      const fullPath = path.resolve(cwd, filePath);

      let content = '';
      try {
        content = await fs.readFile(fullPath, 'utf8');
      } catch {
        continue;
      }

      const lineCount = content.split('\n').length;
      diffs.push({
        path: filePath.replace(/\\/g, '/'),
        changeType: 'added',
        afterContent: content,
        linesAdded: lineCount,
        linesDeleted: 0,
      });
    }

    return diffs;
  }

  // Build git diff arguments
  const diffArgs = ['diff', '--name-status', '-M'];
  if (staged) {
    diffArgs.push('--cached');
  }
  if (base) {
    diffArgs.push(base);
  } else if (!staged) {
    diffArgs.push('HEAD');
  }

  const nameStatusOut = await runGit(diffArgs, cwd);
  const diffLines = nameStatusOut.split('\n').filter((l) => l.trim().length > 0);

  // Also collect untracked files if not checking staged only
  if (!staged) {
    const untrackedOut = await runGit(['status', '--porcelain'], cwd);
    for (const line of untrackedOut.split('\n')) {
      if (line.startsWith('?? ')) {
        const filePath = line.substring(3).trim().replace(/\\/g, '/');
        const fullPath = path.resolve(cwd, filePath);
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const lineCount = content.split('\n').length;
          diffs.push({
            path: filePath,
            changeType: 'untracked',
            afterContent: content,
            linesAdded: lineCount,
            linesDeleted: 0,
          });
        } catch {
          // Skip if unreadable (e.g. directory or binary)
        }
      }
    }
  }

  for (const line of diffLines) {
    const parts = line.split('\t');
    const status = parts[0]?.trim();
    if (!status) continue;

    const statusCode = status[0];
    let filePath = parts[1]?.trim().replace(/\\/g, '/');
    let oldPath: string | undefined;

    if (statusCode === 'R') {
      oldPath = parts[1]?.trim().replace(/\\/g, '/');
      filePath = parts[2]?.trim().replace(/\\/g, '/');
    }

    if (!filePath) continue;

    let changeType: FileChangeType = 'modified';
    let beforeContent: string | undefined;
    let afterContent: string | undefined;
    let linesAdded = 0;
    let linesDeleted = 0;

    if (statusCode === 'A') {
      changeType = 'added';
      try {
        afterContent = await fs.readFile(path.resolve(cwd, filePath), 'utf8');
        linesAdded = afterContent.split('\n').length;
      } catch {}
    } else if (statusCode === 'D') {
      changeType = 'deleted';
      try {
        beforeContent = await runGit(['show', `${baseRef}:${filePath}`], cwd);
        linesDeleted = beforeContent.split('\n').length;
      } catch {}
    } else if (statusCode === 'R') {
      changeType = 'renamed';
      try {
        if (oldPath) {
          beforeContent = await runGit(['show', `${baseRef}:${oldPath}`], cwd);
        }
        afterContent = await fs.readFile(path.resolve(cwd, filePath), 'utf8');
      } catch {}
    } else {
      // Modified ('M')
      changeType = 'modified';
      try {
        beforeContent = await runGit(['show', `${baseRef}:${filePath}`], cwd);
      } catch {}
      try {
        afterContent = await fs.readFile(path.resolve(cwd, filePath), 'utf8');
      } catch {}

      // Calculate line changes
      try {
        const numstatOut = await runGit(
          ['diff', '--numstat', baseRef, '--', filePath],
          cwd
        );
        const [addedStr, deletedStr] = numstatOut.trim().split(/\s+/);
        linesAdded = parseInt(addedStr, 10) || 0;
        linesDeleted = parseInt(deletedStr, 10) || 0;
      } catch {}
    }

    diffs.push({
      path: filePath,
      changeType,
      oldPath,
      beforeContent,
      afterContent,
      linesAdded,
      linesDeleted,
    });
  }

  return diffs;
}
