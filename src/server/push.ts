import type { NotificationMessage, NotificationPreferences } from './types.js';

type WebPushClient = typeof import('web-push');

// Vercel compiles the API functions to CommonJS, while web-push 4 is ESM-only.
// A normal require() or transpiled import() becomes require() again, so load it
// with a native runtime import that the transpiler leaves untouched.
// eslint-disable-next-line no-new-func
const importWebPush = new Function(
  'return import("web-push")'
) as () => Promise<WebPushClient>;

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject =
  process.env.VAPID_SUBJECT || 'mailto:notifications@weathered.vercel.app';

let clientPromise: Promise<WebPushClient> | null = null;
let vapidConfigured = false;

const getWebPush = async () => {
  clientPromise ??= importWebPush();
  const webpush = await clientPromise;

  if (!vapidConfigured && publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  }

  return webpush;
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
    const webpush = await getWebPush();
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
