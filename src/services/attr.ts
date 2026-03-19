import { SiyuanClient } from '../core/http.js';

export type BlockAttrs = Record<string, string>;

export interface AttrService {
  get(id: string): Promise<BlockAttrs>;
  list(): Promise<string[]>;
  set(id: string, key: string, value: string): Promise<unknown>;
  reset(id: string, key: string): Promise<unknown>;
}

export function createAttrService(client: SiyuanClient): AttrService {
  return {
    async get(id) {
      return client.request<BlockAttrs>('/api/attr/getBlockAttrs', { id });
    },
    async list() {
      return client.request<string[]>('/api/attr/getAllKeys');
    },
    async set(id, key, value) {
      return client.request('/api/attr/setBlockAttrs', { id, attrs: { [key]: value } });
    },
    async reset(id, key) {
      return client.request('/api/attr/setBlockAttrs', { id, attrs: { [key]: '' } });
    },
  };
}
