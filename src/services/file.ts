import { SiyuanClient } from '../core/http.js';

export interface FileTreeNode {
  name: string;
  isDir: boolean;
}

export interface FileReadResult {
  path: string;
  content: string;
}

interface RawFileTreeNode {
  name?: string;
  isDir?: boolean;
}

interface RawFileReadResult {
  path?: string;
  content?: string;
}

export interface FileService {
  tree(path: string): Promise<FileTreeNode[]>;
  read(path: string): Promise<FileReadResult>;
  write(path: string, content: string): Promise<unknown>;
  remove(path: string): Promise<unknown>;
}

function normalizeTreeNode(node: RawFileTreeNode, index: number): FileTreeNode {
  return {
    name: node.name?.trim() || `item-${index + 1}`,
    isDir: Boolean(node.isDir),
  };
}

function normalizeReadResult(result: RawFileReadResult): FileReadResult {
  return {
    path: result.path?.trim() || '(unknown path)',
    content: result.content ?? '',
  };
}

export function createFileService(client: SiyuanClient): FileService {
  return {
    async tree(path) {
      const items = await client.request<RawFileTreeNode[]>('/api/file/getFile', { path });
      return (items || []).map((item, index) => normalizeTreeNode(item, index));
    },
    async read(path) {
      const result = await client.request<RawFileReadResult>('/api/file/getFileContent', { path });
      return normalizeReadResult(result || {});
    },
    async write(path, content) {
      return client.request('/api/file/putFile', { path, file: content });
    },
    async remove(path) {
      return client.request('/api/file/removeFile', { path });
    },
  };
}
