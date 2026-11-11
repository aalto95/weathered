import { Hono } from 'hono';
import { randomUUID } from 'node:crypto';
import {
  isStorageConfigured,
  loadPreferences,
  savePreferences
} from '../blob.js';
import { getAppUrl } from '../http.js';
import { cancelNotification } from '../qstash.js';
import { scheduleNextDelivery } from '../scheduler.js';
import type { NotificationPreferences } from '../types.js';
import { parseSubscribePayload, ValidationError } from '../validation.js';
import { methodNotAllowed, readJsonBody } from './shared.js';

const subscribe = new Hono();

subscribe.post('/', async (c) => {
  if (!isStorageConfigured()) {
    return c.json({ error: 'Notification storage is not configured' }, 503);
  }

  try {
    const payload = parseSubscribePayload(await readJsonBody(c));
    const id = payload.id ?? randomUUID();
    const existing = payload.id ? await loadPreferences(payload.id) : null;
    const scheduleChanged =
      !existing ||
      existing.time !== payload.time ||
      existing.timezone !== payload.timezone;

    if (existing?.qstashMessageId && scheduleChanged) {
      await cancelNotification(existing.qstashMessageId);
    }

    const now = new Date().toISOString();
    const preferences: NotificationPreferences = {
      id,
      subscription: payload.subscription,
      time: payload.time,
      timezone: payload.timezone,
      favorites: payload.favorites,
      lang: payload.lang,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastSentDate: existing?.lastSentDate,
      lastSentAt: existing?.lastSentAt
    };

    await savePreferences(preferences);

    // Background syncs update favorites and language. They should not cancel a
    // pending QStash message unless the delivery time itself changed.
    if (scheduleChanged || !existing?.qstashMessageId) {
      try {
        const messageId = await scheduleNextDelivery(
          preferences,
          getAppUrl(c),
          true
        );

        if (messageId) {
          preferences.qstashMessageId = messageId;
          await savePreferences(preferences);
        }
      } catch (error) {
        // The hourly Vercel Cron still acts as a fallback.
        console.error('Failed to schedule the next QStash delivery', error);
      }
    }

    return c.json({ id });
  } catch (error) {
    if (error instanceof ValidationError) {
      return c.json({ error: error.message }, 400);
    }

    console.error('Failed to save notification preferences', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

subscribe.all('/', methodNotAllowed);

export default subscribe;
