import { Command } from 'commander';
import { formatRowTable, printOutput } from '../formatters/output.js';
import type { SqlRow, SqlService } from '../services/sql.js';

interface SqlQueryOptions {
  statement: string;
  json?: boolean;
}

type SqlServiceFactory = () => SqlService;

export function createSqlCommand(createService: SqlServiceFactory) {
  const command = new Command('sql').description('Run SQL queries against SiYuan');

  command
    .command('query')
    .description('Run a read-only SQL query')
    .requiredOption('--statement <sql>', 'SQL statement to execute')
    .option('--json', 'Print raw JSON output')
    .action(async (options: SqlQueryOptions) => {
      const rows = await createService().query(options.statement);
      printOutput(rows, options, (value) => formatRowTable(value as SqlRow[]));
    });

  return command;
}
