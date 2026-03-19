import { Command } from 'commander';
import { printOutput } from '../formatters/output.js';
import type {
  ExportDocxResult,
  ExportHtmlResult,
  ExportMarkdownResult,
  ExportPdfResult,
  ExportPreview,
  ExportService,
} from '../services/export.js';

interface OutputOptions {
  json?: boolean;
}

interface ExportIdOptions extends OutputOptions {
  id: string;
}

type ExportServiceFactory = () => ExportService;

function formatPreview(result: ExportPreview) {
  return [`name: ${result.name}`, `path: ${result.path}`, `exportPath: ${result.exportPath}`].join('\n');
}

function formatMarkdown(result: ExportMarkdownResult) {
  return [`document: ${result.document}`, `markdownPath: ${result.markdownPath}`].join('\n');
}

function formatHtml(result: ExportHtmlResult) {
  return [`document: ${result.document}`, `htmlPath: ${result.htmlPath}`].join('\n');
}

function formatPdf(result: ExportPdfResult) {
  return [`document: ${result.document}`, `pdfPath: ${result.pdfPath}`].join('\n');
}

function formatDocx(result: ExportDocxResult) {
  return [`document: ${result.document}`, `docxPath: ${result.docxPath}`].join('\n');
}

export function createExportCommand(createService: ExportServiceFactory) {
  const command = new Command('export').description('Preview and export documents');

  command
    .command('preview')
    .description('Preview export details for one document')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: ExportIdOptions) => {
      const result = await createService().preview(options.id);
      printOutput(result, options, (value) => formatPreview(value as ExportPreview));
    });

  command
    .command('markdown')
    .description('Export one document as Markdown')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: ExportIdOptions) => {
      const result = await createService().markdown(options.id);
      printOutput(result, options, (value) => formatMarkdown(value as ExportMarkdownResult));
    });

  command
    .command('html')
    .description('Export one document as HTML')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: ExportIdOptions) => {
      const result = await createService().html(options.id);
      printOutput(result, options, (value) => formatHtml(value as ExportHtmlResult));
    });

  command
    .command('pdf')
    .description('Export one document as PDF')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: ExportIdOptions) => {
      const result = await createService().pdf(options.id);
      printOutput(result, options, (value) => formatPdf(value as ExportPdfResult));
    });

  command
    .command('docx')
    .description('Export one document as DOCX')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: ExportIdOptions) => {
      const result = await createService().docx(options.id);
      printOutput(result, options, (value) => formatDocx(value as ExportDocxResult));
    });

  return command;
}
