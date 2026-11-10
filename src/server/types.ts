export type NotificationLang = 'en' | 'ru';

export interface NotificationCity {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

export interface NotificationPreferences {
  id: string;
  subscription: PushSubscriptionRecord;
  /** Local delivery time, e.g. "08:30". */
  time: string;
  /** IANA timezone, e.g. "Europe/Berlin". */
  timezone: string;
  favorites: NotificationCity[];
  lang: NotificationLang;
  createdAt: string;
  updatedAt: string;
  /** Local date (YYYY-MM-DD) of the last successful send, for deduplication. */
  lastSentDate?: string;
  lastSentAt?: string;
}

export interface SubscribePayload {
  id?: string;
  subscription: PushSubscriptionRecord;
  time: string;
  timezone: string;
  favorites: NotificationCity[];
  lang: NotificationLang;
}

export interface NotificationMessage {
  title: string;
  body: string;
  tag: string;
  url: string;
}
