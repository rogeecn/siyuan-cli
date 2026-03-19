import { SiyuanClient } from '../core/http.js';

export type SqlRow = Record<string, unknown>;

export interface SqlService {
  query(statement: string): Promise<SqlRow[]>;
}

export function createSqlService(client: SiyuanClient): SqlService {
  return {
    async query(statement) {
      return client.request<SqlRow[]>('/api/query/sql', { stmt: statement });
    },
  };
}
