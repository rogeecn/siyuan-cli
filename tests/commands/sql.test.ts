import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('sql command', () => {
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

  test('runs sql query with human-friendly table output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          { id: '20240101010101-abc', content: 'Alpha' },
          { id: '20240101010102-def', content: 'Beta' },
        ],
      }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'sql',
      'query',
      '--statement',
      'select * from blocks limit 2',
    ]);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/query/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ stmt: 'select * from blocks limit 2' }),
    });
    expect(logSpy).toHaveBeenCalledWith([
      'id                 | content',
      '20240101010101-abc | Alpha',
      '20240101010102-def | Beta',
    ].join('\n'));
  });

  test('prints raw json when requested', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [{ id: '20240101010101-abc', content: 'Alpha' }],
      }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'sql',
      'query',
      '--statement',
      'select * from blocks limit 1',
      '--json',
    ]);

    expect(logSpy).toHaveBeenCalledWith(`[
  {
    "id": "20240101010101-abc",
    "content": "Alpha"
  }
]`);
  });

  test('prints a friendly message for empty results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'sql',
      'query',
      '--statement',
      'select * from blocks limit 0',
    ]);

    expect(logSpy).toHaveBeenCalledWith('No results found.');
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(
      createCli().parseAsync([
        'node',
        'siyuan',
        'sql',
        'query',
        '--statement',
        'select * from blocks limit 1',
      ])
    ).rejects.toThrow('SIYUAN_BASE_URL is required');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows sql help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'sql', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
