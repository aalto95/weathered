import { DateTime } from 'luxon';
import { isQstashConfigured, scheduleNotification } from './qstash.js';
import { isDueNow, nextDeliveryTime } from './schedule.js';
import type { NotificationPreferences } from './types.js';

let warnedMissingConfig = false;

export const scheduleNextDelivery = async (
  preferences: NotificationPreferences,
  appUrl: string,
  catchUp = false
): Promise<string | undefined> => {
  if (!isQstashConfigured()) {
    if (!warnedMissingConfig) {
      console.warn(
        'QSTASH_TOKEN is not configured; only the cron fallback is active'
      );
      warnedMissingConfig = true;
    }
    return undefined;
  }

  const now = DateTime.utc();
  const when =
    catchUp && isDueNow(now, preferences)
      ? now.plus({ seconds: 5 }).toJSDate()
      : nextDeliveryTime(
          now,
          preferences.timezone,
          preferences.time,
          preferences.lastSentDate
        );

  if (!when) {
    return undefined;
  }

  const messageId = await scheduleNotification(
    `${appUrl}/api/send`,
    preferences.id,
    when
  );

  console.info(
    `Scheduled QStash delivery ${messageId} for ${preferences.id} at ${when.toISOString()} (${preferences.time} ${preferences.timezone})`
  );

  return messageId;
};
