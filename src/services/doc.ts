import { readFile } from 'node:fs/promises';
import { SiyuanClient } from '../core/http.js';

export interface DocContentInput {
  content?: string;
  contentFile?: string;
}

export interface GetDocResult {
  id?: string;
  markdown?: string;
}

export interface CreateDocInput {
  notebook: string;
  path: string;
  markdown: string;
}

export interface CreateDocResult {
  id?: string;
  path?: string;
  notebook?: string;
}

export interface UpdateDocInput {
  id: string;
  markdown: string;
}

export interface AppendDocInput {
  id: string;
  markdown: string;
}

export interface RenameDocInput {
  id: string;
  path: string;
}

export interface MoveDocInput {
  id: string;
  path: string;
}

export interface DocService {
  get(id: string): Promise<GetDocResult>;
  create(input: CreateDocInput): Promise<CreateDocResult>;
  update(input: UpdateDocInput): Promise<unknown>;
  append(input: AppendDocInput): Promise<unknown>;
  rename(input: RenameDocInput): Promise<unknown>;
  move(input: MoveDocInput): Promise<unknown>;
  remove(id: string): Promise<unknown>;
}

function hasValue(value: string | undefined) {
  return value !== undefined && value.trim() !== '';
}

function requireValue(value: string, flagName: string) {
  const trimmed = value.trim();

  if (trimmed === '') {
    throw new Error(`${flagName} must not be empty`);
  }

  return trimmed;
}

export function hasSingleContentSource(input: DocContentInput) {
  const hasContent = hasValue(input.content);
  const hasContentFile = hasValue(input.contentFile);
  return Number(hasContent) + Number(hasContentFile) === 1;
}

export async function resolveMarkdown(input: DocContentInput) {
  if (input.content !== undefined && input.content.trim() === '') {
    throw new Error('--content must not be empty');
  }

  if (input.contentFile !== undefined && input.contentFile.trim() === '') {
    throw new Error('--content-file must not be empty');
  }

  if (!hasSingleContentSource(input)) {
    throw new Error('Exactly one of --content or --content-file is required');
  }

  if (input.content !== undefined) {
    return input.content;
  }

  const filePath = input.contentFile!.trim();

  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read --content-file: ${message}`);
  }
}

export function extractMarkdown(result: unknown) {
  if (typeof result === 'string') {
    return result;
  }

  if (typeof result === 'object' && result !== null && 'markdown' in result) {
    const markdown = (result as { markdown?: unknown }).markdown;
    if (typeof markdown === 'string') {
      return markdown;
    }
  }

  if (typeof result === 'object' && result !== null && 'content' in result) {
    const content = (result as { content?: unknown }).content;
    if (typeof content === 'string') {
      return content;
    }
  }

  throw new Error('Document response does not contain markdown content');
}

export function createDocService(client: SiyuanClient): DocService {
  return {
    async get(id) {
      const result = await client.request<GetDocResult>('/api/filetree/getDoc', { id });

      if (!result) {
        throw new Error('Document response is empty');
      }

      return result;
    },
    async create(input) {
      const result = await client.request<CreateDocResult>('/api/filetree/createDocWithMd', input);

      if (!result) {
        throw new Error('Create document response is empty');
      }

      return result;
    },
    update({ id, markdown }) {
      return client.request('/api/filetree/putDoc', { id, markdown });
    },
    append({ id, markdown }) {
      return client.request('/api/filetree/appendBlock', {
        id,
        data: markdown,
        dataType: 'markdown',
      });
    },
    rename({ id, path }) {
      return client.request('/api/filetree/renameDoc', {
        id: requireValue(id, '--id'),
        path: requireValue(path, '--path'),
      });
    },
    move({ id, path }) {
      return client.request('/api/filetree/moveDocs', {
        fromPaths: [requireValue(id, '--id')],
        toNotebook: '',
        toPath: requireValue(path, '--path'),
      });
    },
    remove(id) {
      return client.request('/api/filetree/removeDoc', {
        id: requireValue(id, '--id'),
      });
    },
  };
}
