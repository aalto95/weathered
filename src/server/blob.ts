import { BlobNotFoundError, del, get, list, put } from '@vercel/blob';
import type { NotificationPreferences } from './types.js';

const PREFIX = 'notifications/';

const token = () => {
  const value = process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }
  return value;
};

const pathFor = (id: string) => `${PREFIX}${id}.json`;

export const isStorageConfigured = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export const savePreferences = async (preferences: NotificationPreferences) => {
  await put(pathFor(preferences.id), JSON.stringify(preferences), {
    access: 'private',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json',
    token: token()
  });
};

export const loadPreferences = async (
  id: string
): Promise<NotificationPreferences | null> => {
  const result = await get(pathFor(id), {
    access: 'private',
    useCache: false,
    token: token()
  });

  if (!result || result.statusCode !== 200) {
    return null;
  }

  return (await new Response(result.stream).json()) as NotificationPreferences;
};

export const deletePreferences = async (id: string) => {
  try {
    await del(pathFor(id), { token: token() });
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) {
      throw error;
    }
  }
};

export const listPreferences = async (): Promise<NotificationPreferences[]> => {
  const blobToken = token();
  const preferences: NotificationPreferences[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: PREFIX,
      cursor,
      limit: 1000,
      token: blobToken
    });

    for (const blob of page.blobs) {
      if (!blob.pathname.endsWith('.json')) {
        continue;
      }

      const result = await get(blob.pathname, {
        access: 'private',
        useCache: false,
        token: blobToken
      });

      if (result?.statusCode === 200) {
        preferences.push(
          (await new Response(result.stream).json()) as NotificationPreferences
        );
      }
    }

    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return preferences;
};
