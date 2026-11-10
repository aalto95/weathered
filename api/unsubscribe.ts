import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deletePreferences, isStorageConfigured } from '../src/server/blob';
import { parseId, ValidationError } from '../src/server/validation';

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
