import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DateTime } from 'luxon';
import {
  deletePreferences,
  isStorageConfigured,
  loadPreferences,
  savePreferences
} from '../src/server/blob.js';
import {
  buildDailyNotification,
  fetchWeatherSummaries
} from '../src/server/digest.js';
import { getAppUrl, readJsonBody } from '../src/server/http.js';
import { isPushConfigured, sendPush } from '../src/server/push.js';
import { verifyQstashRequest } from '../src/server/qstash.js';
import { isDueNow, localDateKey } from '../src/server/schedule.js';
import { scheduleNextDelivery } from '../src/server/scheduler.js';
import type { NotificationPreferences } from '../src/server/types.js';
import { parseId, ValidationError } from '../src/server/validation.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!isStorageConfigured() || !isPushConfigured()) {
    return response
      .status(503)
      .json({ error: 'Notifications are not configured' });
  }

  const secret = process.env.CRON_SECRET;
  const secretHeader = request.headers['x-weathered-secret'];
  const signature = request.headers['upstash-signature'];
  const authorizedBySecret = Boolean(secret) && secretHeader === secret;

  let authorized = authorizedBySecret;

  if (!authorized && typeof signature === 'string') {
    const rawBody =
      typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body);
    authorized = await verifyQstashRequest(signature, rawBody);
  }

  if (!authorized) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = readJsonBody(request);
    const id = parseId(
      typeof body === 'object' && body !== null
        ? (body as { id?: unknown }).id
        : undefined
    );
    const preferences = await loadPreferences(id);

    if (!preferences) {
      return response.status(200).json({ ok: true, skipped: 'missing' });
    }

    const now = DateTime.utc();
    const appUrl = getAppUrl(request);

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
      return response.status(200).json({ ok: true, skipped: 'not-due' });
    }

    const summaries = await fetchWeatherSummaries(preferences.favorites);
    const message = buildDailyNotification(summaries, preferences.lang);
    const outcome = await sendPush(preferences, message);

    if (outcome === 'expired') {
      await deletePreferences(id);
      return response.status(200).json({ ok: true, skipped: 'expired' });
    }

    if (outcome === 'failed') {
      // A non-2xx response makes QStash retry the delivery.
      return response
        .status(502)
        .json({ error: 'Could not deliver the notification' });
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
    return response.status(200).json({ ok: true, sent: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return response.status(400).json({ error: error.message });
    }

    console.error('Failed to process QStash delivery', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
