import { SiyuanClient } from '../core/http.js';

export interface NotifyResult {
  msg: string;
}

export interface NotifyItem {
  id: string;
  msg: string;
}

interface RawNotifyResult {
  msg?: string;
}

interface RawNotifyItem {
  id?: string;
  msg?: string;
}

export interface NotifyService {
  push(msg: string): Promise<NotifyResult>;
  list(): Promise<NotifyItem[]>;
  clear(): Promise<unknown>;
}

function normalizeNotifyResult(result: RawNotifyResult): NotifyResult {
  return {
    msg: result.msg?.trim() || '',
  };
}

function normalizeNotifyItem(item: RawNotifyItem, index: number): NotifyItem {
  return {
    id: item.id?.trim() || `notify-${index + 1}`,
    msg: item.msg?.trim() || '',
  };
}

export function createNotifyService(client: SiyuanClient): NotifyService {
  return {
    async push(msg) {
      const result = await client.request<RawNotifyResult>('/api/notification/pushMsg', { msg });
      return normalizeNotifyResult(result || {});
    },
    async list() {
      const items = await client.request<RawNotifyItem[]>('/api/notification/getNotification');
      return (items || []).map((item, index) => normalizeNotifyItem(item, index));
    },
    async clear() {
      return client.request('/api/notification/clearAll');
    },
  };
}
