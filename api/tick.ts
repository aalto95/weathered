import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DateTime } from 'luxon';
import {
  deletePreferences,
  isStorageConfigured,
  listPreferences,
  savePreferences
} from '../src/server/blob.js';
import {
  buildDailyNotification,
  fetchWeatherSummaries
} from '../src/server/digest.js';
import { getAppUrl } from '../src/server/http.js';
import { isPushConfigured, sendPush } from '../src/server/push.js';
import { cancelNotification } from '../src/server/qstash.js';
import { isDueNow, localDateKey } from '../src/server/schedule.js';
import { scheduleNextDelivery } from '../src/server/scheduler.js';
import type { NotificationPreferences } from '../src/server/types.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET' && request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return response
      .status(503)
      .json({ error: 'CRON_SECRET is not configured' });
  }

  if (request.headers.authorization !== `Bearer ${secret}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  if (!isStorageConfigured() || !isPushConfigured()) {
    return response
      .status(503)
      .json({ error: 'Notifications are not configured' });
  }

  let appUrl: string | undefined;
  try {
    appUrl = getAppUrl(request);
  } catch {
    // Fall back to the hourly crons; QStash rescheduling is skipped.
  }

  try {
    const now = DateTime.utc();
    const preferences = await listPreferences();
    const result = {
      checked: preferences.length,
      sent: 0,
      skipped: 0,
      expired: 0,
      failed: 0
    };

    for (const subscriber of preferences) {
      if (!isDueNow(now, subscriber)) {
        result.skipped += 1;
        continue;
      }

      try {
        const summaries = await fetchWeatherSummaries(subscriber.favorites);
        const message = buildDailyNotification(summaries, subscriber.lang);
        const outcome = await sendPush(subscriber, message);

        if (outcome === 'sent') {
          const next: NotificationPreferences = {
            ...subscriber,
            lastSentDate: localDateKey(now, subscriber.timezone),
            lastSentAt: now.toISO() ?? undefined,
            qstashMessageId: undefined
          };

          await cancelNotification(subscriber.qstashMessageId);

          try {
            if (appUrl) {
              const messageId = await scheduleNextDelivery(next, appUrl);
              if (messageId) {
                next.qstashMessageId = messageId;
              }
            }
          } catch (error) {
            console.error('Failed to schedule the next QStash delivery', error);
          }

          await savePreferences(next);
          result.sent += 1;
        } else if (outcome === 'expired') {
          await deletePreferences(subscriber.id);
          result.expired += 1;
        } else {
          result.failed += 1;
        }
      } catch (error) {
        console.error(
          `Failed to process notification for ${subscriber.id}`,
          error
        );
        result.failed += 1;
      }
    }

    return response.status(200).json(result);
  } catch (error) {
    console.error('Failed to process notification tick', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
