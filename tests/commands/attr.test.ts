import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('attr command', () => {
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

  test('gets block attributes with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { alias: 'project-note', 'custom-color': 'blue' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'get', '--id', 'blk-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/attr/getBlockAttrs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'blk-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith(['alias: project-note', 'custom-color: blue'].join('\n'));
  });

  test('gets block attributes with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { alias: 'project-note', 'custom-color': 'blue' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'get', '--id', 'blk-1', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "alias": "project-note",
  "custom-color": "blue"
}`);
  });

  test('lists attribute keys with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: ['alias', 'custom-color'] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'list']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/attr/getAllKeys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith(['1. alias', '2. custom-color'].join('\n'));
  });

  test('lists attribute keys with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: ['alias', 'custom-color'] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'list', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  "alias",
  "custom-color"
]`);
  });

  test('prints an empty JSON array when attr list returns an empty response body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => '',
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'list', '--json']);

    expect(logSpy).toHaveBeenCalledWith('[]');
  });

  test('prints a friendly message for empty attribute key results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'list']);

    expect(logSpy).toHaveBeenCalledWith('No results found.');
  });

  test('sets an attribute with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'set', '--id', 'blk-1', '--key', 'custom-color', '--value', 'red']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/attr/setBlockAttrs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'blk-1', attrs: { 'custom-color': 'red' } }),
    });
    expect(logSpy).toHaveBeenCalledWith('Set attribute custom-color=red on block blk-1');
  });

  test('sets an attribute with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node', 'siyuan', 'attr', 'set', '--id', 'blk-1', '--key', 'custom-color', '--value', 'red', '--json',
    ]);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('resets an attribute with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'reset', '--id', 'blk-1', '--key', 'custom-color']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/attr/setBlockAttrs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'blk-1', attrs: { 'custom-color': '' } }),
    });
    expect(logSpy).toHaveBeenCalledWith('Reset attribute custom-color on block blk-1');
  });

  test('resets an attribute with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'attr', 'reset', '--id', 'blk-1', '--key', 'custom-color', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'attr', 'get', '--id', 'blk-1'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows attr help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'attr', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
