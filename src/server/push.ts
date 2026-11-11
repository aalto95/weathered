import {
  buildPushPayload,
  type PushSubscription
} from '@block65/webcrypto-web-push';
import type { NotificationMessage, NotificationPreferences } from './types.js';

const DEFAULT_SUBJECT = 'mailto:notifications@weathered.vercel.app';

const getVapidKeys = () => ({
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT || DEFAULT_SUBJECT
});

export const isPushConfigured = () => {
  const { publicKey, privateKey } = getVapidKeys();
  return Boolean(publicKey && privateKey);
};

export type PushResult = 'sent' | 'expired' | 'failed';

export const sendPush = async (
  preferences: NotificationPreferences,
  message: NotificationMessage
): Promise<PushResult> => {
  const vapid = getVapidKeys();

  if (!vapid.publicKey || !vapid.privateKey) {
    throw new Error('VAPID keys are not configured');
  }

  const subscription: PushSubscription = {
    endpoint: preferences.subscription.endpoint,
    expirationTime: preferences.subscription.expirationTime ?? null,
    keys: preferences.subscription.keys
  };

  try {
    const payload = await buildPushPayload(
      {
        data: JSON.stringify(message),
        options: { ttl: 60 * 60 * 24 }
      },
      subscription,
      vapid
    );

    const response = await fetch(subscription.endpoint, payload);

    if (response.ok) {
      return 'sent';
    }

    if (response.status === 404 || response.status === 410) {
      return 'expired';
    }

    const detail = await response.text().catch(() => '');
    console.error(
      `Push delivery failed for subscription ${preferences.id} (status ${
        response.status
      }): ${detail}`
    );
    return 'failed';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(
      `Push delivery failed for subscription ${preferences.id}: ${errorMessage}`
    );
    return 'failed';
  }
};
