import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface FileHistoryInfo {
  filePath: string;
  totalCommits: number;
  uniqueAuthors: number;
  recentCommits: { hash: string; date: string; subject: string }[];
  isHighChurn: boolean;
}

export interface GitTimelineItem {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export async function getFileHistory(filePath: string, cwd: string): Promise<FileHistoryInfo> {
  try {
    // 1. Commit count
    const { stdout: countOut } = await execFileAsync(
      'git',
      ['rev-list', '--count', 'HEAD', '--', filePath],
      { cwd }
    );
    const totalCommits = parseInt(countOut.trim(), 10) || 0;

    // 2. Recent commits
    const { stdout: logOut } = await execFileAsync(
      'git',
      ['log', '-n', '5', '--pretty=format:%h|%ad|%s', '--date=short', '--', filePath],
      { cwd }
    );
    const recentCommits = logOut
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .map((line) => {
        const [hash, date, subject] = line.split('|');
        return { hash, date, subject };
      });

    // 3. Unique authors
    const { stdout: authorsOut } = await execFileAsync(
      'git',
      ['shortlog', '-s', 'HEAD', '--', filePath],
      { cwd }
    );
    const uniqueAuthors = authorsOut.split('\n').filter((l) => l.trim().length > 0).length;

    return {
      filePath,
      totalCommits,
      uniqueAuthors,
      recentCommits,
      isHighChurn: totalCommits > 15,
    };
  } catch {
    return {
      filePath,
      totalCommits: 0,
      uniqueAuthors: 0,
      recentCommits: [],
      isHighChurn: false,
    };
  }
}

export async function getRecentTimeline(cwd: string, limit = 8): Promise<GitTimelineItem[]> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['log', `-n`, `${limit}`, '--pretty=format:%h|%an|%ad|%s', '--date=short'],
      { cwd }
    );

    return stdout
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .map((line) => {
        const [hash, author, date, message] = line.split('|');
        return { hash: hash || '', author: author || '', date: date || '', message: message || '' };
      });
  } catch {
    return [];
  }
}
