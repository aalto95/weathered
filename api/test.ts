import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  deletePreferences,
  isStorageConfigured,
  loadPreferences
} from '../src/server/blob';
import { buildTestNotification } from '../src/server/digest';
import { readJsonBody } from '../src/server/http';
import { isPushConfigured, sendPush } from '../src/server/push';
import { parseId, ValidationError } from '../src/server/validation';

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

  try {
    const body = readJsonBody(request);
    const id = parseId(
      typeof body === 'object' && body !== null
        ? (body as { id?: unknown }).id
        : undefined
    );
    const preferences = await loadPreferences(id);

    if (!preferences) {
      return response.status(404).json({ error: 'Subscription not found' });
    }

    const result = await sendPush(
      preferences,
      buildTestNotification(preferences.lang)
    );

    if (result === 'expired') {
      await deletePreferences(id);
      return response
        .status(410)
        .json({ error: 'Push subscription has expired' });
    }

    if (result === 'failed') {
      return response
        .status(502)
        .json({ error: 'Could not deliver the test notification' });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return response.status(400).json({ error: error.message });
    }

    console.error('Failed to send test notification', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
