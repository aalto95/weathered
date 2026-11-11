import { Hono } from 'hono';
import {
  deletePreferences,
  isStorageConfigured,
  loadPreferences
} from '../blob.js';
import { cancelNotification } from '../qstash.js';
import { parseId, ValidationError } from '../validation.js';
import { methodNotAllowed, readJsonBody } from './shared.js';

const unsubscribe = new Hono();

unsubscribe.post('/', async (c) => {
  if (!isStorageConfigured()) {
    return c.json({ error: 'Notification storage is not configured' }, 503);
  }

  try {
    const body = await readJsonBody(c);
    const id = parseId(
      typeof body === 'object' && body !== null
        ? (body as { id?: unknown }).id
        : undefined
    );
    const preferences = await loadPreferences(id);

    if (preferences?.qstashMessageId) {
      await cancelNotification(preferences.qstashMessageId);
    }

    await deletePreferences(id);
    return c.json({ ok: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return c.json({ error: error.message }, 400);
    }

    console.error('Failed to delete notification preferences', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

unsubscribe.all('/', methodNotAllowed);

export default unsubscribe;
