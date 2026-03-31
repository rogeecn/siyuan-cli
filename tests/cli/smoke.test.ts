import { createRequire } from 'node:module';
import { createCli } from '../../src/cli/index.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

describe('createCli', () => {
  test('returns a command factory object', () => {
    const cli = createCli();

    expect(cli).toBeDefined();
    expect(typeof cli).toBe('object');
    expect(typeof cli.parseAsync).toBe('function');
  });

  test('uses siyuan-cli as the root command name', () => {
    const cli = createCli();

    expect(cli.name()).toBe('siyuan-cli');
  });

  test('uses the package version for -V output', () => {
    const cli = createCli();

    expect(cli.version()).toBe(version);
  });
});
