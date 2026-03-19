export interface EnvConfig {
  baseUrl: string;
  token: string;
}

export function loadEnvConfig(env: NodeJS.ProcessEnv = process.env): EnvConfig {
  const baseUrl = env.SIYUAN_BASE_URL?.trim();
  const token = env.SIYUAN_TOKEN?.trim();

  if (!baseUrl) {
    throw new Error('SIYUAN_BASE_URL is required');
  }

  if (!token) {
    throw new Error('SIYUAN_TOKEN is required');
  }

  return {
    baseUrl,
    token,
  };
}
