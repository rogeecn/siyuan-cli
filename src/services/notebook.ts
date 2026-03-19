import { SiyuanClient } from '../core/http.js';

export interface Notebook {
  id: string;
  name: string;
  closed: boolean;
}

interface NotebookListResponse {
  notebooks?: Array<Partial<Notebook>>;
}

interface NotebookGetResponse {
  notebook?: Partial<Notebook>;
}

interface NotebookCreateResponse {
  notebook?: {
    id?: string;
  };
}

export interface NotebookService {
  list(): Promise<Notebook[]>;
  get(id: string): Promise<Notebook>;
  create(name: string): Promise<{ id: string }>;
  open(id: string): Promise<unknown>;
  close(id: string): Promise<unknown>;
  rename(id: string, name: string): Promise<unknown>;
  remove(id: string): Promise<unknown>;
}

function validateRequiredString(value: string, flagName: string) {
  if (value.trim() === '') {
    throw new Error(`${flagName} must not be empty`);
  }

  return value.trim();
}

function normalizeNotebook(input: Partial<Notebook> | undefined) {
  const id = input?.id?.trim();
  const name = input?.name?.trim();

  if (!id || !name) {
    throw new Error('Notebook response is missing required fields');
  }

  return {
    id,
    name,
    closed: Boolean(input?.closed),
  };
}

export function createNotebookService(client: SiyuanClient): NotebookService {
  return {
    async list() {
      const response = await client.request<NotebookListResponse>('/api/notebook/lsNotebooks');
      return (response.notebooks || []).map((notebook) => normalizeNotebook(notebook));
    },
    async get(id) {
      const notebookId = validateRequiredString(id, '--id');
      const response = await client.request<NotebookGetResponse>('/api/notebook/getNotebookByID', {
        notebook: notebookId,
      });
      return normalizeNotebook(response.notebook);
    },
    async create(name) {
      const notebookName = validateRequiredString(name, '--name');
      const response = await client.request<NotebookCreateResponse>('/api/notebook/createNotebook', { name: notebookName });
      const id = response.notebook?.id?.trim();

      if (!id) {
        throw new Error('Notebook response is missing required fields');
      }

      return { id };
    },
    async open(id) {
      const notebookId = validateRequiredString(id, '--id');
      return client.request<unknown>('/api/notebook/openNotebook', { notebook: notebookId });
    },
    async close(id) {
      const notebookId = validateRequiredString(id, '--id');
      return client.request<unknown>('/api/notebook/closeNotebook', { notebook: notebookId });
    },
    async rename(id, name) {
      const notebookId = validateRequiredString(id, '--id');
      const notebookName = validateRequiredString(name, '--name');
      return client.request<unknown>('/api/notebook/renameNotebook', {
        notebook: notebookId,
        name: notebookName,
      });
    },
    async remove(id) {
      const notebookId = validateRequiredString(id, '--id');
      return client.request<unknown>('/api/notebook/removeNotebook', { notebook: notebookId });
    },
  };
}
