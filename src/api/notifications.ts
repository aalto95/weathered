import { FavoriteLocation } from '../models/weather.model';

export type NotificationLang = 'en' | 'ru';

export interface NotificationSubscriptionPayload {
  id?: string;
  subscription: PushSubscriptionJSON;
  time: string;
  timezone: string;
  favorites: FavoriteLocation[];
  lang: NotificationLang;
}

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
};

export const saveNotificationSubscription = (
  payload: NotificationSubscriptionPayload
) => post<{ id: string }>('/api/subscribe', payload);

export const removeNotificationSubscription = (id: string) =>
  post<{ ok: boolean }>('/api/unsubscribe', { id });

export const sendTestNotification = (id: string) =>
  post<{ ok: boolean }>('/api/test', { id });
