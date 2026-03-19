import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('notify command', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;
  let logSpy: jest.SpiedFunction<typeof console.log>;
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
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    logSpy.mockRestore();
  });

  test('pushes a notification with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { msg: 'hello' } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notify', 'push', '--msg', 'hello']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notification/pushMsg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ msg: 'hello' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Sent notification: hello');
  });

  test('pushes a notification with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { msg: 'hello' } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notify', 'push', '--msg', 'hello', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "msg": "hello"
}`);
  });

  test('propagates API failures', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => ({ code: -1, msg: 'notify failed', data: null }),
    } as Response);

    await expect(
      createCli().parseAsync(['node', 'siyuan', 'notify', 'push', '--msg', 'hello'])
    ).rejects.toThrow('HTTP 502 Bad Gateway');
  });

  test('lists notifications with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          { id: 'n-1', msg: 'first' },
          { id: 'n-2', msg: 'second' },
        ],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notify', 'list']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notification/getNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith(['1. first', '   id: n-1', '', '2. second', '   id: n-2'].join('\n'));
  });

  test('lists notifications with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [{ id: 'n-1', msg: 'first' }] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notify', 'list', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  {
    "id": "n-1",
    "msg": "first"
  }
]`);
  });

  test('prints a friendly message for empty notification results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notify', 'list']);

    expect(logSpy).toHaveBeenCalledWith('No results found.');
  });

  test('clears notifications with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notify', 'clear']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notification/clearAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith('Cleared all notifications');
  });

  test('clears notifications with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notify', 'clear', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(
      createCli().parseAsync(['node', 'siyuan', 'notify', 'push', '--msg', 'hello'])
    ).rejects.toThrow('SIYUAN_BASE_URL is required');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows notify help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'notify', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
