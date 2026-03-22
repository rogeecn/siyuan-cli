import { Command } from 'commander';
import { requestConfirmation, type ConfirmationHandler } from '../core/confirm.js';
import type { DocService, CreateDocResult, DocContentInput } from '../services/doc.js';
import { extractMarkdown, resolveMarkdown } from '../services/doc.js';

interface OutputOptions {
  json?: boolean;
}

interface GetDocOptions extends OutputOptions {
  id: string;
}

interface CreateDocOptions extends OutputOptions, DocContentInput {
  notebook: string;
  path: string;
}

interface MutateDocOptions extends OutputOptions, DocContentInput {
  id: string;
}

interface DocPathOptions extends OutputOptions {
  id: string;
  path: string;
}

interface RemoveDocOptions extends OutputOptions {
  id: string;
  yes?: boolean;
}

type DocServiceFactory = () => DocService;

function printJson(data: unknown) {
  console.log(JSON.stringify(data, null, 2));
}

function formatCreateResult(result: CreateDocResult) {
  const id = result.id?.trim() || '(unknown id)';
  const path = result.path?.trim() || '(unknown path)';
  return `Created document ${id} at ${path}`;
}

export function createDocCommand(
  createService: DocServiceFactory,
  confirm: ConfirmationHandler = async () => false,
) {
  const command = new Command('doc').description('Read and edit SiYuan documents');

  command
    .command('get')
    .description('Get a document as Markdown')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: GetDocOptions) => {
      const result = await createService().get(options.id);

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(extractMarkdown(result));
    });

  command
    .command('create')
    .description('Create a document from Markdown content')
    .requiredOption('--notebook <id>', 'Notebook id')
    .requiredOption('--path <path>', 'Document path')
    .option('--content <text>', 'Inline Markdown content')
    .option('--content-file <file>', 'Read Markdown content from a file')
    .option('--json', 'Print raw JSON output')
    .action(async (options: CreateDocOptions) => {
      const resolved = await resolveMarkdown(options);
      const result = await createService().create({
        notebook: options.notebook,
        path: options.path,
        markdown: resolved.markdown,
        sourceFilePath: resolved.sourceFilePath,
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(formatCreateResult(result));
    });

  command
    .command('update')
    .description('Replace a document with new Markdown content')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--content <text>', 'Inline Markdown content')
    .option('--content-file <file>', 'Read Markdown content from a file')
    .option('--json', 'Print raw JSON output')
    .action(async (options: MutateDocOptions) => {
      const resolved = await resolveMarkdown(options);
      const result = await createService().update({
        id: options.id,
        markdown: resolved.markdown,
        sourceFilePath: resolved.sourceFilePath,
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Updated document ${options.id}`);
    });

  command
    .command('append')
    .description('Append Markdown content to a document')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--content <text>', 'Inline Markdown content')
    .option('--content-file <file>', 'Read Markdown content from a file')
    .option('--json', 'Print raw JSON output')
    .action(async (options: MutateDocOptions) => {
      const resolved = await resolveMarkdown(options);
      const result = await createService().append({
        id: options.id,
        markdown: resolved.markdown,
        sourceFilePath: resolved.sourceFilePath,
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Appended to document ${options.id}`);
    });

  command
    .command('rename')
    .description('Rename a document path')
    .requiredOption('--id <document-id>', 'Document id')
    .requiredOption('--path <path>', 'Document path')
    .option('--json', 'Print raw JSON output')
    .action(async (options: DocPathOptions) => {
      const result = await createService().rename({ id: options.id, path: options.path });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Renamed document ${options.id} to ${options.path}`);
    });

  command
    .command('move')
    .description('Move a document to another path')
    .requiredOption('--id <document-id>', 'Document id')
    .requiredOption('--path <path>', 'Target path')
    .option('--json', 'Print raw JSON output')
    .action(async (options: DocPathOptions) => {
      const result = await createService().move({ id: options.id, path: options.path });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Moved document ${options.id} to ${options.path}`);
    });

  command
    .command('remove')
    .description('Remove a document')
    .requiredOption('--id <document-id>', 'Document id')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Print raw JSON output')
    .action(async (options: RemoveDocOptions) => {
      await requestConfirmation(options, confirm);
      const result = await createService().remove(options.id);

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Removed document ${options.id}`);
    });

  return command;
}
