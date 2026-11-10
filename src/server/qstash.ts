import { Client, Receiver } from '@upstash/qstash';

const token = process.env.QSTASH_TOKEN;
const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
const cronSecret = process.env.CRON_SECRET;

let client: Client | null = null;

const getClient = () => {
  if (!token) {
    throw new Error('QSTASH_TOKEN is not configured');
  }
  client ??= new Client({ token });
  return client;
};

export const isQstashConfigured = () =>
  Boolean(token && currentSigningKey && nextSigningKey);

export const scheduleNotification = async (
  url: string,
  subscriberId: string,
  when: Date
) => {
  const response = await getClient().publishJSON({
    url,
    body: { id: subscriberId },
    notBefore: Math.floor(when.getTime() / 1000),
    retries: 3,
    headers: cronSecret ? { 'x-weathered-secret': cronSecret } : undefined
  });

  return response.messageId;
};

export const cancelNotification = async (messageId?: string) => {
  if (!messageId || !token) {
    return;
  }

  try {
    await getClient().messages.cancel(messageId);
  } catch (error) {
    // A message that already fired cannot be cancelled; that is fine.
    console.error(`Could not cancel QStash message ${messageId}`, error);
  }
};

export const verifyQstashRequest = async (signature: string, body: string) => {
  if (!currentSigningKey || !nextSigningKey) {
    return false;
  }

  const receiver = new Receiver({
    currentSigningKey,
    nextSigningKey
  });

  try {
    return await receiver.verify({ signature, body });
  } catch {
    return false;
  }
};
