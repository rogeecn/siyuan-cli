import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('export command', () => {
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

  test('shows export preview with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { name: 'Spec', path: '/Projects/Spec', exportPath: '/tmp/spec' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'preview', '--id', 'doc-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/export/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith([
      'name: Spec',
      'path: /Projects/Spec',
      'exportPath: /tmp/spec',
    ].join('\n'));
  });

  test('shows export preview with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { name: 'Spec', path: '/Projects/Spec', exportPath: '/tmp/spec' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'preview', '--id', 'doc-1', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "name": "Spec",
  "path": "/Projects/Spec",
  "exportPath": "/tmp/spec"
}`);
  });

  test('exports markdown with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { document: 'Spec', markdownPath: '/tmp/spec.md' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'markdown', '--id', 'doc-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/export/exportMd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith(['document: Spec', 'markdownPath: /tmp/spec.md'].join('\n'));
  });

  test('exports markdown with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { document: 'Spec', markdownPath: '/tmp/spec.md' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'markdown', '--id', 'doc-1', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "document": "Spec",
  "markdownPath": "/tmp/spec.md"
}`);
  });

  test('exports html with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { document: 'Spec', htmlPath: '/tmp/spec.html' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'html', '--id', 'doc-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/export/exportHTML', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith(['document: Spec', 'htmlPath: /tmp/spec.html'].join('\n'));
  });

  test('exports html with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { document: 'Spec', htmlPath: '/tmp/spec.html' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'html', '--id', 'doc-1', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "document": "Spec",
  "htmlPath": "/tmp/spec.html"
}`);
  });

  test('exports pdf with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { document: 'Spec', pdfPath: '/tmp/spec.pdf' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'pdf', '--id', 'doc-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/export/exportPDF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith(['document: Spec', 'pdfPath: /tmp/spec.pdf'].join('\n'));
  });

  test('exports pdf with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { document: 'Spec', pdfPath: '/tmp/spec.pdf' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'pdf', '--id', 'doc-1', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "document": "Spec",
  "pdfPath": "/tmp/spec.pdf"
}`);
  });

  test('exports docx with friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { document: 'Spec', docxPath: '/tmp/spec.docx' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'docx', '--id', 'doc-1']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/export/exportDocx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({ id: 'doc-1' }),
    });
    expect(logSpy).toHaveBeenCalledWith(['document: Spec', 'docxPath: /tmp/spec.docx'].join('\n'));
  });

  test('exports docx with raw json output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: { document: 'Spec', docxPath: '/tmp/spec.docx' },
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'export', 'docx', '--id', 'doc-1', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`{
  "document": "Spec",
  "docxPath": "/tmp/spec.docx"
}`);
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(createCli().parseAsync(['node', 'siyuan', 'export', 'preview', '--id', 'doc-1'])).rejects.toThrow(
      'SIYUAN_BASE_URL is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('allows export help output without required environment variables', async () => {
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;

    const originalExit = process.exit;
    process.exit = jest.fn((() => undefined) as never) as unknown as typeof process.exit;

    await createCli().parseAsync(['node', 'siyuan', 'export', '--help']);

    expect(process.exit).toHaveBeenCalledWith(0);
    expect(global.fetch).not.toHaveBeenCalled();
    process.exit = originalExit;
  });
});
