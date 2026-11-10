import { createRequire } from 'node:module';
import type { NotificationMessage, NotificationPreferences } from './types.js';

// web-push is a CommonJS module. Vercel emits ESM functions here, so a default
// import fails at runtime with "does not provide an export named 'default'".
const require = createRequire(import.meta.url);
const webpush = require('web-push') as typeof import('web-push');

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject =
  process.env.VAPID_SUBJECT || 'mailto:notifications@weathered.vercel.app';

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export const isPushConfigured = () => Boolean(publicKey && privateKey);

export type PushResult = 'sent' | 'expired' | 'failed';

export const sendPush = async (
  preferences: NotificationPreferences,
  message: NotificationMessage
): Promise<PushResult> => {
  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys are not configured');
  }

  try {
    await webpush.sendNotification(
      preferences.subscription as unknown as Parameters<
        typeof webpush.sendNotification
      >[0],
      JSON.stringify(message),
      { TTL: 60 * 60 * 24 }
    );
    return 'sent';
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;

    if (statusCode === 404 || statusCode === 410) {
      return 'expired';
    }

    console.error(
      `Push delivery failed for subscription ${preferences.id} (status ${
        statusCode ?? 'unknown'
      })`
    );
    return 'failed';
  }
};
