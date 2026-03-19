import { SiyuanClient } from '../core/http.js';

export interface ExportPreview {
  name: string;
  path: string;
  exportPath: string;
}

export interface ExportMarkdownResult {
  document: string;
  markdownPath: string;
}

export interface ExportHtmlResult {
  document: string;
  htmlPath: string;
}

export interface ExportPdfResult {
  document: string;
  pdfPath: string;
}

export interface ExportDocxResult {
  document: string;
  docxPath: string;
}

interface RawExportPreview {
  name?: string;
  path?: string;
  exportPath?: string;
}

interface RawExportMarkdownResult {
  document?: string;
  markdownPath?: string;
}

interface RawExportHtmlResult {
  document?: string;
  htmlPath?: string;
}

interface RawExportPdfResult {
  document?: string;
  pdfPath?: string;
}

interface RawExportDocxResult {
  document?: string;
  docxPath?: string;
}

export interface ExportService {
  preview(id: string): Promise<ExportPreview>;
  markdown(id: string): Promise<ExportMarkdownResult>;
  html(id: string): Promise<ExportHtmlResult>;
  pdf(id: string): Promise<ExportPdfResult>;
  docx(id: string): Promise<ExportDocxResult>;
}

function normalizePreview(result: RawExportPreview): ExportPreview {
  return {
    name: result.name?.trim() || '(unknown)',
    path: result.path?.trim() || '(no path)',
    exportPath: result.exportPath?.trim() || '(no export path)',
  };
}

function normalizeMarkdown(result: RawExportMarkdownResult): ExportMarkdownResult {
  return {
    document: result.document?.trim() || '(unknown)',
    markdownPath: result.markdownPath?.trim() || '(no markdown path)',
  };
}

function normalizeHtml(result: RawExportHtmlResult): ExportHtmlResult {
  return {
    document: result.document?.trim() || '(unknown)',
    htmlPath: result.htmlPath?.trim() || '(no html path)',
  };
}

function normalizePdf(result: RawExportPdfResult): ExportPdfResult {
  return {
    document: result.document?.trim() || '(unknown)',
    pdfPath: result.pdfPath?.trim() || '(no pdf path)',
  };
}

function normalizeDocx(result: RawExportDocxResult): ExportDocxResult {
  return {
    document: result.document?.trim() || '(unknown)',
    docxPath: result.docxPath?.trim() || '(no docx path)',
  };
}

export function createExportService(client: SiyuanClient): ExportService {
  return {
    async preview(id) {
      const result = await client.request<RawExportPreview>('/api/export/preview', { id });
      return normalizePreview(result || {});
    },
    async markdown(id) {
      const result = await client.request<RawExportMarkdownResult>('/api/export/exportMd', { id });
      return normalizeMarkdown(result || {});
    },
    async html(id) {
      const result = await client.request<RawExportHtmlResult>('/api/export/exportHTML', { id });
      return normalizeHtml(result || {});
    },
    async pdf(id) {
      const result = await client.request<RawExportPdfResult>('/api/export/exportPDF', { id });
      return normalizePdf(result || {});
    },
    async docx(id) {
      const result = await client.request<RawExportDocxResult>('/api/export/exportDocx', { id });
      return normalizeDocx(result || {});
    },
  };
}
