import { SiyuanClient } from '../core/http.js';

export interface SystemService {
  getVersion(): Promise<unknown>;
  getTime(): Promise<unknown>;
  getBootProgress(): Promise<unknown>;
}

export function createSystemService(client: SiyuanClient): SystemService {
  return {
    getVersion() {
      return client.request('/api/system/version');
    },
    getTime() {
      return client.request('/api/system/time');
    },
    getBootProgress() {
      return client.request('/api/system/bootProgress');
    },
  };
}
