import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('snapshot command', () => {
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

  test('lists snapshots with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          { id: 'snap-1', time: '2026-03-16 10:00' },
          { id: 'snap-2', time: '2026-03-16 11:00' },
        ],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'list']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/snapshot/getSnapshotList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith(['1. snap-1 - 2026-03-16 10:00', '2. snap-2 - 2026-03-16 11:00'].join('\n'));
  });

  test('lists snapshots with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [{ id: 'snap-1', time: '2026-03-16 10:00' }] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'list', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  {
    "id": "snap-1",
    "time": "2026-03-16 10:00"
  }
]`);
  });

  test('shows current snapshot with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { id: 'snap-2', time: '2026-03-16 11:00', memo: 'latest' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'current']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/snapshot/getRepoSnapshots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: undefined,
    });
    expect(logSpy).toHaveBeenCalledWith(['id: snap-2', 'time: 2026-03-16 11:00', 'memo: latest'].join('\n'));
  });

  test('shows current snapshot with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { id: 'snap-2', time: '2026-03-16 11:00', memo: 'latest' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'current', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "id": "snap-2",
  "time": "2026-03-16 11:00",
  "memo": "latest"
}`);
  });

  test('prints a normalized JSON object when snapshot current returns an empty response body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => '',
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'current', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "id": "(unknown id)",
  "time": "(unknown time)",
  "memo": ""
}`);
  });

  test('prints a friendly message for empty snapshot results', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'list']);

    expect(logSpy).toHaveBeenCalledWith('No results found.');
  });

  test('creates a snapshot with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'create', '--memo', 'before refactor']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/snapshot/createSnapshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ memo: 'before refactor' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Created snapshot: before refactor');
  });

  test('creates a snapshot with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'create', '--memo', 'before refactor', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('restores a snapshot with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'restore', '--id', 'snap-1', '--yes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/snapshot/rollbackSnapshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'snap-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Restored snapshot snap-1');
  });

  test('requires confirmation before restoring a snapshot by default', async () => {
    await expect(
      createCli().parseAsync(['node', 'siyuan', 'snapshot', 'restore', '--id', 'snap-1'])
    ).rejects.toThrow('Command aborted by user');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('requires confirmation before removing a snapshot by default', async () => {
    await expect(
      createCli().parseAsync(['node', 'siyuan', 'snapshot', 'remove', '--id', 'snap-1'])
    ).rejects.toThrow('Command aborted by user');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('removes a snapshot with --yes and friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'remove', '--id', 'snap-1', '--yes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/snapshot/removeSnapshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'snap-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Removed snapshot snap-1');
  });

  test('removes a snapshot with --yes and raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'remove', '--id', 'snap-1', '--yes', '--json']);

    expect(logSpy).toHaveBeenCalledWith('null');
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'snapshot', 'list'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows snapshot help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'snapshot', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
