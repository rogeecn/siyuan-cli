import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('tag command', () => {
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

  test('lists tags with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          { label: 'work', count: 12 },
          { label: 'project', count: 3 },
        ],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'list']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/tag/getTag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith(['1. work (12)', '2. project (3)'].join('\n'));
  });

  test('lists tags with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [{ label: 'work', count: 12 }] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'list', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  {
    "label": "work",
    "count": 12
  }
]`);
  });

  test('shows docs for one tag with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          { id: 'doc-1', title: 'Work Plan', path: '/Projects/Work Plan' },
          { id: 'doc-2', title: 'Daily Log', path: '/Journal/Daily Log' },
        ],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'docs', '--label', 'work']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/tag/getTagDoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ label: 'work' }),
    });
    expect(logSpy).toHaveBeenCalledWith([
      '1. Work Plan',
      '   /Projects/Work Plan',
      '',
      '2. Daily Log',
      '   /Journal/Daily Log',
    ].join('\n'));
  });

  test('shows docs for one tag with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [{ id: 'doc-1', title: 'Work Plan', path: '/Projects/Work Plan' }],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'docs', '--label', 'work', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  {
    "id": "doc-1",
    "title": "Work Plan",
    "path": "/Projects/Work Plan"
  }
]`);
  });

  test('prints a friendly message for empty tag results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'list']);

    expect(logSpy).toHaveBeenCalledWith('No results found.');
  });

  test('renames a tag with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'rename', '--old', 'work', '--new', 'career']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/tag/renameTag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ oldLabel: 'work', newLabel: 'career' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Renamed tag work to career');
  });

  test('renames a tag with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'rename', '--old', 'work', '--new', 'career', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('requires confirmation before removing a tag by default', async () => {
    await expect(
      createCli().parseAsync(['node', 'siyuan', 'tag', 'remove', '--label', 'work'])
    ).rejects.toThrow('Command aborted by user');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('removes a tag with --yes and friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'remove', '--label', 'work', '--yes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/tag/removeTag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ label: 'work' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Removed tag work');
  });

  test('removes a tag with --yes and raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'tag', 'remove', '--label', 'work', '--yes', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'tag', 'list'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows tag help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'tag', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
