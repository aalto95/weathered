import { DateTime } from 'luxon';
import { NotificationPreferences } from './types';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const isValidTime = (value: unknown): value is string =>
  typeof value === 'string' && TIME_PATTERN.test(value);

export const isValidTimezone = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }
  return DateTime.local().setZone(value).isValid;
};

export const localDateKey = (now: DateTime, timezone: string) =>
  now.setZone(timezone).toISODate() ?? '';

type DuePreferences = Pick<
  NotificationPreferences,
  'time' | 'timezone' | 'lastSentDate'
>;

/**
 * A subscription is due when its local time has passed today, it hasn't been
 * sent today yet, and we are still inside the grace window. The grace window
 * keeps a delayed scheduler run from sending yesterday's digest at midnight.
 */
export const isDueNow = (
  now: DateTime,
  preferences: DuePreferences,
  graceMinutes = 60
) => {
  if (
    !isValidTime(preferences.time) ||
    !isValidTimezone(preferences.timezone)
  ) {
    return false;
  }

  const localNow = now.setZone(preferences.timezone);
  if (!localNow.isValid) {
    return false;
  }

  const [hour, minute] = preferences.time.split(':').map(Number);
  const scheduled = localNow.set({ hour, minute, second: 0, millisecond: 0 });

  if (localNow.toMillis() < scheduled.toMillis()) {
    return false;
  }

  if (localNow.diff(scheduled, 'minutes').minutes > graceMinutes) {
    return false;
  }

  return preferences.lastSentDate !== localNow.toISODate();
};
