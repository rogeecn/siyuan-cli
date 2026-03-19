import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('system commands', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;
  let logSpy: jest.SpiedFunction<typeof console.log>;
  let errorSpy: jest.SpiedFunction<typeof console.error>;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SIYUAN_BASE_URL: 'http://127.0.0.1:6806',
      SIYUAN_TOKEN: 'secret-token',
    };

    fetchMock = jest.fn<typeof fetch>() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('allows help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const cli = createCli();
    cli.exitOverride();

    await expect(cli.parseAsync(['node', 'siyuan', '--help'])).rejects.toMatchObject({
      code: 'commander.helpDisplayed',
      exitCode: 0,
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalledWith(expect.stringContaining('SIYUAN_BASE_URL'));
  });

  test('runs system version with human-readable output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: '3.1.2' }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'system', 'version']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/system/version', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith('3.1.2');
  });

  test('runs system time with json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { time: 1710000000000 } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'system', 'time', '--json']);

    expect(logSpy).toHaveBeenCalledWith('{\n  "time": 1710000000000\n}');
  });

  test('runs system boot-progress with friendly percentage output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { progress: 87 } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'system', 'boot-progress']);

    expect(logSpy).toHaveBeenCalledWith('87%');
  });

  test('fails at command runtime when required environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'system', 'version'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('propagates API failures from system commands', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => ({ code: -1, msg: 'upstream failed', data: null }),
    } as Response);

    await expect(createCli().parseAsync(['node', 'siyuan', 'system', 'time'])).rejects.toThrow(
      'HTTP 502 Bad Gateway'
    );
  });
});
