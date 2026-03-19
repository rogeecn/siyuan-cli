import { loadEnvConfig } from '../../src/core/env.js';

describe('loadEnvConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SIYUAN_BASE_URL;
    delete process.env.SIYUAN_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns config from environment variables', () => {
    process.env.SIYUAN_BASE_URL = 'http://127.0.0.1:6806';
    process.env.SIYUAN_TOKEN = 'secret-token';

    expect(loadEnvConfig()).toEqual({
      baseUrl: 'http://127.0.0.1:6806',
      token: 'secret-token',
    });
  });

  test('throws a readable error when base url is missing', () => {
    process.env.SIYUAN_TOKEN = 'secret-token';

    expect(() => loadEnvConfig()).toThrow('SIYUAN_BASE_URL is required');
  });

  test('throws a readable error when token is missing', () => {
    process.env.SIYUAN_BASE_URL = 'http://127.0.0.1:6806';

    expect(() => loadEnvConfig()).toThrow('SIYUAN_TOKEN is required');
  });
});
