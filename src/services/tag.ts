import { SiyuanClient } from '../core/http.js';

export interface TagSummary {
  label: string;
  count: number;
}

export interface TagDoc {
  id: string;
  title: string;
  path: string;
}

interface RawTagSummary {
  label?: string;
  count?: number;
}

interface RawTagDoc {
  id?: string;
  title?: string;
  path?: string;
  hpath?: string;
  content?: string;
}

export interface TagService {
  list(): Promise<TagSummary[]>;
  docs(label: string): Promise<TagDoc[]>;
  rename(oldLabel: string, newLabel: string): Promise<unknown>;
  remove(label: string): Promise<unknown>;
}

function normalizeTagSummary(tag: RawTagSummary): TagSummary {
  return {
    label: tag.label?.trim() || '(unknown tag)',
    count: typeof tag.count === 'number' ? tag.count : 0,
  };
}

function normalizeTagDoc(doc: RawTagDoc, index: number): TagDoc {
  return {
    id: doc.id?.trim() || `doc-${index + 1}`,
    title: doc.title?.trim() || doc.content?.trim() || `Document ${index + 1}`,
    path: doc.hpath?.trim() || doc.path?.trim() || '(no path)',
  };
}

export function createTagService(client: SiyuanClient): TagService {
  return {
    async list() {
      const tags = await client.request<RawTagSummary[]>('/api/tag/getTag', {});
      return (tags || []).map(normalizeTagSummary);
    },
    async docs(label) {
      const docs = await client.request<RawTagDoc[]>('/api/tag/getTagDoc', { label });
      return (docs || []).map((doc, index) => normalizeTagDoc(doc, index));
    },
    async rename(oldLabel, newLabel) {
      return client.request('/api/tag/renameTag', { oldLabel, newLabel });
    },
    async remove(label) {
      return client.request('/api/tag/removeTag', { label });
    },
  };
}
