import { Hono } from 'hono';
import {
  deletePreferences,
  isStorageConfigured,
  loadPreferences
} from '../blob.js';
import { buildTestNotification } from '../digest.js';
import { isPushConfigured, sendPush } from '../push.js';
import { parseId, ValidationError } from '../validation.js';
import { methodNotAllowed, readJsonBody } from './shared.js';

const test = new Hono();

test.post('/', async (c) => {
  if (!isStorageConfigured() || !isPushConfigured()) {
    return c.json({ error: 'Notifications are not configured' }, 503);
  }

  try {
    const body = await readJsonBody(c);
    const id = parseId(
      typeof body === 'object' && body !== null
        ? (body as { id?: unknown }).id
        : undefined
    );
    const preferences = await loadPreferences(id);

    if (!preferences) {
      return c.json({ error: 'Subscription not found' }, 404);
    }

    const result = await sendPush(
      preferences,
      buildTestNotification(preferences.lang)
    );

    if (result === 'expired') {
      await deletePreferences(id);
      return c.json({ error: 'Push subscription has expired' }, 410);
    }

    if (result === 'failed') {
      return c.json({ error: 'Could not deliver the test notification' }, 502);
    }

    return c.json({ ok: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return c.json({ error: error.message }, 400);
    }

    console.error('Failed to send test notification', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

test.all('/', methodNotAllowed);

export default test;
