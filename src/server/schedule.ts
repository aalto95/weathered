import { DateTime } from 'luxon';
import type { NotificationPreferences } from './types.js';

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
  graceMinutes = 120,
  earlyMinutes = 0
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
    return (
      scheduled.diff(localNow, 'minutes').minutes <= earlyMinutes &&
      preferences.lastSentDate !== localNow.toISODate()
    );
  }

  if (localNow.diff(scheduled, 'minutes').minutes > graceMinutes) {
    return false;
  }

  return preferences.lastSentDate !== localNow.toISODate();
};

/**
 * Next occurrence of the chosen local time, in UTC. When a digest has already
 * been sent today, `skipLocalDate` moves the result to tomorrow.
 */
export const nextDeliveryTime = (
  now: DateTime,
  timezone: string,
  time: string,
  skipLocalDate?: string
): Date | null => {
  if (!isValidTime(time) || !isValidTimezone(timezone)) {
    return null;
  }

  const [hour, minute] = time.split(':').map(Number);
  const localNow = now.setZone(timezone);
  let next = localNow.set({ hour, minute, second: 0, millisecond: 0 });

  if (next.toMillis() <= now.toMillis()) {
    next = next.plus({ days: 1 });
  }

  if (skipLocalDate && next.toISODate() === skipLocalDate) {
    next = next.plus({ days: 1 });
  }

  return next.toUTC().toJSDate();
};
