import { SiyuanClient } from '../core/http.js';

export interface TemplateContent {
  path: string;
  content: string;
}

export interface TemplateService {
  list(): Promise<string[]>;
  get(path: string): Promise<TemplateContent>;
  render(path: string, id: string): Promise<unknown>;
  remove(path: string): Promise<unknown>;
}

interface RawTemplateContent {
  path?: string;
  content?: string;
}

function normalizeTemplateContent(result: RawTemplateContent): TemplateContent {
  return {
    path: result.path?.trim() || '(unknown path)',
    content: result.content ?? '',
  };
}

export function createTemplateService(client: SiyuanClient): TemplateService {
  return {
    async list() {
      return client.request<string[]>('/api/template/searchTemplate', { k: '' });
    },
    async get(path) {
      const result = await client.request<RawTemplateContent>('/api/template/render', { path });
      return normalizeTemplateContent(result || {});
    },
    async render(path, id) {
      return client.request('/api/template/renderSprig', { path, id });
    },
    async remove(path) {
      return client.request('/api/template/removeTemplate', { path });
    },
  };
}
