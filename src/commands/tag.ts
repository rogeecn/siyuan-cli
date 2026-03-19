import { Command } from 'commander';
import { requestConfirmation, type ConfirmationHandler } from '../core/confirm.js';
import { printOutput } from '../formatters/output.js';
import type { TagDoc, TagService, TagSummary } from '../services/tag.js';

interface OutputOptions {
  json?: boolean;
}

interface TagDocsOptions extends OutputOptions {
  label: string;
}

interface TagRenameOptions extends OutputOptions {
  old: string;
  new: string;
}

interface TagRemoveOptions extends OutputOptions {
  label: string;
  yes?: boolean;
}

type TagServiceFactory = () => TagService;

function formatTagList(tags: TagSummary[]) {
  if (tags.length === 0) {
    return 'No results found.';
  }

  return tags.map((tag, index) => `${index + 1}. ${tag.label} (${tag.count})`).join('\n');
}

function formatTagDocs(docs: TagDoc[]) {
  if (docs.length === 0) {
    return 'No results found.';
  }

  return docs
    .map((doc, index) => [`${index + 1}. ${doc.title}`, `   ${doc.path}`].join('\n'))
    .join('\n\n');
}

export function createTagCommand(
  createService: TagServiceFactory,
  confirm: ConfirmationHandler = async () => false,
) {
  const command = new Command('tag').description('Inspect tags and tagged documents');

  command
    .command('list')
    .description('List tags')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const tags = await createService().list();
      printOutput(tags, options, (value) => formatTagList(value as TagSummary[]));
    });

  command
    .command('docs')
    .description('List documents for one tag')
    .requiredOption('--label <tag>', 'Tag label')
    .option('--json', 'Print raw JSON output')
    .action(async (options: TagDocsOptions) => {
      const docs = await createService().docs(options.label);
      printOutput(docs, options, (value) => formatTagDocs(value as TagDoc[]));
    });

  command
    .command('rename')
    .description('Rename a tag')
    .requiredOption('--old <label>', 'Current tag label')
    .requiredOption('--new <label>', 'New tag label')
    .option('--json', 'Print raw JSON output')
    .action(async (options: TagRenameOptions) => {
      const result = await createService().rename(options.old, options.new);
      printOutput(result, options, () => `Renamed tag ${options.old} to ${options.new}`);
    });

  command
    .command('remove')
    .description('Remove a tag')
    .requiredOption('--label <tag>', 'Tag label')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Print raw JSON output')
    .action(async (options: TagRemoveOptions) => {
      await requestConfirmation(options, confirm);
      const result = await createService().remove(options.label);
      printOutput(result, options, () => `Removed tag ${options.label}`);
    });

  return command;
}
