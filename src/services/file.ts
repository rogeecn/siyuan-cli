import { SiyuanApiError, SiyuanClient } from '../core/http.js';

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

export interface BinaryFileInput {
  path: string;
  data: Blob;
  fileName?: string;
  modTime?: number;
}

export interface FileService {
  tree(path: string): Promise<FileTreeNode[]>;
  read(path: string): Promise<FileReadResult>;
  write(path: string, content: string): Promise<unknown>;
  writeBinary(input: BinaryFileInput): Promise<unknown>;
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
      const items = await client.request<RawFileTreeNode[]>('/api/file/readDir', { path });
      return (items || []).map((item, index) => normalizeTreeNode(item, index));
    },
    async read(path) {
      try {
        const result = await client.request<RawFileReadResult>('/api/file/getFile', { path });
        return normalizeReadResult(result || {});
      } catch (error) {
        if (!(error instanceof SiyuanApiError) || error.message !== 'Invalid JSON response') {
          throw error;
        }

        const response = await fetch(`${process.env.SIYUAN_BASE_URL}/api/file/getFile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${process.env.SIYUAN_TOKEN}`,
          },
          body: JSON.stringify({ path }),
        });
        const content = await response.text();
        return { path, content };
      }
    },
    async write(path, content) {
      const body = new FormData();
      body.set('path', path);
      body.set('isDir', 'false');
      body.set('modTime', String(Date.now()));
      body.set('file', new Blob([content], { type: 'text/plain' }), path.split('/').pop() || 'file.txt');
      return client.requestMultipart('/api/file/putFile', body);
    },
    async writeBinary({ path, data, fileName, modTime }) {
      const body = new FormData();
      body.set('path', path);
      body.set('isDir', 'false');
      body.set('modTime', String(modTime ?? Date.now()));
      body.set('file', data, fileName || path.split('/').pop() || 'file.bin');
      return client.requestMultipart('/api/file/putFile', body);
    },
    async remove(path) {
      return client.request('/api/file/removeFile', { path });
    },
  };
}
