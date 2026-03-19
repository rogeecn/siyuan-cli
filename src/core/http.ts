import type { EnvConfig } from './env.js';

export interface SiyuanApiEnvelope<T> {
  code: number;
  msg: string;
  data: T;
}

export class SiyuanApiError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly status?: number,
    public readonly code?: number,
  ) {
    super(message);
    this.name = 'SiyuanApiError';
  }
}

async function readResponseBody(response: Response): Promise<string> {
  if (typeof response.text === 'function') {
    return response.text();
  }

  if (typeof response.json === 'function') {
    const json = await response.json();
    return JSON.stringify(json);
  }

  return '';
}

export class SiyuanClient {
  constructor(private readonly config: EnvConfig) {}

  async request<T>(endpoint: string, body?: unknown): Promise<T | null> {
    let response: Response;

    try {
      response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.config.token}`,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new SiyuanApiError('Network request failed', endpoint);
    }

    const rawBody = await readResponseBody(response);

    if (!response.ok) {
      throw new SiyuanApiError(
        `HTTP ${response.status} ${response.statusText}`,
        endpoint,
        response.status,
      );
    }

    if (rawBody.trim() === '') {
      return null;
    }

    let payload: SiyuanApiEnvelope<T>;

    try {
      payload = JSON.parse(rawBody) as SiyuanApiEnvelope<T>;
    } catch {
      throw new SiyuanApiError('Invalid JSON response', endpoint, response.status);
    }

    if (typeof payload !== 'object' || payload === null || typeof payload.code !== 'number') {
      throw new SiyuanApiError('Malformed API response', endpoint, response.status);
    }

    if (payload.code !== 0) {
      throw new SiyuanApiError(
        payload.msg || `API error (${payload.code})`,
        endpoint,
        response.status,
        payload.code,
      );
    }

    return payload.data;
  }
}
