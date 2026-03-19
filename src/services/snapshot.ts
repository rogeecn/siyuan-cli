import { SiyuanClient } from '../core/http.js';

export interface SnapshotSummary {
  id: string;
  time: string;
}

export interface CurrentSnapshot {
  id: string;
  time: string;
  memo: string;
}

interface RawSnapshotSummary {
  id?: string;
  time?: string;
}

interface RawCurrentSnapshot {
  id?: string;
  time?: string;
  memo?: string;
}

export interface SnapshotService {
  list(): Promise<SnapshotSummary[]>;
  current(): Promise<CurrentSnapshot>;
  create(memo: string): Promise<unknown>;
  restore(id: string): Promise<unknown>;
  remove(id: string): Promise<unknown>;
}

function normalizeSnapshot(item: RawSnapshotSummary, index: number): SnapshotSummary {
  return {
    id: item.id?.trim() || `snapshot-${index + 1}`,
    time: item.time?.trim() || '(unknown time)',
  };
}

function normalizeCurrent(item: RawCurrentSnapshot): CurrentSnapshot {
  return {
    id: item.id?.trim() || '(unknown id)',
    time: item.time?.trim() || '(unknown time)',
    memo: item.memo?.trim() || '',
  };
}

export function createSnapshotService(client: SiyuanClient): SnapshotService {
  return {
    async list() {
      const items = await client.request<RawSnapshotSummary[]>('/api/snapshot/getSnapshotList');
      return (items || []).map((item, index) => normalizeSnapshot(item, index));
    },
    async current() {
      const item = await client.request<RawCurrentSnapshot>('/api/snapshot/getRepoSnapshots');
      return normalizeCurrent(item || {});
    },
    async create(memo) {
      return client.request('/api/snapshot/createSnapshot', { memo });
    },
    async restore(id) {
      return client.request('/api/snapshot/rollbackSnapshot', { id });
    },
    async remove(id) {
      return client.request('/api/snapshot/removeSnapshot', { id });
    },
  };
}
