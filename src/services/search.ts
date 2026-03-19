import { SiyuanClient } from '../core/http.js';

export interface SearchQuery {
  content?: string;
  filename?: string;
  tag?: string;
  limit?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  path: string;
  snippet?: string;
  tags: string[];
}

interface SearchBlock {
  id?: string;
  rootID?: string;
  content?: string;
  fcontent?: string;
  hpath?: string;
  path?: string;
  name?: string;
  tag?: string;
}

export interface SearchService {
  search(query: SearchQuery): Promise<SearchResult[]>;
}

function escapeSql(value: string) {
  return value.replace(/'/g, "''");
}

function normalizeTag(tag: string) {
  return tag.replace(/^#+|#+$/g, '').trim();
}

function buildConditions(query: SearchQuery) {
  const conditions: string[] = [];

  if (query.filename?.trim()) {
    const filename = escapeSql(query.filename.trim());
    conditions.push(`type='d'`);
    conditions.push(`(content LIKE '%${filename}%' OR path LIKE '%${filename}%' OR hpath LIKE '%${filename}%')`);
  }

  if (query.content?.trim()) {
    const content = escapeSql(query.content.trim());
    conditions.push(`content LIKE '%${content}%'`);
  }

  if (query.tag?.trim()) {
    const tag = escapeSql(normalizeTag(query.tag));
    conditions.push(`tag LIKE '%#${tag}#%'`);
  }

  if (conditions.length === 0) {
    throw new Error('At least one of --content, --filename, or --tag is required');
  }

  return conditions;
}

function buildSearchStatement(query: SearchQuery) {
  const limit = query.limit ?? 10;
  return `SELECT * FROM blocks WHERE ${buildConditions(query).join(' AND ')} LIMIT ${limit}`;
}

function parseTags(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(/\s+/)
    .map((item) => item.trim())
    .map((item) => item.replace(/^#+|#+$/g, ''))
    .filter(Boolean);
}

function extractSnippet(block: SearchBlock) {
  return block.fcontent?.trim() || block.content?.trim() || undefined;
}

function extractTitle(block: SearchBlock, fallback: string) {
  const hpathTitle = block.hpath?.split('/').filter(Boolean).at(-1)?.trim();
  if (hpathTitle) {
    return hpathTitle;
  }

  if (block.name?.trim()) {
    return block.name.trim();
  }

  const snippet = extractSnippet(block);
  if (snippet) {
    return snippet.slice(0, 80);
  }

  return fallback;
}

function extractPath(block: SearchBlock) {
  return block.hpath?.trim() || block.path?.trim() || '(no path)';
}

export function createSearchService(client: SiyuanClient): SearchService {
  return {
    async search(query) {
      const stmt = buildSearchStatement(query);
      const blocks = await client.request<SearchBlock[]>('/api/query/sql', { stmt });

      return (blocks || []).map((block, index) => ({
        id: block.id?.trim() || block.rootID?.trim() || `result-${index + 1}`,
        title: extractTitle(block, `Result ${index + 1}`),
        path: extractPath(block),
        snippet: extractSnippet(block),
        tags: parseTags(block.tag),
      }));
    },
  };
}
