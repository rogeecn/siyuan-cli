import { jest } from '@jest/globals';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCli } from '../../src/cli/index.js';

describe('doc command', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;
  let logSpy: jest.SpiedFunction<typeof console.log>;
  let fetchMock: jest.MockedFunction<typeof fetch>;
  let tempDir: string;
  let contentFile: string;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SIYUAN_BASE_URL: 'http://127.0.0.1:6806',
      SIYUAN_TOKEN: 'secret-token',
    };

    fetchMock = jest.fn<typeof fetch>() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    tempDir = mkdtempSync(join(tmpdir(), 'siyuan-cli-doc-'));
    contentFile = join(tempDir, 'content.md');
    writeFileSync(contentFile, '# From File\n\nBody content');
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    logSpy.mockRestore();
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('gets a document with markdown-only human output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { id: 'doc-123', markdown: '# Hello\n\nWorld' } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'doc', 'get', '--id', 'doc-123']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/filetree/getDoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-123' }),
    });
    expect(logSpy).toHaveBeenCalledWith('# Hello\n\nWorld');
  });

  test('gets a document with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { id: 'doc-123', markdown: '# Hello' } }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'doc', 'get', '--id', 'doc-123', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "id": "doc-123",
  "markdown": "# Hello"
}`);
  });

  test('creates a document from inline content with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { id: 'doc-123', path: '/Projects/Spec', notebook: 'nb-1' },
      }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'doc',
      'create',
      '--notebook',
      'nb-1',
      '--path',
      '/Projects/Spec',
      '--content',
      '# Draft',
    ]);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/filetree/createDocWithMd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ notebook: 'nb-1', path: '/Projects/Spec', markdown: '# Draft' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Created document doc-123 at /Projects/Spec');
  });

  test('creates a document when the server returns a string id', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ code: 0, msg: '', data: 'doc-123' }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'doc',
      'create',
      '--notebook',
      'nb-1',
      '--path',
      '/Projects/Spec',
      '--content',
      '# Draft',
    ]);

    expect(logSpy).toHaveBeenCalledWith('Created document doc-123 at (unknown path)');
  });

  test('prints normalized json when create returns a string id', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ code: 0, msg: '', data: 'doc-123' }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'doc',
      'create',
      '--notebook',
      'nb-1',
      '--path',
      '/Projects/Spec',
      '--content',
      '# Draft',
      '--json',
    ]);

    expect(logSpy).toHaveBeenCalledWith(`{
  "id": "doc-123"
}`);
  });

  test('creates a document from content file', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { id: 'doc-123', path: '/Projects/Spec' } }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'doc',
      'create',
      '--notebook',
      'nb-1',
      '--path',
      '/Projects/Spec',
      '--content-file',
      contentFile,
      '--json',
    ]);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:6806/api/filetree/createDocWithMd',
      expect.objectContaining({
        body: JSON.stringify({
          notebook: 'nb-1',
          path: '/Projects/Spec',
          markdown: '# From File\n\nBody content',
        }),
      })
    );
    expect(logSpy).toHaveBeenCalledWith(`{
  "id": "doc-123",
  "path": "/Projects/Spec"
}`);
  });

  test('updates a document from inline content', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'doc',
      'update',
      '--id',
      'doc-123',
      '--content',
      'Updated body',
    ]);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/block/updateBlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-123', data: 'Updated body', dataType: 'markdown' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Updated document doc-123');
  });

  test('appends to a document from content file', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'doc',
      'append',
      '--id',
      'doc-123',
      '--content-file',
      contentFile,
    ]);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/filetree/appendBlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-123', data: '# From File\n\nBody content', dataType: 'markdown' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Appended to document doc-123');
  });

  test('requires exactly one content source for create', async () => {
    await expect(
      createCli().parseAsync([
        'node',
        'siyuan',
        'doc',
        'create',
        '--notebook',
        'nb-1',
        '--path',
        '/Projects/Spec',
      ])
    ).rejects.toThrow('Exactly one of --content or --content-file is required');

    await expect(
      createCli().parseAsync([
        'node',
        'siyuan',
        'doc',
        'create',
        '--notebook',
        'nb-1',
        '--path',
        '/Projects/Spec',
        '--content',
        'inline',
        '--content-file',
        contentFile,
      ])
    ).rejects.toThrow('Exactly one of --content or --content-file is required');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('requires exactly one content source for update and append', async () => {
    await expect(
      createCli().parseAsync(['node', 'siyuan', 'doc', 'update', '--id', 'doc-123'])
    ).rejects.toThrow('Exactly one of --content or --content-file is required');

    await expect(
      createCli().parseAsync([
        'node',
        'siyuan',
        'doc',
        'append',
        '--id',
        'doc-123',
        '--content',
        'inline',
        '--content-file',
        contentFile,
      ])
    ).rejects.toThrow('Exactly one of --content or --content-file is required');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('rejects empty inline content and empty file path', async () => {
    await expect(
      createCli().parseAsync([
        'node',
        'siyuan',
        'doc',
        'create',
        '--notebook',
        'nb-1',
        '--path',
        '/Projects/Spec',
        '--content',
        '',
      ])
    ).rejects.toThrow('--content must not be empty');

    await expect(
      createCli().parseAsync([
        'node',
        'siyuan',
        'doc',
        'append',
        '--id',
        'doc-123',
        '--content-file',
        '',
      ])
    ).rejects.toThrow('--content-file must not be empty');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fails with a readable error when content file cannot be read', async () => {
    await expect(
      createCli().parseAsync([
        'node',
        'siyuan',
        'doc',
        'update',
        '--id',
        'doc-123',
        '--content-file',
        join(tempDir, 'missing.md'),
      ])
    ).rejects.toThrow('Failed to read --content-file');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fails when doc get response does not contain markdown content', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { id: 'doc-123' } }),
    } as Response);

    await expect(createCli().parseAsync(['node', 'siyuan', 'doc', 'get', '--id', 'doc-123'])).rejects.toThrow(
      'Document response does not contain markdown content'
    );
  });

  test('renames a document with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'doc', 'rename', '--id', 'doc-123', '--path', '/Projects/NewName']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/filetree/renameDocByID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-123', title: '/Projects/NewName' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Renamed document doc-123 to /Projects/NewName');
  });

  test('moves a document with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'doc', 'move', '--id', 'doc-123', '--path', '/Archive/Old']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/filetree/moveDocs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ fromPaths: ['doc-123'], toNotebook: '', toPath: '/Archive/Old' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Moved document doc-123 to /Archive/Old');
  });

  test('requires confirmation before removing a document by default', async () => {
    await expect(createCli().parseAsync(['node', 'siyuan', 'doc', 'remove', '--id', 'doc-123'])).rejects.toThrow(
      'Command aborted by user'
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('removes a document with --yes and friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'doc', 'remove', '--id', 'doc-123', '--yes']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/filetree/removeDocByID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-123' }),
    });
    expect(logSpy).toHaveBeenCalledWith('Removed document doc-123');
  });

  test('supports raw json output for rename move and remove', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: null }),
    } as Response);

    await createCli().parseAsync([
      'node',
      'siyuan',
      'doc',
      'rename',
      '--id',
      'doc-123',
      '--path',
      '/Projects/NewName',
      '--json',
    ]);
    await createCli().parseAsync([
      'node',
      'siyuan',
      'doc',
      'move',
      '--id',
      'doc-123',
      '--path',
      '/Archive/Old',
      '--json',
    ]);
    await createCli().parseAsync(['node', 'siyuan', 'doc', 'remove', '--id', 'doc-123', '--yes', '--json']);

    expect(logSpy).toHaveBeenNthCalledWith(1, 'null');
    expect(logSpy).toHaveBeenNthCalledWith(2, 'null');
    expect(logSpy).toHaveBeenNthCalledWith(3, 'null');
  });

  test('rejects blank ids and paths for destructive doc commands', async () => {
    await expect(
      createCli().parseAsync(['node', 'siyuan', 'doc', 'rename', '--id', '   ', '--path', '/Projects/NewName'])
    ).rejects.toThrow('--id must not be empty');

    await expect(
      createCli().parseAsync(['node', 'siyuan', 'doc', 'move', '--id', 'doc-123', '--path', '   '])
    ).rejects.toThrow('--path must not be empty');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'doc', 'get', '--id', 'doc-123'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
