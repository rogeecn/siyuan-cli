import { Command } from 'commander';
import { printOutput } from '../formatters/output.js';
import type { NotifyItem, NotifyResult, NotifyService } from '../services/notify.js';

interface OutputOptions {
  json?: boolean;
}

interface NotifyPushOptions extends OutputOptions {
  msg: string;
}

type NotifyServiceFactory = () => NotifyService;

function formatNotifyResult(result: NotifyResult) {
  return `Sent notification: ${result.msg}`;
}

function formatNotifyList(items: NotifyItem[]) {
  if (items.length === 0) {
    return 'No results found.';
  }

  return items
    .map((item, index) => [`${index + 1}. ${item.msg}`, `   id: ${item.id}`].join('\n'))
    .join('\n\n');
}

export function createNotifyCommand(createService: NotifyServiceFactory) {
  const command = new Command('notify').description('Send notifications');

  command
    .command('push')
    .description('Push a notification message')
    .requiredOption('--msg <text>', 'Notification message')
    .option('--json', 'Print raw JSON output')
    .action(async (options: NotifyPushOptions) => {
      const result = await createService().push(options.msg);
      printOutput(result, options, (value) => formatNotifyResult(value as NotifyResult));
    });

  command
    .command('list')
    .description('List notifications')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const items = await createService().list();
      printOutput(items, options, (value) => formatNotifyList(value as NotifyItem[]));
    });

  command
    .command('clear')
    .description('Clear all notifications')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const result = await createService().clear();
      printOutput(result, options, () => 'Cleared all notifications');
    });

  return command;
}
