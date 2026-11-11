import { buildPushPayload } from '@block65/webcrypto-web-push';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { isPushConfigured, sendPush } from './push';
import type { NotificationMessage, NotificationPreferences } from './types';

vi.mock('@block65/webcrypto-web-push', () => ({
  buildPushPayload: vi.fn()
}));

const build = vi.mocked(buildPushPayload);
const fetchMock = vi.fn();

const message: NotificationMessage = {
  title: 'Weathered',
  body: 'Berlin: 5°C, Clear sky',
  tag: 'weathered-daily',
  url: '/favorites'
};

const preferences = (
  overrides: Partial<NotificationPreferences> = {}
): NotificationPreferences =>
  ({
    id: '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    subscription: {
      endpoint: 'https://push.example.com/subscription/123',
      expirationTime: null,
      keys: {
        p256dh: 'public-key',
        auth: 'auth-secret'
      }
    },
    time: '08:30',
    timezone: 'Europe/Berlin',
    favorites: [],
    lang: 'en',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
    ...overrides
  }) as NotificationPreferences;

const payload = {
  method: 'POST',
  headers: {
    authorization: 'vapid t=token,k=key',
    ttl: '86400',
    'content-encoding': 'aes128gcm',
    'content-length': '4096',
    'content-type': 'application/octet-stream'
  },
  body: new Uint8Array([1, 2, 3])
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.VAPID_PUBLIC_KEY = 'public-key';
  process.env.VAPID_PRIVATE_KEY = 'private-key';
  process.env.VAPID_SUBJECT = 'mailto:test@example.com';
  vi.stubGlobal('fetch', fetchMock);
  build.mockResolvedValue(payload);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete process.env.VAPID_PUBLIC_KEY;
  delete process.env.VAPID_PRIVATE_KEY;
  delete process.env.VAPID_SUBJECT;
});

describe('isPushConfigured', () => {
  test('requires both VAPID keys', () => {
    expect(isPushConfigured()).toBe(true);

    delete process.env.VAPID_PRIVATE_KEY;

    expect(isPushConfigured()).toBe(false);
  });
});

describe('sendPush', () => {
  test('encrypts the message and delivers it', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    const prefs = preferences();

    const result = await sendPush(prefs, message);

    expect(result).toBe('sent');
    expect(build).toHaveBeenCalledWith(
      {
        data: JSON.stringify(message),
        options: { ttl: 60 * 60 * 24 }
      },
      {
        endpoint: prefs.subscription.endpoint,
        expirationTime: null,
        keys: prefs.subscription.keys
      },
      {
        subject: 'mailto:test@example.com',
        publicKey: 'public-key',
        privateKey: 'private-key'
      }
    );
    expect(fetchMock).toHaveBeenCalledWith(
      prefs.subscription.endpoint,
      payload
    );
  });

  test('normalizes a missing expiry to null', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    const prefs = preferences({
      subscription: {
        ...preferences().subscription,
        expirationTime: undefined
      }
    });

    await sendPush(prefs, message);

    expect(build).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ expirationTime: null }),
      expect.anything()
    );
  });

  test.each([404, 410])('reports status %i as expired', async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }));

    await expect(sendPush(preferences(), message)).resolves.toBe('expired');
  });

  test('reports other statuses as failed', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockResolvedValue(new Response('push rejected', { status: 500 }));

    const result = await sendPush(preferences(), message);

    expect(result).toBe('failed');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('status 500'));
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('push rejected')
    );
  });

  test('reports network errors as failed', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error('network down'));

    const result = await sendPush(preferences(), message);

    expect(result).toBe('failed');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('network down'));
  });

  test('throws when VAPID keys are missing', async () => {
    delete process.env.VAPID_PRIVATE_KEY;

    await expect(sendPush(preferences(), message)).rejects.toThrow(
      'VAPID keys are not configured'
    );
    expect(build).not.toHaveBeenCalled();
  });
});
