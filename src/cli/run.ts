#!/usr/bin/env node

import { createCli } from './index.js';

try {
  await createCli().parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
