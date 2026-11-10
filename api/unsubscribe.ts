import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  deletePreferences,
  isStorageConfigured,
  loadPreferences
} from '../src/server/blob.js';
import { cancelNotification } from '../src/server/qstash.js';
import { parseId, ValidationError } from '../src/server/validation.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!isStorageConfigured()) {
    return response
      .status(503)
      .json({ error: 'Notification storage is not configured' });
  }

  try {
    const id = parseId(request.body?.id);
    const preferences = await loadPreferences(id);

    if (preferences?.qstashMessageId) {
      await cancelNotification(preferences.qstashMessageId);
    }

    await deletePreferences(id);
    return response.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return response.status(400).json({ error: error.message });
    }

    console.error('Failed to delete notification preferences', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
