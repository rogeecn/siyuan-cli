import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('file command', () => {
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

  test('shows file tree with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          { name: 'readme.md', isDir: false },
          { name: 'images', isDir: true },
        ],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'file', 'tree', '--path', '/data/assets']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/file/readDir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ path: '/data/assets' }),
    });
    expect(logSpy).toHaveBeenCalledWith(['1. readme.md', '2. images/'].join('\n'));
  });

  test('shows file tree with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [{ name: 'readme.md', isDir: false }],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'file', 'tree', '--path', '/data/assets', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  {
    "name": "readme.md",
    "isDir": false
  }
]`);
  });

  test('reads file content with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { path: '/data/assets/readme.md', content: '# Hello\n\nWorld' } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'file', 'read', '--path', '/data/assets/readme.md']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/file/getFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ path: '/data/assets/readme.md' }),
    });
    expect(logSpy).toHaveBeenCalledWith('# Hello\n\nWorld');
  });

  test('reads raw text file content responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => '# Hello\n\nWorld',
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'file', 'read', '--path', '/data/assets/readme.md']);

    expect(logSpy).toHaveBeenCalledWith('# Hello\n\nWorld');
  });

  test('reads file content with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { path: '/data/assets/readme.md', content: '# Hello' } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'file', 'read', '--path', '/data/assets/readme.md', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "path": "/data/assets/readme.md",
  "content": "# Hello"
}`);
  });

  test('prints a friendly message for empty tree results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'file', 'tree', '--path', '/data/assets']);

    expect(logSpy).toHaveBeenCalledWith('No results found.');
  });

  test('writes file content with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node', 'siyuan', 'file', 'write', '--path', '/data/assets/note.md', '--content', '# New',
    ]);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:6806/api/file/putFile',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Token secret-token',
        }),
        body: expect.any(FormData),
      })
    );
    expect(logSpy).toHaveBeenCalledWith('Wrote file /data/assets/note.md');
  });

  test('writes file content with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node', 'siyuan', 'file', 'write', '--path', '/data/assets/note.md', '--content', '# New', '--json',
    ]);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('requires confirmation before removing a file by default', async () => {
    await expect(
      createCli().parseAsync(['node', 'siyuan', 'file', 'remove', '--path', '/data/assets/old.md'])
    ).rejects.toThrow('Command aborted by user');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('removes a file with --yes and friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'file', 'remove', '--path', '/data/assets/old.md', '--yes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/file/removeFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ path: '/data/assets/old.md' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Removed file /data/assets/old.md');
  });

  test('removes a file with --yes and raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'file', 'remove', '--path', '/data/assets/old.md', '--yes', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'file', 'tree', '--path', '/data/assets'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows file help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'file', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
