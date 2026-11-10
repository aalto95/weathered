import { DateTime } from 'luxon';
import { isQstashConfigured, scheduleNotification } from './qstash.js';
import { nextDeliveryTime } from './schedule.js';
import type { NotificationPreferences } from './types.js';

export const scheduleNextDelivery = async (
  preferences: NotificationPreferences,
  appUrl: string
): Promise<string | undefined> => {
  if (!isQstashConfigured()) {
    return undefined;
  }

  const when = nextDeliveryTime(
    DateTime.utc(),
    preferences.timezone,
    preferences.time,
    preferences.lastSentDate
  );

  if (!when) {
    return undefined;
  }

  return scheduleNotification(`${appUrl}/api/send`, preferences.id, when);
};
