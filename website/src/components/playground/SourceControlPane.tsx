'use client';

import { FileCode2, GitBranch, Minus, Plus, RefreshCw } from 'lucide-react';
import { anchorProps, COACHMARK_ANCHORS } from '@/lib/playground/anchors';
import type { GitStatus } from '@/lib/playground/types';

interface Props {
  git: GitStatus;
  onFill: (command: string) => void;
  onOpenFile?: (path: string) => void;
  onRun?: (command: string) => void;
  onRefresh?: () => void;
}

export default function SourceControlPane({ git, onFill, onOpenFile, onRun, onRefresh }: Props) {
  const isInternal = (path: string) => path.startsWith('.firewall') || path.startsWith('.playground');
  const groups = [
    { title: 'Staged', key: 'staged', files: git.staged.filter(p => !isInternal(p)), action: 'unstage' as const },
    { title: 'Changes', key: 'unstaged', files: git.unstaged.filter(p => !isInternal(p)), action: 'stage' as const },
    { title: 'Untracked', key: 'untracked', files: git.untracked.filter(p => !isInternal(p)), action: 'stage' as const },
  ];

  const handleStageFile = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cmd = `git add -- "${path}"`;
    if (onRun) onRun(cmd);
    else onFill(cmd);
  };

  const handleUnstageFile = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cmd = `git restore --staged -- "${path}"`;
    if (onRun) onRun(cmd);
    else onFill(cmd);
  };

  const handleStageAll = () => {
    const cmd = 'git add -A';
    if (onRun) onRun(cmd);
    else onFill(cmd);
  };

  const handleUnstageAll = () => {
    const cmd = 'git restore --staged .';
    if (onRun) onRun(cmd);
    else onFill(cmd);
  };

  return (
    <section className="playground-source-control" {...anchorProps(COACHMARK_ANCHORS.gitStatus)}>
      <header>
        <GitBranch />
        <div>
          <h3>Source Control</h3>
          <p>{git.head ? `Branch: ${git.head}` : 'No HEAD yet'}</p>
        </div>
        {onRefresh && (
          <button type="button" onClick={onRefresh} className="playground-git-refresh-btn" title="Refresh Git Status">
            <RefreshCw size={13} />
          </button>
        )}
      </header>

      <p className="playground-source-control-desc">
        This sample starts with <strong>3 baseline drift changes</strong> (<code>auth.ts</code>, <code>user.ts</code>, <code>userService.ts</code>).
        Editing files dynamically modifies this list. Click any file to open it, or click <strong>+</strong> / <strong>-</strong> to stage or unstage.
      </p>

      <div className="playground-git-actions">
        <button type="button" onClick={() => onFill('git status --short')}>Fill git status</button>
        <button type="button" onClick={() => onFill('git diff')}>Fill git diff</button>
        <button type="button" onClick={handleStageAll}><Plus /> Stage all changes</button>
        <button type="button" onClick={handleUnstageAll}><Minus /> Unstage all</button>
        <button type="button" onClick={() => onFill('git commit -m "contract drift updates"')}>Fill commit command</button>
      </div>

      {groups.map(group => {
        if (group.files.length === 0 && group.key === 'untracked') return null;
        return (
          <div key={group.title} className="playground-git-group">
            <div className="playground-git-group-header">
              <h4>{group.title} <span>{group.files.length}</span></h4>
              {group.files.length > 0 && (
                group.action === 'stage' ? (
                  <button type="button" className="playground-git-group-action" onClick={handleStageAll} title="Stage all changes">
                    <Plus size={12} /> Stage all
                  </button>
                ) : (
                  <button type="button" className="playground-git-group-action" onClick={handleUnstageAll} title="Unstage all files">
                    <Minus size={12} /> Unstage all
                  </button>
                )
              )}
            </div>

            {group.files.length === 0 ? (
              <div className="playground-git-empty-group">No {group.title.toLowerCase()} files</div>
            ) : (
              <div className="playground-git-file-list">
                {group.files.map(path => (
                  <div
                    key={path}
                    className="playground-git-file-item"
                    onClick={() => onOpenFile?.(path)}
                    role="button"
                    tabIndex={0}
                    title={`Click to open ${path}`}
                  >
                    <FileCode2 size={13} className="playground-git-file-icon" />
                    <span className="playground-git-file-name">{path}</span>
                    <span className={`playground-git-mark status-${group.key === 'staged' ? 'A' : group.key === 'untracked' ? 'U' : 'M'}`}>
                      {group.key === 'staged' ? 'A' : group.key === 'untracked' ? 'U' : 'M'}
                    </span>
                    <button
                      type="button"
                      className="playground-git-item-btn"
                      onClick={e => (group.action === 'stage' ? handleStageFile(path, e) : handleUnstageFile(path, e))}
                      title={group.action === 'stage' ? `Stage ${path}` : `Unstage ${path}`}
                    >
                      {group.action === 'stage' ? <Plus size={11} /> : <Minus size={11} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <aside>
        <strong>Why 3 changes initially?</strong>
        <span>
          The <em>Contract drift</em> sample seeds Git with 3 uncommitted modified files to simulate an active pull request or local changes.
          Whenever you edit another file (like <code>README.md</code> or <code>src/types.ts</code>), it will automatically appear here too!
        </span>
      </aside>
    </section>
  );
}
