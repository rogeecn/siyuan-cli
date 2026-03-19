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

export class SiyuanClient {
  constructor(private readonly config: EnvConfig) {}

  async request<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${this.config.token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new SiyuanApiError(
        `HTTP ${response.status} ${response.statusText}`,
        endpoint,
        response.status,
      );
    }

    const payload = (await response.json()) as SiyuanApiEnvelope<T>;

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
