import { SiyuanApiError, SiyuanClient } from '../core/http.js';

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

function normalizeTemplatePath(path: string) {
  if (path.startsWith('/templates/')) {
    return `/data${path}`;
  }

  return path;
}

export function createTemplateService(client: SiyuanClient): TemplateService {
  return {
    async list() {
      return (await client.request<string[]>('/api/template/searchTemplate', { k: '' })) || [];
    },
    async get(path) {
      const normalizedPath = normalizeTemplatePath(path);

      try {
        const result = await client.request<string>('/api/file/getFile', { path: normalizedPath });
        return {
          path: normalizedPath,
          content: result ?? '',
        };
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
          body: JSON.stringify({ path: normalizedPath }),
        });
        const content = await response.text();
        return { path: normalizedPath, content };
      }
    },
    async render(path, id) {
      return client.request('/api/template/renderSprig', { path, id });
    },
    async remove(path) {
      return client.request('/api/template/removeTemplate', { path });
    },
  };
}
