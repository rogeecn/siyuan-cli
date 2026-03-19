import { Command } from 'commander';
import { requestConfirmation, type ConfirmationHandler } from '../core/confirm.js';
import type { Notebook, NotebookService } from '../services/notebook.js';

interface OutputOptions {
  json?: boolean;
}

interface NotebookIdOptions extends OutputOptions {
  id: string;
}

interface CreateNotebookOptions extends OutputOptions {
  name: string;
}

interface RenameNotebookOptions extends NotebookIdOptions {
  name: string;
}

interface RemoveNotebookOptions extends NotebookIdOptions {
  yes?: boolean;
}

type NotebookServiceFactory = () => NotebookService;

function printJson(data: unknown) {
  console.log(JSON.stringify(data, null, 2));
}

function formatNotebook(notebook: Notebook) {
  return [notebook.name, `id: ${notebook.id}`, `status: ${notebook.closed ? 'closed' : 'open'}`].join('\n   ');
}

function formatNotebookList(notebooks: Notebook[]) {
  if (notebooks.length === 0) {
    return 'No notebooks found.';
  }

  return notebooks
    .map((notebook, index) => `${index + 1}. ${formatNotebook(notebook)}`)
    .join('\n\n');
}

export function createNotebookCommand(
  createService: NotebookServiceFactory,
  confirm: ConfirmationHandler = async () => false,
) {
  const command = new Command('notebook').description('Inspect and manage SiYuan notebooks');

  command
    .command('list')
    .description('List notebooks')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const notebooks = await createService().list();

      if (options.json) {
        printJson(notebooks);
        return;
      }

      console.log(formatNotebookList(notebooks));
    });

  command
    .command('get')
    .description('Get one notebook by id')
    .requiredOption('--id <notebook-id>', 'Notebook id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: NotebookIdOptions) => {
      const notebook = await createService().get(options.id);

      if (options.json) {
        printJson(notebook);
        return;
      }

      console.log(formatNotebook(notebook));
    });

  command
    .command('create')
    .description('Create a notebook')
    .requiredOption('--name <name>', 'Notebook name')
    .option('--json', 'Print raw JSON output')
    .action(async (options: CreateNotebookOptions) => {
      const result = await createService().create(options.name);

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Created notebook ${options.name.trim()} (${result.id})`);
    });

  command
    .command('open')
    .description('Open a notebook')
    .requiredOption('--id <notebook-id>', 'Notebook id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: NotebookIdOptions) => {
      const result = await createService().open(options.id);

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Opened notebook ${options.id.trim()}`);
    });

  command
    .command('close')
    .description('Close a notebook')
    .requiredOption('--id <notebook-id>', 'Notebook id')
    .option('--json', 'Print raw JSON output')
    .action(async (options: NotebookIdOptions) => {
      const result = await createService().close(options.id);

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Closed notebook ${options.id.trim()}`);
    });

  command
    .command('rename')
    .description('Rename a notebook')
    .requiredOption('--id <notebook-id>', 'Notebook id')
    .requiredOption('--name <name>', 'Notebook name')
    .option('--json', 'Print raw JSON output')
    .action(async (options: RenameNotebookOptions) => {
      const result = await createService().rename(options.id, options.name);

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Renamed notebook ${options.id.trim()} to ${options.name.trim()}`);
    });

  command
    .command('remove')
    .description('Remove a notebook')
    .requiredOption('--id <notebook-id>', 'Notebook id')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Print raw JSON output')
    .action(async (options: RemoveNotebookOptions) => {
      await requestConfirmation(options, confirm);
      const result = await createService().remove(options.id);

      if (options.json) {
        printJson(result);
        return;
      }

      console.log(`Removed notebook ${options.id.trim()}`);
    });

  return command;
}
