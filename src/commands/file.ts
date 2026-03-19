import { Command } from 'commander';
import { requestConfirmation, type ConfirmationHandler } from '../core/confirm.js';
import { printOutput } from '../formatters/output.js';
import type { FileReadResult, FileService, FileTreeNode } from '../services/file.js';

interface OutputOptions {
  json?: boolean;
}

interface FilePathOptions extends OutputOptions {
  path: string;
}

interface FileWriteOptions extends OutputOptions {
  path: string;
  content: string;
}

interface FileRemoveOptions extends OutputOptions {
  path: string;
  yes?: boolean;
}

type FileServiceFactory = () => FileService;

function formatTree(items: FileTreeNode[]) {
  if (items.length === 0) {
    return 'No results found.';
  }

  return items
    .map((item, index) => `${index + 1}. ${item.name}${item.isDir ? '/' : ''}`)
    .join('\n');
}

function formatRead(result: FileReadResult) {
  return result.content;
}

export function createFileCommand(
  createService: FileServiceFactory,
  confirm: ConfirmationHandler = async () => false,
) {
  const command = new Command('file').description('Browse and read files');

  command
    .command('tree')
    .description('List files under a path')
    .requiredOption('--path <path>', 'File or directory path')
    .option('--json', 'Print raw JSON output')
    .action(async (options: FilePathOptions) => {
      const items = await createService().tree(options.path);
      printOutput(items, options, (value) => formatTree(value as FileTreeNode[]));
    });

  command
    .command('read')
    .description('Read file content from a path')
    .requiredOption('--path <path>', 'File or directory path')
    .option('--json', 'Print raw JSON output')
    .action(async (options: FilePathOptions) => {
      const result = await createService().read(options.path);
      printOutput(result, options, (value) => formatRead(value as FileReadResult));
    });

  command
    .command('write')
    .description('Write content to a file')
    .requiredOption('--path <path>', 'File path')
    .requiredOption('--content <text>', 'File content')
    .option('--json', 'Print raw JSON output')
    .action(async (options: FileWriteOptions) => {
      const result = await createService().write(options.path, options.content);
      printOutput(result, options, () => `Wrote file ${options.path}`);
    });

  command
    .command('remove')
    .description('Remove a file')
    .requiredOption('--path <path>', 'File path')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Print raw JSON output')
    .action(async (options: FileRemoveOptions) => {
      await requestConfirmation(options, confirm);
      const result = await createService().remove(options.path);
      printOutput(result, options, () => `Removed file ${options.path}`);
    });

  return command;
}
