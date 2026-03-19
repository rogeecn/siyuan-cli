import { SiyuanClient } from '../core/http.js';

export interface BlockInfo {
  id: string;
  content: string;
  path: string;
}

export interface BlockChild {
  id: string;
  content: string;
}

interface RawBlockInfo {
  id?: string;
  content?: string;
  path?: string;
  hpath?: string;
}

interface RawBlockChild {
  id?: string;
  content?: string;
  name?: string;
}

export interface BlockService {
  get(id: string): Promise<BlockInfo>;
  children(id: string): Promise<BlockChild[]>;
  update(input: { id: string; markdown: string }): Promise<unknown>;
  insert(input: { id: string; markdown: string }): Promise<unknown>;
  move(input: { id: string; parentID: string }): Promise<unknown>;
  remove(id: string): Promise<unknown>;
}

function normalizeBlockInfo(block: RawBlockInfo): BlockInfo {
  return {
    id: block.id?.trim() || '(unknown id)',
    content: block.content?.trim() || '',
    path: block.hpath?.trim() || block.path?.trim() || '(no path)',
  };
}

function normalizeBlockChild(block: RawBlockChild, index: number): BlockChild {
  return {
    id: block.id?.trim() || `child-${index + 1}`,
    content: block.content?.trim() || block.name?.trim() || `Child ${index + 1}`,
  };
}

export function createBlockService(client: SiyuanClient): BlockService {
  return {
    async get(id) {
      const block = await client.request<RawBlockInfo>('/api/block/getBlockInfo', { id });
      return normalizeBlockInfo(block || {});
    },
    async children(id) {
      const blocks = await client.request<RawBlockChild[]>('/api/block/getChildBlocks', { id });
      return (blocks || []).map((block, index) => normalizeBlockChild(block, index));
    },
    async update({ id, markdown }) {
      return client.request('/api/block/updateBlock', { id, data: markdown, dataType: 'markdown' });
    },
    async insert({ id, markdown }) {
      return client.request('/api/block/insertBlock', { previousID: id, data: markdown, dataType: 'markdown' });
    },
    async move({ id, parentID }) {
      return client.request('/api/block/moveBlock', { id, parentID });
    },
    async remove(id) {
      return client.request('/api/block/deleteBlock', { id });
    },
  };
}
