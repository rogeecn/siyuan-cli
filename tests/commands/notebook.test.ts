import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('notebook command', () => {
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

  test('lists notebooks with human-friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: {
          notebooks: [
            { id: 'nb-1', name: 'Projects', closed: false },
            { id: 'nb-2', name: 'Archive', closed: true },
          ],
        },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notebook', 'list']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notebook/lsNotebooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith([
      '1. Projects',
      '   id: nb-1',
      '   status: open',
      '',
      '2. Archive',
      '   id: nb-2',
      '   status: closed',
    ].join('\n'));
  });

  test('gets one notebook with json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { notebook: { id: 'nb-1', name: 'Projects', closed: false } },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notebook', 'get', '--id', 'nb-1', '--json']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notebook/getNotebookByID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ notebook: 'nb-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith(`{
  "id": "nb-1",
  "name": "Projects",
  "closed": false
}`);
  });

  test('creates a notebook with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { notebook: { id: 'nb-3' } },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notebook', 'create', '--name', 'Work Notes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notebook/createNotebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ name: 'Work Notes' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Created notebook Work Notes (nb-3)');
  });

  test('opens a notebook with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notebook', 'open', '--id', 'nb-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notebook/openNotebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ notebook: 'nb-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Opened notebook nb-1');
  });

  test('closes a notebook with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notebook', 'close', '--id', 'nb-1', '--json']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notebook/closeNotebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ notebook: 'nb-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('renames a notebook with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notebook', 'rename', '--id', 'nb-1', '--name', 'Projects 2']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notebook/renameNotebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ notebook: 'nb-1', name: 'Projects 2' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Renamed notebook nb-1 to Projects 2');
  });

  test('renames a notebook with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'notebook',
      'rename',
      '--id',
      'nb-1',
      '--name',
      'Projects 2',
      '--json',
    ]);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('requires confirmation before removing a notebook by default', async () => {
    await expect(createCli().parseAsync(['node', 'siyuan', 'notebook', 'remove', '--id', 'nb-1'])).rejects.toThrow(
      'Command aborted by user'
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('removes a notebook with --yes and friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notebook', 'remove', '--id', 'nb-1', '--yes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/notebook/removeNotebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ notebook: 'nb-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Removed notebook nb-1');
  });

  test('removes a notebook with --yes and raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'notebook', 'remove', '--id', 'nb-1', '--yes', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('rejects blank notebook ids and names', async () => {
    await expect(
      createCli().parseAsync(['node', 'siyuan', 'notebook', 'get', '--id', '   '])
    ).rejects.toThrow('--id must not be empty');

    await expect(
      createCli().parseAsync(['node', 'siyuan', 'notebook', 'create', '--name', '   '])
    ).rejects.toThrow('--name must not be empty');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fails when notebook payload is malformed', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { notebook: {} } }),
    } as Response);

    await expect(createCli().parseAsync(['node', 'siyuan', 'notebook', 'get', '--id', 'nb-1'])).rejects.toThrow(
      'Notebook response is missing required fields'
    );
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'notebook', 'list'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
