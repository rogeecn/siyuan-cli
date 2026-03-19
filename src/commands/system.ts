import { Command } from 'commander';
import type { SystemService } from '../services/system.js';

interface OutputOptions {
  json?: boolean;
}

type SystemServiceFactory = () => SystemService;

function printOutput(data: unknown, options: OutputOptions, formatText?: (value: unknown) => string) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (formatText) {
    console.log(formatText(data));
    return;
  }

  console.log(String(data));
}

function formatTime(value: unknown) {
  if (typeof value === 'object' && value !== null && 'time' in value) {
    return String((value as { time: unknown }).time);
  }

  return String(value);
}

function formatBootProgress(value: unknown) {
  if (typeof value === 'object' && value !== null && 'progress' in value) {
    return `${String((value as { progress: unknown }).progress)}%`;
  }

  return String(value);
}

export function createSystemCommand(createService: SystemServiceFactory) {
  const command = new Command('system').description('Inspect SiYuan system state');

  command
    .command('version')
    .description('Show SiYuan system version')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const version = await createService().getVersion();
      printOutput(version, options);
    });

  command
    .command('time')
    .description('Show SiYuan system time')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const time = await createService().getTime();
      printOutput(time, options, formatTime);
    });

  command
    .command('boot-progress')
    .description('Show SiYuan boot progress')
    .option('--json', 'Print raw JSON output')
    .action(async (options: OutputOptions) => {
      const progress = await createService().getBootProgress();
      printOutput(progress, options, formatBootProgress);
    });

  return command;
}
