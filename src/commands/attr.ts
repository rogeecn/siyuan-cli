import { Command } from 'commander';
import { printOutput } from '../formatters/output.js';
import type { AttrService, BlockAttrs } from '../services/attr.js';

interface OutputOptions {
  json?: boolean;
}

interface AttrGetOptions extends OutputOptions {
  id: string;
}

interface AttrSetOptions extends OutputOptions {
  id: string;
  key: string;
  value: string;
}

interface AttrResetOptions extends OutputOptions {
  id: string;
  key: string;
}

type AttrServiceFactory = () => AttrService;

function formatAttrs(attrs: BlockAttrs) {
  const entries = Object.entries(attrs);

  if (entries.length === 0) {
    return 'No results found.';
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join('\n');
}

function formatKeys(keys: string[]) {
  if (keys.length === 0) {
    return 'No results found.';
  }

  return keys.map((key, index) => `${index + 1}. ${key}`).join('\n');
}

export function createAttrCommand(createService: AttrServiceFactory) {
  const command = new Command('attr').description('Inspect block attributes');

  command
    .command('get')
    .description('Get attributes for one block')
    .requiredOption('--id <block-id>', 'Block id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: AttrGetOptions) => {
      const attrs = await createService().get(options.id);
      printOutput(attrs, options, (value) => formatAttrs(value as BlockAttrs));
    });

  command
    .command('list')
    .description('List available attribute keys')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const keys = await createService().list();
      printOutput(keys, options, (value) => formatKeys(value as string[]));
    });

  command
    .command('set')
    .description('Set an attribute on a block')
    .requiredOption('--id <block-id>', 'Block id')
    .requiredOption('--key <key>', 'Attribute key')
    .requiredOption('--value <value>', 'Attribute value')
    .option('--json', 'Print raw JSON output')
    .action(async (options: AttrSetOptions) => {
      const result = await createService().set(options.id, options.key, options.value);
      printOutput(result, options, () => `Set attribute ${options.key}=${options.value} on block ${options.id}`);
    });

  command
    .command('reset')
    .description('Reset an attribute on a block')
    .requiredOption('--id <block-id>', 'Block id')
    .requiredOption('--key <key>', 'Attribute key')
    .option('--json', 'Print raw JSON output')
    .action(async (options: AttrResetOptions) => {
      const result = await createService().reset(options.id, options.key);
      printOutput(result, options, () => `Reset attribute ${options.key} on block ${options.id}`);
    });

  return command;
}
