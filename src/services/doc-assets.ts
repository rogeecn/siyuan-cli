import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, resolve } from 'node:path';
import type { BinaryFileInput } from './file.js';

export interface UploadAssetInput {
  data: Blob;
  fileName: string;
  mimeType: string;
}

export interface PrepareMarkdownAssetsOptions {
  markdownFilePath?: string;
  uploadAsset: (input: UploadAssetInput, suggestedName: string) => Promise<string>;
}

const IMAGE_PATTERN = /!\[[^\]]*\]\(([^)]+)\)/g;

function inferMimeTypeFromExtension(fileName: string) {
  const ext = extname(fileName).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function buildSuggestedName(sourceName: string, content: Uint8Array) {
  const hash = createHash('sha1').update(content).digest('hex').slice(0, 8);
  const ext = extname(sourceName) || '.bin';
  const base = basename(sourceName, ext) || 'image';
  return `${base}-${hash}${ext}`;
}

async function loadLocalImage(source: string, markdownFilePath?: string) {
  const resolvedPath = isAbsolute(source)
    ? source
    : markdownFilePath
      ? resolve(dirname(markdownFilePath), source)
      : undefined;

  if (!resolvedPath) {
    throw new Error(`Failed to resolve image: ${source}`);
  }

  const buffer = await readFile(resolvedPath).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to resolve image: ${source} (${message})`);
  });

  const fileName = basename(resolvedPath);
  const mimeType = inferMimeTypeFromExtension(fileName);
  return { bytes: new Uint8Array(buffer), fileName, mimeType };
}

async function loadRemoteImage(source: string) {
  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Failed to resolve image: ${source} (HTTP ${response.status})`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const url = new URL(source);
  const fileName = basename(url.pathname) || 'image';
  const mimeType = response.headers.get('content-type') || inferMimeTypeFromExtension(fileName);
  return { bytes, fileName, mimeType };
}

function loadDataUri(source: string) {
  const match = source.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) {
    throw new Error(`Failed to resolve image: ${source}`);
  }

  const mimeType = match[1] || 'application/octet-stream';
  const isBase64 = Boolean(match[2]);
  const payload = match[3] || '';
  const buffer = isBase64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload), 'utf8');
  const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/jpeg' ? '.jpg' : mimeType === 'image/svg+xml' ? '.svg' : '.bin';
  return { bytes: new Uint8Array(buffer), fileName: `image${ext}`, mimeType };
}

async function resolveImageSource(source: string, markdownFilePath?: string) {
  if (source.startsWith('data:')) {
    return loadDataUri(source);
  }
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return loadRemoteImage(source);
  }
  return loadLocalImage(source, markdownFilePath);
}

export async function prepareMarkdownAssets(markdown: string, options: PrepareMarkdownAssetsOptions) {
  let result = markdown;
  const matches = [...markdown.matchAll(IMAGE_PATTERN)];

  for (const match of matches) {
    const fullMatch = match[0];
    const rawSource = match[1]?.trim();
    if (!rawSource) {
      continue;
    }

    const resolved = await resolveImageSource(rawSource, options.markdownFilePath);
    const suggestedName = buildSuggestedName(resolved.fileName, resolved.bytes);
    const remotePath = await options.uploadAsset(
      {
        data: new Blob([resolved.bytes], { type: resolved.mimeType }),
        fileName: resolved.fileName,
        mimeType: resolved.mimeType,
      },
      suggestedName
    );

    result = result.replace(fullMatch, fullMatch.replace(rawSource, remotePath));
  }

  return { markdown: result };
}

export function buildAssetUploadInput(path: string, data: Blob, fileName: string): BinaryFileInput {
  return {
    path,
    data,
    fileName,
  };
}
