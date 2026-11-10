import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import {
  isStorageConfigured,
  loadPreferences,
  savePreferences
} from '../src/server/blob';
import { NotificationPreferences } from '../src/server/types';
import {
  parseSubscribePayload,
  ValidationError
} from '../src/server/validation';

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
    const payload = parseSubscribePayload(request.body);
    const id = payload.id ?? randomUUID();
    const existing = payload.id ? await loadPreferences(payload.id) : null;
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

    return response.status(200).json({ id });
  } catch (error) {
    if (error instanceof ValidationError) {
      return response.status(400).json({ error: error.message });
    }

    console.error('Failed to save notification preferences', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
