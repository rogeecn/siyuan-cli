import { jest } from '@jest/globals';
import { createCli } from '../../src/cli/index.js';

describe('search command', () => {
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

  test('runs search with human-friendly output', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          {
            id: '20260316120000-abc123',
            content: 'Project Notes',
            path: '/Projects/project-notes.sy',
            hpath: '/Projects/Project Notes',
            type: 'd',
            tag: '#alpha# #project#',
          },
          {
            id: '20260316120100-def456',
            content: 'Alpha Draft',
            path: '/Drafts/alpha-draft.sy',
            hpath: '/Drafts/Alpha Draft',
            type: 'd',
            tag: '',
          },
        ],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'search', '--content', 'alpha']);

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/query/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: JSON.stringify({
        stmt: "SELECT * FROM blocks WHERE content LIKE '%alpha%' LIMIT 10",
      }),
    });
    expect(logSpy).toHaveBeenCalledWith(
      [
        '1. Project Notes',
        '   /Projects/Project Notes',
        '   Project Notes',
        '   tags: alpha, project',
        '',
        '2. Alpha Draft',
        '   /Drafts/Alpha Draft',
        '   Alpha Draft',
      ].join('\n')
    );
  });

  test('prints raw json when requested', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        code: 0,
        msg: '',
        data: [
          {
            id: '20260316120000-abc123',
            content: 'Tagged Doc',
            path: '/Inbox/tagged-doc.sy',
            hpath: '/Inbox/Tagged Doc',
            type: 'd',
            tag: '#work#',
          },
        ],
      }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'search', '--tag', 'work', '--json']);

    expect(logSpy).toHaveBeenCalledWith(`[
  {
    "id": "20260316120000-abc123",
    "title": "Tagged Doc",
    "path": "/Inbox/Tagged Doc",
    "snippet": "Tagged Doc",
    "tags": [
      "work"
    ]
  }
]`);
  });

  test('searches filename against document path criteria', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: [] }),
    } as Response);

    await createCli().parseAsync(['node', 'siyuan', 'search', '--filename', 'draft']);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:6806/api/query/sql',
      expect.objectContaining({
        body: JSON.stringify({
          stmt: "SELECT * FROM blocks WHERE type='d' AND (content LIKE '%draft%' OR path LIKE '%draft%' OR hpath LIKE '%draft%') LIMIT 10",
        }),
      })
    );
  });

  test('requires at least one search criterion', async () => {
    await expect(createCli().parseAsync(['node', 'siyuan', 'search'])).rejects.toThrow(
      'At least one of --content, --filename, or --tag is required'
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fails lazily when environment variables are missing', async () => {
    delete process.env.SIYUAN_BASE_URL;

    await expect(
      createCli().parseAsync(['node', 'siyuan', 'search', '--filename', 'notes'])
    ).rejects.toThrow('SIYUAN_BASE_URL is required');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
