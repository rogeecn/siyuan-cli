import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('block command', () => {
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

  test('gets one block with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { rootID: 'blk-1', rootTitle: 'Alpha block', path: '/Projects/Spec' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'get', '--id', 'blk-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/block/getBlockInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'blk-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith(['id: blk-1', 'content: Alpha block', 'path: /Projects/Spec'].join('\n'));
  });

  test('gets one block with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { rootID: 'blk-1', rootTitle: 'Alpha block', path: '/Projects/Spec' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'get', '--id', 'blk-1', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "id": "blk-1",
  "content": "Alpha block",
  "path": "/Projects/Spec"
}`);
  });

  test('lists child blocks with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          { id: 'blk-2', content: 'Child one' },
          { id: 'blk-3', content: 'Child two' },
        ],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'children', '--id', 'blk-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/block/getChildBlocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'blk-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith([
      '1. Child one',
      '   id: blk-2',
      '',
      '2. Child two',
      '   id: blk-3',
    ].join('\n'));
  });

  test('lists child blocks with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [{ id: 'blk-2', content: 'Child one' }],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'children', '--id', 'blk-1', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  {
    "id": "blk-2",
    "content": "Child one"
  }
]`);
  });

  test('prints a friendly message for empty child results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'children', '--id', 'blk-1']);

    expect(logSpy).toHaveBeenCalledWith('No results found.');
  });

  test('updates a block with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'update', '--id', 'blk-1', '--content', 'new content']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/block/updateBlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'blk-1', data: 'new content', dataType: 'markdown' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Updated block blk-1');
  });

  test('updates a block with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'update', '--id', 'blk-1', '--content', 'new content', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('inserts a block with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'insert', '--id', 'blk-1', '--content', 'inserted']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/block/insertBlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ previousID: 'blk-1', data: 'inserted', dataType: 'markdown' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Inserted block after blk-1');
  });

  test('moves a block with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'move', '--id', 'blk-1', '--parent', 'blk-2']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/block/moveBlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'blk-1', parentID: 'blk-2' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Moved block blk-1 to parent blk-2');
  });

  test('requires confirmation before removing a block by default', async () => {
    await expect(createCli().parseAsync(['node', 'siyuan', 'block', 'remove', '--id', 'blk-1'])).rejects.toThrow(
      'Command aborted by user'
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('removes a block with --yes and friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'remove', '--id', 'blk-1', '--yes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/block/deleteBlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'blk-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Removed block blk-1');
  });

  test('removes a block with --yes and raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'block', 'remove', '--id', 'blk-1', '--yes', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'block', 'get', '--id', 'blk-1'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows block help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'block', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
