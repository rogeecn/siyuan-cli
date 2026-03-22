import { Command } from 'commander';
import { createAttrCommand } from '../commands/attr.js';
import { createBlockCommand } from '../commands/block.js';
import { createDocCommand } from '../commands/doc.js';
import { createExportCommand } from '../commands/export.js';
import { createFileCommand } from '../commands/file.js';
import { createNotebookCommand } from '../commands/notebook.js';
import { createNotifyCommand } from '../commands/notify.js';
import { createSearchCommand } from '../commands/search.js';
import { createSnapshotCommand } from '../commands/snapshot.js';
import { createSqlCommand } from '../commands/sql.js';
import { createSystemCommand } from '../commands/system.js';
import { createTagCommand } from '../commands/tag.js';
import { createTemplateCommand } from '../commands/template.js';
import { loadEnvConfig } from '../core/env.js';
import { SiyuanClient } from '../core/http.js';
import { createAttrService } from '../services/attr.js';
import { createBlockService } from '../services/block.js';
import { createDocService } from '../services/doc.js';
import { createExportService } from '../services/export.js';
import { createFileService } from '../services/file.js';
import { createNotebookService } from '../services/notebook.js';
import { createNotifyService } from '../services/notify.js';
import { createSearchService } from '../services/search.js';
import { createSnapshotService } from '../services/snapshot.js';
import { createSqlService } from '../services/sql.js';
import { createSystemService } from '../services/system.js';
import { createTagService } from '../services/tag.js';
import { createTemplateService } from '../services/template.js';

export function createCli() {
  const program = new Command();

  program
    .name('siyuan')
    .description('Human-friendly CLI for SiYuan Note')
    .version('0.1.0');

  program.addCommand(
    createSystemCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createSystemService(client);
    })
  );

  program.addCommand(
    createAttrCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createAttrService(client);
    })
  );

  program.addCommand(
    createBlockCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createBlockService(client);
    })
  );

  program.addCommand(
    createSearchCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createSearchService(client);
    })
  );

  program.addCommand(
    createSnapshotCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createSnapshotService(client);
    })
  );

  program.addCommand(
    createTemplateCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createTemplateService(client);
    })
  );

  program.addCommand(
    createNotifyCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createNotifyService(client);
    })
  );

  program.addCommand(
    createDocCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);
      const fileService = createFileService(client);

      return createDocService(client, fileService);
    })
  );

  program.addCommand(
    createExportCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createExportService(client);
    })
  );

  program.addCommand(
    createFileCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createFileService(client);
    })
  );

  program.addCommand(
    createSqlCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createSqlService(client);
    })
  );

  program.addCommand(
    createTagCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createTagService(client);
    })
  );

  program.addCommand(
    createNotebookCommand(() => {
      const config = loadEnvConfig();
      const client = new SiyuanClient(config);

      return createNotebookService(client);
    })
  );

  return program;
}
