import { Hono, type Context } from 'hono';
import { DateTime } from 'luxon';
import {
  deletePreferences,
  isStorageConfigured,
  listPreferences,
  savePreferences
} from '../blob.js';
import { buildDailyNotification, fetchWeatherSummaries } from '../digest.js';
import { getAppUrl } from '../http.js';
import { isPushConfigured, sendPush } from '../push.js';
import { cancelNotification } from '../qstash.js';
import { isDueNow, localDateKey } from '../schedule.js';
import { scheduleNextDelivery } from '../scheduler.js';
import type { NotificationPreferences } from '../types.js';
import { methodNotAllowed } from './shared.js';

const tick = new Hono();
const TICK_BUDGET_MS = 50_000;

const runTick = async (c: Context) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return c.json({ error: 'CRON_SECRET is not configured' }, 503);
  }

  if (c.req.header('authorization') !== `Bearer ${secret}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!isStorageConfigured() || !isPushConfigured()) {
    return c.json({ error: 'Notifications are not configured' }, 503);
  }

  let appUrl: string | undefined;
  try {
    appUrl = getAppUrl(c);
  } catch {
    // Fall back to the hourly crons; QStash rescheduling is skipped.
  }

  try {
    const now = DateTime.utc();
    const preferences = await listPreferences();
    const deadline = Date.now() + TICK_BUDGET_MS;
    const result = {
      checked: preferences.length,
      sent: 0,
      skipped: 0,
      expired: 0,
      failed: 0
    };

    for (const subscriber of preferences) {
      if (Date.now() >= deadline) {
        console.warn(
          'Tick deadline reached; remaining subscribers will be handled later'
        );
        break;
      }

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

    return c.json(result);
  } catch (error) {
    console.error('Failed to process notification tick', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

tick.get('/', runTick);
tick.post('/', runTick);
tick.all('/', methodNotAllowed);

export default tick;
