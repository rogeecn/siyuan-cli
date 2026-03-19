import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('template command', () => {
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

  test('lists templates with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: ['/templates/daily.md', '/templates/weekly.md'],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'template', 'list']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/template/searchTemplate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ k: '' }),
    });
    expect(logSpy).toHaveBeenCalledWith(['1. /templates/daily.md', '2. /templates/weekly.md'].join('\n'));
  });

  test('lists templates with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: ['/templates/daily.md'] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'template', 'list', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  "/templates/daily.md"
]`);
  });

  test('gets template content with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { path: '/templates/daily.md', content: '# Daily Note\n\n- item' } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'template', 'get', '--path', '/templates/daily.md']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/template/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ path: '/templates/daily.md' }),
    });
    expect(logSpy).toHaveBeenCalledWith('# Daily Note\n\n- item');
  });

  test('gets template content with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { path: '/templates/daily.md', content: '# Daily Note' } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'template', 'get', '--path', '/templates/daily.md', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "path": "/templates/daily.md",
  "content": "# Daily Note"
}`);
  });

  test('prints a friendly message for empty template results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'template', 'list']);

    expect(logSpy).toHaveBeenCalledWith('No results found.');
  });

  test('renders a template into a document with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node', 'siyuan', 'template', 'render', '--path', '/templates/daily.md', '--id', 'doc-1',
    ]);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/template/renderSprig', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ path: '/templates/daily.md', id: 'doc-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Rendered template /templates/daily.md into doc-1');
  });

  test('renders a template with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node', 'siyuan', 'template', 'render', '--path', '/templates/daily.md', '--id', 'doc-1', '--json',
    ]);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('requires confirmation before removing a template by default', async () => {
    await expect(
      createCli().parseAsync(['node', 'siyuan', 'template', 'remove', '--path', '/templates/daily.md'])
    ).rejects.toThrow('Command aborted by user');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('removes a template with --yes and friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'template', 'remove', '--path', '/templates/daily.md', '--yes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/template/removeTemplate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ path: '/templates/daily.md' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Removed template /templates/daily.md');
  });

  test('removes a template with --yes and raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'template', 'remove', '--path', '/templates/daily.md', '--yes', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'template', 'list'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows template help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'template', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
