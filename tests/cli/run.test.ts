import { jest } from '@jest/globals';

const createCliMock = jest.fn<() => { parseAsync: (argv: string[]) => Promise<void> }>();
const stderrWriteMock = jest.fn<(chunk: string | Uint8Array) => boolean>();
const originalArgv = process.argv;
const originalExit = process.exit;
const originalStderrWrite = process.stderr.write;

jest.unstable_mockModule('../../src/cli/index.js', () => ({
  createCli: createCliMock,
}));

describe('cli runner', () => {
  beforeEach(() => {
    createCliMock.mockReset();
    stderrWriteMock.mockReset();
    process.argv = ['node', 'siyuan', 'system', 'version'];
    process.stderr.write = stderrWriteMock as typeof process.stderr.write;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    process.stderr.write = originalStderrWrite;
    jest.resetModules();
  });

  test('prints a concise error and exits non-zero when command execution fails', async () => {
    const parseAsyncMock: (argv: string[]) => Promise<void> = async () => {
      throw new Error('SIYUAN_BASE_URL is required');
    };

    createCliMock.mockReturnValue({
      parseAsync: parseAsyncMock,
    });

    await import('../../src/cli/run.js');

    expect(stderrWriteMock).toHaveBeenCalledWith('SIYUAN_BASE_URL is required\n');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
