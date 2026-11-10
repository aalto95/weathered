import { sendNotification, setVapidDetails } from 'web-push';
import type { NotificationMessage, NotificationPreferences } from './types.js';

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject =
  process.env.VAPID_SUBJECT || 'mailto:notifications@weathered.vercel.app';

let vapidConfigured = false;

const ensureVapid = () => {
  if (!vapidConfigured && publicKey && privateKey) {
    setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  }
};

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
    ensureVapid();
    await sendNotification(
      preferences.subscription as unknown as Parameters<
        typeof sendNotification
      >[0],
      JSON.stringify(message),
      { TTL: 60 * 60 * 24 }
    );
    return 'sent';
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    const errorCode = (error as { code?: string }).code;
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (statusCode === 404 || statusCode === 410) {
      return 'expired';
    }

    console.error(
      `Push delivery failed for subscription ${preferences.id} (status ${
        statusCode ?? 'unknown'
      }, code ${errorCode ?? 'none'}): ${errorMessage}`
    );
    return 'failed';
  }
};
