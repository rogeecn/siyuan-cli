import { createCli } from '../../src/cli/index.js';

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
});
