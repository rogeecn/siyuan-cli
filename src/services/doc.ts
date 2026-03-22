import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { SiyuanClient } from '../core/http.js';
import { buildAssetUploadInput, prepareMarkdownAssets } from './doc-assets.js';
import type { FileService } from './file.js';

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
  sourceFilePath?: string;
}

export interface CreateDocResult {
  id?: string;
  path?: string;
  notebook?: string;
}

export interface UpdateDocInput {
  id: string;
  markdown: string;
  sourceFilePath?: string;
}

export interface AppendDocInput {
  id: string;
  markdown: string;
  sourceFilePath?: string;
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

export interface ResolvedMarkdown {
  markdown: string;
  sourceFilePath?: string;
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

export async function resolveMarkdown(input: DocContentInput): Promise<ResolvedMarkdown> {
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
    return { markdown: input.content };
  }

  const filePath = input.contentFile!.trim();

  try {
    return {
      markdown: await readFile(filePath, 'utf8'),
      sourceFilePath: filePath,
    };
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

function normalizeCreateDocResult(result: CreateDocResult | string): CreateDocResult {
  if (typeof result === 'string') {
    return { id: result };
  }

  return result || {};
}

async function prepareDocMarkdown(markdown: string, sourceFilePath: string | undefined, fileService: FileService) {
  return prepareMarkdownAssets(markdown, {
    markdownFilePath: sourceFilePath,
    uploadAsset: async (input, suggestedName) => {
      const remotePath = `/data/assets/cli-publish/${new Date().toISOString().slice(0, 10)}/${suggestedName}`;
      await fileService.writeBinary(buildAssetUploadInput(remotePath, input.data, input.fileName || basename(remotePath)));
      return remotePath;
    },
  });
}

export function createDocService(client: SiyuanClient, fileService?: FileService): DocService {
  return {
    async get(id) {
      const result = await client.request<GetDocResult>('/api/filetree/getDoc', { id });

      if (!result) {
        throw new Error('Document response is empty');
      }

      return result;
    },
    async create(input) {
      const prepared = fileService
        ? await prepareDocMarkdown(input.markdown, input.sourceFilePath, fileService)
        : { markdown: input.markdown };
      const result = await client.request<CreateDocResult | string>('/api/filetree/createDocWithMd', {
        notebook: input.notebook,
        path: input.path,
        markdown: prepared.markdown,
      });

      if (!result) {
        throw new Error('Create document response is empty');
      }

      return normalizeCreateDocResult(result);
    },
    async update({ id, markdown, sourceFilePath }) {
      const prepared = fileService ? await prepareDocMarkdown(markdown, sourceFilePath, fileService) : { markdown };
      return client.request('/api/block/updateBlock', { id, data: prepared.markdown, dataType: 'markdown' });
    },
    async append({ id, markdown, sourceFilePath }) {
      const prepared = fileService ? await prepareDocMarkdown(markdown, sourceFilePath, fileService) : { markdown };
      return client.request('/api/filetree/appendBlock', {
        id,
        data: prepared.markdown,
        dataType: 'markdown',
      });
    },
    rename({ id, path }) {
      return client.request('/api/filetree/renameDocByID', {
        id: requireValue(id, '--id'),
        title: requireValue(path, '--path'),
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
      return client.request('/api/filetree/removeDocByID', {
        id: requireValue(id, '--id'),
      });
    },
  };
}
