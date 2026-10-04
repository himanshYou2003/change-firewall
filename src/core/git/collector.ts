import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { FileDiff, FileChangeType } from '../../types/index.js';

const execFileAsync = promisify(execFile);

async function runGit(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('git', ['-c', 'core.quotepath=false', ...args], {
    cwd,
    maxBuffer: 20 * 1024 * 1024,
    encoding: 'utf8',
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

interface NameStatusEntry {
  statusCode: string;
  path: string;
  oldPath?: string;
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function parseNameStatus(output: string): NameStatusEntry[] {
  const fields = output.split('\0');
  const entries: NameStatusEntry[] = [];

  for (let index = 0; index < fields.length; ) {
    const status = fields[index++];
    if (!status) continue;

    const statusCode = status[0];
    if (statusCode === 'R' || statusCode === 'C') {
      const oldPath = fields[index++];
      const filePath = fields[index++];
      if (oldPath && filePath) {
        entries.push({
          statusCode,
          oldPath: normalizePath(oldPath),
          path: normalizePath(filePath),
        });
      }
      continue;
    }

    const filePath = fields[index++];
    if (filePath) entries.push({ statusCode, path: normalizePath(filePath) });
  }

  return entries;
}

function countLines(content: string): number {
  if (!content) return 0;
  return content.endsWith('\n')
    ? content.slice(0, -1).split('\n').length
    : content.split('\n').length;
}

async function readWorkingTreeFile(cwd: string, filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(path.resolve(cwd, filePath), 'utf8');
  } catch {
    return undefined;
  }
}

async function readGitObject(cwd: string, revision: string, filePath: string): Promise<string | undefined> {
  try {
    return await runGit(['show', `${revision}:${filePath}`], cwd);
  } catch {
    return undefined;
  }
}

async function getNumstat(
  cwd: string,
  baseRef: string | undefined,
  staged: boolean,
  filePath: string,
  oldPath?: string
): Promise<{ linesAdded: number; linesDeleted: number }> {
  const args = ['diff'];
  if (staged) args.push('--cached');
  args.push('--numstat');
  if (baseRef) args.push(baseRef);
  args.push('--');
  if (oldPath) args.push(oldPath);
  args.push(filePath);

  try {
    const output = await runGit(args, cwd);
    let linesAdded = 0;
    let linesDeleted = 0;
    for (const line of output.trim().split('\n')) {
      if (!line) continue;
      const [added, deleted] = line.split('\t');
      linesAdded += Number.parseInt(added, 10) || 0;
      linesDeleted += Number.parseInt(deleted, 10) || 0;
    }
    return { linesAdded, linesDeleted };
  } catch {
    return { linesAdded: 0, linesDeleted: 0 };
  }
}

async function collectInitialWorkingTree(cwd: string): Promise<FileDiff[]> {
  // With no HEAD, compare the current working tree with an empty repository.
  const output = await runGit(
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    cwd
  );
  const paths = Array.from(
    new Set(output.split('\0').filter(Boolean).map(normalizePath))
  ).sort();
  const diffs: FileDiff[] = [];

  for (const filePath of paths) {
    const afterContent = await readWorkingTreeFile(cwd, filePath);
    if (afterContent === undefined) continue;
    diffs.push({
      path: filePath,
      changeType: 'added',
      afterContent,
      linesAdded: countLines(afterContent),
      linesDeleted: 0,
    });
  }

  return diffs;
}

export async function collectFileDiffs(options: CollectDiffOptions): Promise<FileDiff[]> {
  const { cwd, base, staged = false } = options;
  if (!(await isGitRepo(cwd))) return [];

  let hasCommits = true;
  try {
    await runGit(['rev-parse', '--verify', 'HEAD'], cwd);
  } catch {
    hasCommits = false;
  }

  if (!hasCommits && !staged) return collectInitialWorkingTree(cwd);

  const baseRef = base || (hasCommits ? 'HEAD' : undefined);
  const diffArgs = ['diff'];
  if (staged) diffArgs.push('--cached');
  diffArgs.push('--name-status', '-M', '-z');
  if (baseRef) diffArgs.push(baseRef);

  const entries = parseNameStatus(await runGit(diffArgs, cwd));
  const diffs: FileDiff[] = [];

  if (!staged) {
    const untrackedOutput = await runGit(
      ['ls-files', '--others', '--exclude-standard', '-z'],
      cwd
    );
    for (const filePath of untrackedOutput.split('\0').filter(Boolean).map(normalizePath)) {
      const afterContent = await readWorkingTreeFile(cwd, filePath);
      if (afterContent === undefined) continue;
      diffs.push({
        path: filePath,
        changeType: 'untracked',
        afterContent,
        linesAdded: countLines(afterContent),
        linesDeleted: 0,
      });
    }
  }

  for (const entry of entries) {
    const { statusCode, path: filePath, oldPath } = entry;
    let changeType: FileChangeType = 'modified';
    if (statusCode === 'A') changeType = 'added';
    else if (statusCode === 'D') changeType = 'deleted';
    else if (statusCode === 'R') changeType = 'renamed';

    const beforeContent = baseRef
      ? await readGitObject(cwd, baseRef, oldPath || filePath)
      : undefined;
    const afterContent = changeType === 'deleted'
      ? undefined
      : staged
        ? await readGitObject(cwd, '', filePath)
        : await readWorkingTreeFile(cwd, filePath);

    let { linesAdded, linesDeleted } = await getNumstat(
      cwd,
      baseRef,
      staged,
      filePath,
      oldPath
    );
    if (changeType === 'added' && linesAdded === 0 && afterContent !== undefined) {
      linesAdded = countLines(afterContent);
    }
    if (changeType === 'deleted' && linesDeleted === 0 && beforeContent !== undefined) {
      linesDeleted = countLines(beforeContent);
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
