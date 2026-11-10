import { isValidTime, isValidTimezone } from './schedule.js';
import type {
  NotificationCity,
  NotificationLang,
  PushSubscriptionRecord,
  SubscribePayload
} from './types.js';

export class ValidationError extends Error {}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseId = (value: unknown) => {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new ValidationError('Invalid subscription id');
  }
  return value;
};

const parseSubscription = (value: unknown): PushSubscriptionRecord => {
  if (!isRecord(value)) {
    throw new ValidationError('Invalid push subscription');
  }

  const { endpoint, keys, expirationTime } = value;

  if (
    typeof endpoint !== 'string' ||
    !endpoint.startsWith('https://') ||
    endpoint.length > 2000
  ) {
    throw new ValidationError('Invalid push endpoint');
  }

  if (!isRecord(keys)) {
    throw new ValidationError('Invalid push subscription keys');
  }

  const { p256dh, auth } = keys;
  if (
    typeof p256dh !== 'string' ||
    p256dh.length === 0 ||
    p256dh.length > 500 ||
    typeof auth !== 'string' ||
    auth.length === 0 ||
    auth.length > 500
  ) {
    throw new ValidationError('Invalid push subscription keys');
  }

  return {
    endpoint,
    keys: { p256dh, auth },
    expirationTime: typeof expirationTime === 'number' ? expirationTime : null
  };
};

const parseFavorites = (value: unknown): NotificationCity[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError('At least one favorite city is required');
  }

  if (value.length > 20) {
    throw new ValidationError('A maximum of 20 favorite cities is supported');
  }

  return value.map((item) => {
    if (!isRecord(item)) {
      throw new ValidationError('Invalid favorite city');
    }

    const { id, name, country, latitude, longitude } = item;

    if (typeof id !== 'number' || !Number.isFinite(id)) {
      throw new ValidationError('Invalid favorite city id');
    }

    if (
      typeof name !== 'string' ||
      name.trim().length === 0 ||
      name.length > 120
    ) {
      throw new ValidationError('Invalid favorite city name');
    }

    if (typeof country !== 'string' || country.length > 8) {
      throw new ValidationError('Invalid favorite city country');
    }

    if (
      typeof latitude !== 'number' ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      typeof longitude !== 'number' ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new ValidationError('Invalid favorite city coordinates');
    }

    return {
      id,
      name: name.trim(),
      country,
      latitude,
      longitude
    };
  });
};

const parseLang = (value: unknown): NotificationLang =>
  value === 'ru' ? 'ru' : 'en';

export const parseSubscribePayload = (input: unknown): SubscribePayload => {
  if (!isRecord(input)) {
    throw new ValidationError('Invalid request body');
  }

  const { id, subscription, time, timezone, favorites, lang } = input;

  if (!isValidTime(time)) {
    throw new ValidationError('Invalid notification time');
  }

  if (!isValidTimezone(timezone)) {
    throw new ValidationError('Invalid timezone');
  }

  return {
    id: id === undefined ? undefined : parseId(id),
    subscription: parseSubscription(subscription),
    time,
    timezone,
    favorites: parseFavorites(favorites),
    lang: parseLang(lang)
  };
};
