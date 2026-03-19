import { Command } from 'commander';
import { requestConfirmation, type ConfirmationHandler } from '../core/confirm.js';
import { printOutput } from '../formatters/output.js';
import { resolveMarkdown, type DocContentInput } from '../services/doc.js';
import type { BlockChild, BlockInfo, BlockService } from '../services/block.js';

interface OutputOptions {
  json?: boolean;
}

interface BlockIdOptions extends OutputOptions {
  id: string;
}

interface BlockContentOptions extends OutputOptions, DocContentInput {
  id: string;
}

interface BlockMoveOptions extends OutputOptions {
  id: string;
  parent: string;
}

interface BlockRemoveOptions extends OutputOptions {
  id: string;
  yes?: boolean;
}

type BlockServiceFactory = () => BlockService;

function formatBlockInfo(block: BlockInfo) {
  return [`id: ${block.id}`, `content: ${block.content}`, `path: ${block.path}`].join('\n');
}

function formatBlockChildren(blocks: BlockChild[]) {
  if (blocks.length === 0) {
    return 'No results found.';
  }

  return blocks
    .map((block, index) => [`${index + 1}. ${block.content}`, `   id: ${block.id}`].join('\n'))
    .join('\n\n');
}

export function createBlockCommand(
  createService: BlockServiceFactory,
  confirm: ConfirmationHandler = async () => false,
) {
  const command = new Command('block').description('Inspect blocks and block trees');

  command
    .command('get')
    .description('Get one block by id')
    .requiredOption('--id <block-id>', 'Block id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: BlockIdOptions) => {
      const block = await createService().get(options.id);
      printOutput(block, options, (value) => formatBlockInfo(value as BlockInfo));
    });

  command
    .command('children')
    .description('List child blocks for one block')
    .requiredOption('--id <block-id>', 'Block id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: BlockIdOptions) => {
      const blocks = await createService().children(options.id);
      printOutput(blocks, options, (value) => formatBlockChildren(value as BlockChild[]));
    });

  command
    .command('update')
    .description('Update a block with new content')
    .requiredOption('--id <block-id>', 'Block id')
    .option('--content <text>', 'Inline Markdown content')
    .option('--content-file <file>', 'Read Markdown content from a file')
    .option('--json', 'Print raw JSON output')
    .action(async (options: BlockContentOptions) => {
      const markdown = await resolveMarkdown(options);
      const result = await createService().update({ id: options.id, markdown });
      printOutput(result, options, () => `Updated block ${options.id}`);
    });

  command
    .command('insert')
    .description('Insert a block after the given block')
    .requiredOption('--id <block-id>', 'Block id to insert after')
    .option('--content <text>', 'Inline Markdown content')
    .option('--content-file <file>', 'Read Markdown content from a file')
    .option('--json', 'Print raw JSON output')
    .action(async (options: BlockContentOptions) => {
      const markdown = await resolveMarkdown(options);
      const result = await createService().insert({ id: options.id, markdown });
      printOutput(result, options, () => `Inserted block after ${options.id}`);
    });

  command
    .command('move')
    .description('Move a block to a new parent')
    .requiredOption('--id <block-id>', 'Block id')
    .requiredOption('--parent <parent-id>', 'Target parent block id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: BlockMoveOptions) => {
      const result = await createService().move({ id: options.id, parentID: options.parent });
      printOutput(result, options, () => `Moved block ${options.id} to parent ${options.parent}`);
    });

  command
    .command('remove')
    .description('Remove a block')
    .requiredOption('--id <block-id>', 'Block id')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Print raw JSON output')
    .action(async (options: BlockRemoveOptions) => {
      await requestConfirmation(options, confirm);
      const result = await createService().remove(options.id);
      printOutput(result, options, () => `Removed block ${options.id}`);
    });

  return command;
}
