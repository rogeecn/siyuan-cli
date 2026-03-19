import { Command } from 'commander';
import { requestConfirmation, type ConfirmationHandler } from '../core/confirm.js';
import { printOutput } from '../formatters/output.js';
import type { TemplateContent, TemplateService } from '../services/template.js';

interface OutputOptions {
  json?: boolean;
}

interface TemplatePathOptions extends OutputOptions {
  path: string;
}

interface TemplateRenderOptions extends OutputOptions {
  path: string;
  id: string;
}

interface TemplateRemoveOptions extends OutputOptions {
  path: string;
  yes?: boolean;
}

type TemplateServiceFactory = () => TemplateService;

function formatTemplateList(items: string[]) {
  if (items.length === 0) {
    return 'No results found.';
  }

  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

function formatTemplateContent(result: TemplateContent) {
  return result.content;
}

export function createTemplateCommand(
  createService: TemplateServiceFactory,
  confirm: ConfirmationHandler = async () => false,
) {
  const command = new Command('template').description('Inspect templates');

  command
    .command('list')
    .description('List templates')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const items = await createService().list();
      printOutput(items, options, (value) => formatTemplateList(value as string[]));
    });

  command
    .command('get')
    .description('Read one template by path')
    .requiredOption('--path <template>', 'Template path')
    .option('--json', 'Print raw JSON output')
    .action(async (options: TemplatePathOptions) => {
      const result = await createService().get(options.path);
      printOutput(result, options, (value) => formatTemplateContent(value as TemplateContent));
    });

  command
    .command('render')
    .description('Render a template into a document')
    .requiredOption('--path <template>', 'Template path')
    .requiredOption('--id <document-id>', 'Target document id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: TemplateRenderOptions) => {
      const result = await createService().render(options.path, options.id);
      printOutput(result, options, () => `Rendered template ${options.path} into ${options.id}`);
    });

  command
    .command('remove')
    .description('Remove a template')
    .requiredOption('--path <template>', 'Template path')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Print raw JSON output')
    .action(async (options: TemplateRemoveOptions) => {
      await requestConfirmation(options, confirm);
      const result = await createService().remove(options.path);
      printOutput(result, options, () => `Removed template ${options.path}`);
    });

  return command;
}
