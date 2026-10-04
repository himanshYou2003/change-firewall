import { constants } from 'node:fs';
import { lstat, mkdir, open, readdir, readFile, rename, rm, stat } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, join, resolve, sep } from 'node:path';
import type { FileEntry } from '../../../packages/playground-protocol/dist/index.js';
import { MAX_EDITABLE_FILE_BYTES, MAX_VISIBLE_FILES, ProtocolError, validateRelativePath } from '../../../packages/playground-protocol/dist/index.js';

const HIDDEN_ROOTS = new Set(['.git', 'node_modules', 'dist', '.firewall', '.playground-workspace']);

function inside(root: string, candidate: string): boolean {
  const normalizedRoot = resolve(root) + sep;
  return resolve(candidate).startsWith(normalizedRoot);
}

export async function safePath(root: string, input: unknown, allowMissingFinal = false): Promise<{ relative: string; absolute: string }> {
  const relative = validateRelativePath(input);
  const absolute = resolve(root, relative);
  if (!inside(root, absolute)) throw new ProtocolError(400, 'path escapes workspace');
  const parts = relative.split('/');
  let cursor = root;
  for (let index = 0; index < parts.length - (allowMissingFinal ? 1 : 0); index += 1) {
    cursor = join(cursor, parts[index]!);
    try {
      const info = await lstat(cursor);
      if (info.isSymbolicLink()) throw new ProtocolError(403, 'symbolic links are not accessible');
      if (index < parts.length - 1 && !info.isDirectory()) throw new ProtocolError(400, 'parent is not a directory');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' && allowMissingFinal) break;
      throw error;
    }
  }
  return { relative, absolute };
}

export function contentRevision(content: Buffer | string): string {
  return createHash('sha256').update(content).digest('hex');
}

export async function readWorkspaceFile(root: string, input: unknown): Promise<{ content: string; revision: string }> {
  const target = await safePath(root, input);
  const handle = await open(target.absolute, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.nlink !== 1) throw new ProtocolError(403, 'only regular, non-linked files can be read');
    if (info.size > MAX_EDITABLE_FILE_BYTES) throw new ProtocolError(413, 'file is too large');
    const content = await handle.readFile();
    if (content.includes(0)) throw new ProtocolError(415, 'binary files are not editable');
    return { content: content.toString('utf8'), revision: contentRevision(content) };
  } finally { await handle.close(); }
}

export async function writeWorkspaceFile(root: string, input: unknown, content: unknown, expectedRevision: unknown): Promise<{ revision: string }> {
  if (typeof content !== 'string') throw new ProtocolError(400, 'content must be a string');
  if (Buffer.byteLength(content) > MAX_EDITABLE_FILE_BYTES) throw new ProtocolError(413, 'file is too large');
  const target = await safePath(root, input, true);
  await mkdir(dirname(target.absolute), { recursive: true });
  await safePath(root, dirname(target.relative) === '.' ? target.relative : `${dirname(target.relative)}/placeholder`, true);
  let current: { revision: string } | undefined;
  try { current = await readWorkspaceFile(root, target.relative); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  if (expectedRevision !== undefined && expectedRevision !== null && expectedRevision !== current?.revision) {
    throw new ProtocolError(409, 'file revision conflict');
  }
  const temporary = join(dirname(target.absolute), `.${randomUUID()}.tmp`);
  const handle = await open(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
  try { await handle.writeFile(content, 'utf8'); await handle.sync(); } finally { await handle.close(); }
  await rename(temporary, target.absolute);
  return { revision: contentRevision(content) };
}

export async function mutateWorkspaceFile(root: string, operation: Record<string, unknown>): Promise<void> {
  const kind = operation.operation;
  if (kind === 'create') { await writeWorkspaceFile(root, operation.path, operation.content ?? '', null); return; }
  if (kind === 'delete') {
    const target = await safePath(root, operation.path);
    const current = await readWorkspaceFile(root, target.relative);
    if (operation.expectedRevision !== undefined && operation.expectedRevision !== current.revision) throw new ProtocolError(409, 'file revision conflict');
    await rm(target.absolute); return;
  }
  if (kind === 'rename') {
    const source = await safePath(root, operation.path);
    const destination = await safePath(root, operation.destination, true);
    const current = await readWorkspaceFile(root, source.relative);
    if (operation.expectedRevision !== undefined && operation.expectedRevision !== current.revision) throw new ProtocolError(409, 'file revision conflict');
    await mkdir(dirname(destination.absolute), { recursive: true });
    try { await stat(destination.absolute); throw new ProtocolError(409, 'destination already exists'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    await rename(source.absolute, destination.absolute); return;
  }
  throw new ProtocolError(400, 'operation must be create, rename, or delete');
}

export async function listWorkspaceFiles(root: string): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  async function visit(relative: string): Promise<void> {
    if (entries.length >= MAX_VISIBLE_FILES) return;
    const absolute = relative ? join(root, relative) : root;
    for (const item of await readdir(absolute, { withFileTypes: true })) {
      if (!relative && HIDDEN_ROOTS.has(item.name)) continue;
      if (item.isSymbolicLink()) continue;
      const itemRelative = relative ? `${relative}/${item.name}` : item.name;
      if (item.isDirectory()) { entries.push({ path: itemRelative, kind: 'directory' }); await visit(itemRelative); }
      else if (item.isFile()) {
        const info = await stat(join(root, itemRelative));
        if (info.size <= MAX_EDITABLE_FILE_BYTES) {
          const bytes = await readFile(join(root, itemRelative));
          if (!bytes.includes(0)) entries.push({ path: itemRelative, kind: 'file', size: info.size, revision: contentRevision(bytes) });
        }
      }
      if (entries.length >= MAX_VISIBLE_FILES) return;
    }
  }
  await visit('');
  return entries;
}
