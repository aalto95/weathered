import { Hono } from 'hono';
import { DateTime } from 'luxon';
import {
  deletePreferences,
  isStorageConfigured,
  loadPreferences,
  savePreferences
} from '../blob.js';
import { buildDailyNotification, fetchWeatherSummaries } from '../digest.js';
import { getAppUrl } from '../http.js';
import { isPushConfigured, sendPush } from '../push.js';
import { verifyQstashRequest } from '../qstash.js';
import { isDueNow, localDateKey } from '../schedule.js';
import { scheduleNextDelivery } from '../scheduler.js';
import type { NotificationPreferences } from '../types.js';
import { parseId, ValidationError } from '../validation.js';
import { methodNotAllowed, parseJsonBody } from './shared.js';

const send = new Hono();

send.post('/', async (c) => {
  if (!isStorageConfigured() || !isPushConfigured()) {
    return c.json({ error: 'Notifications are not configured' }, 503);
  }

  // The raw body is required to verify the QStash signature.
  const rawBody = await c.req.text();
  const secret = process.env.CRON_SECRET;
  const secretHeader = c.req.header('x-weathered-secret');
  const signature = c.req.header('upstash-signature');
  const authorizedBySecret = Boolean(secret) && secretHeader === secret;

  let authorized = authorizedBySecret;

  if (!authorized && signature) {
    authorized = await verifyQstashRequest(signature, rawBody);
  }

  if (!authorized) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = parseJsonBody(rawBody);
    const id = parseId(
      typeof body === 'object' && body !== null
        ? (body as { id?: unknown }).id
        : undefined
    );
    const preferences = await loadPreferences(id);

    if (!preferences) {
      return c.json({ ok: true, skipped: 'missing' });
    }

    const now = DateTime.utc();
    const appUrl = getAppUrl(c);

    if (!isDueNow(now, preferences, 120, 5)) {
      const next: NotificationPreferences = {
        ...preferences,
        qstashMessageId: undefined
      };

      try {
        const messageId = await scheduleNextDelivery(next, appUrl);
        if (messageId) {
          next.qstashMessageId = messageId;
        }
      } catch (error) {
        console.error('Failed to schedule the next QStash delivery', error);
      }

      await savePreferences(next);
      return c.json({ ok: true, skipped: 'not-due' });
    }

    const summaries = await fetchWeatherSummaries(preferences.favorites);
    const message = buildDailyNotification(summaries, preferences.lang);
    const outcome = await sendPush(preferences, message);

    if (outcome === 'expired') {
      await deletePreferences(id);
      return c.json({ ok: true, skipped: 'expired' });
    }

    if (outcome === 'failed') {
      // A non-2xx response makes QStash retry the delivery.
      return c.json({ error: 'Could not deliver the notification' }, 502);
    }

    const next: NotificationPreferences = {
      ...preferences,
      lastSentDate: localDateKey(now, preferences.timezone),
      lastSentAt: now.toISO() ?? undefined,
      qstashMessageId: undefined
    };

    try {
      const messageId = await scheduleNextDelivery(next, appUrl);
      if (messageId) {
        next.qstashMessageId = messageId;
      }
    } catch (error) {
      console.error('Failed to schedule the next QStash delivery', error);
    }

    await savePreferences(next);
    return c.json({ ok: true, sent: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return c.json({ error: error.message }, 400);
    }

    console.error('Failed to process QStash delivery', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

send.all('/', methodNotAllowed);

export default send;
