import { Command } from 'commander';
import { requestConfirmation, type ConfirmationHandler } from '../core/confirm.js';
import { printOutput } from '../formatters/output.js';
import type { CurrentSnapshot, SnapshotService, SnapshotSummary } from '../services/snapshot.js';

interface OutputOptions {
  json?: boolean;
}

interface SnapshotCreateOptions extends OutputOptions {
  memo: string;
}

interface SnapshotIdOptions extends OutputOptions {
  id: string;
  yes?: boolean;
}

type SnapshotServiceFactory = () => SnapshotService;

function formatSnapshotList(items: SnapshotSummary[]) {
  if (items.length === 0) {
    return 'No results found.';
  }

  return items.map((item, index) => `${index + 1}. ${item.id} - ${item.time}`).join('\n');
}

function formatCurrentSnapshot(item: CurrentSnapshot) {
  return [`id: ${item.id}`, `time: ${item.time}`, `memo: ${item.memo}`].join('\n');
}

export function createSnapshotCommand(
  createService: SnapshotServiceFactory,
  confirm: ConfirmationHandler = async () => false,
) {
  const command = new Command('snapshot').description('Inspect repository snapshots');

  command
    .command('list')
    .description('List snapshots')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const items = await createService().list();
      printOutput(items, options, (value) => formatSnapshotList(value as SnapshotSummary[]));
    });

  command
    .command('current')
    .description('Show current snapshot')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const item = await createService().current();
      printOutput(item, options, (value) => formatCurrentSnapshot(value as CurrentSnapshot));
    });

  command
    .command('create')
    .description('Create a snapshot')
    .requiredOption('--memo <text>', 'Snapshot memo')
    .option('--json', 'Print raw JSON output')
    .action(async (options: SnapshotCreateOptions) => {
      const result = await createService().create(options.memo);
      printOutput(result, options, () => `Created snapshot: ${options.memo}`);
    });

  command
    .command('restore')
    .description('Restore a snapshot')
    .requiredOption('--id <snapshot-id>', 'Snapshot id')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Print raw JSON output')
    .action(async (options: SnapshotIdOptions) => {
      await requestConfirmation(options, confirm);
      const result = await createService().restore(options.id);
      printOutput(result, options, () => `Restored snapshot ${options.id}`);
    });

  command
    .command('remove')
    .description('Remove a snapshot')
    .requiredOption('--id <snapshot-id>', 'Snapshot id')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Print raw JSON output')
    .action(async (options: SnapshotIdOptions) => {
      await requestConfirmation(options, confirm);
      const result = await createService().remove(options.id);
      printOutput(result, options, () => `Removed snapshot ${options.id}`);
    });

  return command;
}
