import { jest } from '@jest/globals';
import { SiyuanApiError, SiyuanClient } from '../../src/core/http.js';

describe('SiyuanClient', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.fn<typeof fetch>() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('sends POST requests with token header and serialized body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: 0, msg: '', data: { id: 'doc-1' } }),
    } as Response);

    const client = new SiyuanClient({
      baseUrl: 'http://127.0.0.1:6806',
      token: 'secret-token',
    });

    await expect(client.request('/api/doc/getDoc', { id: 'doc-1' })).resolves.toEqual({ id: 'doc-1' });

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/doc/getDoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token secret-token',
      },
      body: '{"id":"doc-1"}',
    });
  });

  test('throws normalized errors for non-ok responses', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ code: -1, msg: 'forbidden', data: null }),
    } as Response);

    const client = new SiyuanClient({
      baseUrl: 'http://127.0.0.1:6806',
      token: 'secret-token',
    });

    await expect(client.request('/api/system/version')).rejects.toEqual(
      expect.objectContaining({
        name: 'SiyuanApiError',
        message: 'HTTP 403 Forbidden',
        endpoint: '/api/system/version',
        status: 403,
      })
    );
  });

  test('throws normalized errors for non-zero API codes', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ code: -1, msg: 'token invalid', data: null }),
    } as Response);

    const client = new SiyuanClient({
      baseUrl: 'http://127.0.0.1:6806',
      token: 'secret-token',
    });

    await expect(client.request('/api/system/version')).rejects.toEqual(
      expect.objectContaining({
        name: 'SiyuanApiError',
        message: 'token invalid',
        endpoint: '/api/system/version',
        status: 200,
        code: -1,
      })
    );
  });

  test('exports a reusable API error type', () => {
    const error = new SiyuanApiError('boom', '/api/test', 500, -1);

    expect(error).toBeInstanceOf(Error);
    expect(error.endpoint).toBe('/api/test');
    expect(error.status).toBe(500);
    expect(error.code).toBe(-1);
  });
});
