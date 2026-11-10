import type { VercelRequest, VercelResponse } from '@vercel/node';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import subscribeHandler from '../../api/subscribe';
import testHandler from '../../api/test';
import tickHandler from '../../api/tick';
import unsubscribeHandler from '../../api/unsubscribe';
import {
  deletePreferences,
  isStorageConfigured,
  listPreferences,
  loadPreferences,
  savePreferences
} from './blob';
import {
  buildDailyNotification,
  buildTestNotification,
  fetchWeatherSummaries
} from './digest';
import { isPushConfigured, sendPush } from './push';
import { NotificationPreferences } from './types';

vi.mock('./blob', () => ({
  isStorageConfigured: vi.fn(),
  savePreferences: vi.fn(),
  loadPreferences: vi.fn(),
  deletePreferences: vi.fn(),
  listPreferences: vi.fn()
}));

vi.mock('./push', () => ({
  isPushConfigured: vi.fn(),
  sendPush: vi.fn()
}));

vi.mock('./digest', () => ({
  buildDailyNotification: vi.fn(),
  buildTestNotification: vi.fn(),
  fetchWeatherSummaries: vi.fn()
}));

const storageConfigured = vi.mocked(isStorageConfigured);
const pushConfigured = vi.mocked(isPushConfigured);
const save = vi.mocked(savePreferences);
const load = vi.mocked(loadPreferences);
const remove = vi.mocked(deletePreferences);
const list = vi.mocked(listPreferences);
const send = vi.mocked(sendPush);
const dailyMessage = vi.mocked(buildDailyNotification);
const testMessage = vi.mocked(buildTestNotification);
const summaries = vi.mocked(fetchWeatherSummaries);

const request = (
  method: string,
  body?: unknown,
  headers: Record<string, string> = {}
) =>
  ({
    method,
    body,
    headers
  }) as unknown as VercelRequest;

const response = () => {
  const res = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn()
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as VercelResponse & typeof res;
};

const validBody = () => ({
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
  favorites: [
    {
      id: 1,
      name: 'Berlin',
      country: 'DE',
      latitude: 52.52,
      longitude: 13.41
    }
  ],
  lang: 'en'
});

const preferences = (
  overrides: Partial<NotificationPreferences> = {}
): NotificationPreferences =>
  ({
    ...validBody(),
    id: '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
    ...overrides
  }) as NotificationPreferences;

beforeEach(() => {
  vi.clearAllMocks();
  storageConfigured.mockReturnValue(true);
  pushConfigured.mockReturnValue(true);
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.CRON_SECRET;
});

describe('POST /api/subscribe', () => {
  test('creates a subscription', async () => {
    const res = response();

    await subscribeHandler(request('POST', validBody()), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: expect.any(String) });
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        time: '08:30',
        timezone: 'Europe/Berlin',
        favorites: validBody().favorites
      })
    );
  });

  test('updates an existing subscription and preserves creation time', async () => {
    const existing = preferences();
    load.mockResolvedValue(existing);
    const res = response();

    await subscribeHandler(
      request('POST', { ...validBody(), id: existing.id }),
      res
    );

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existing.id,
        createdAt: existing.createdAt
      })
    );
  });

  test('rejects invalid input', async () => {
    const res = response();

    await subscribeHandler(
      request('POST', { ...validBody(), time: '25:00' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects unsupported methods', async () => {
    const res = response();

    await subscribeHandler(request('GET'), res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});

describe('POST /api/unsubscribe', () => {
  test('deletes the subscription', async () => {
    const res = response();
    const id = '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

    await unsubscribeHandler(request('POST', { id }), res);

    expect(remove).toHaveBeenCalledWith(id);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('rejects invalid ids', async () => {
    const res = response();

    await unsubscribeHandler(request('POST', { id: '../x' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('POST /api/test', () => {
  test('sends a test notification', async () => {
    const prefs = preferences();
    load.mockResolvedValue(prefs);
    send.mockResolvedValue('sent');
    testMessage.mockReturnValue({
      title: 'Test',
      body: 'Test',
      tag: 'test',
      url: '/notifications'
    });
    const res = response();

    await testHandler(request('POST', { id: prefs.id }), res);

    expect(testMessage).toHaveBeenCalledWith(prefs.lang);
    expect(send).toHaveBeenCalledWith(
      prefs,
      expect.objectContaining({ title: 'Test' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('returns 404 for an unknown subscription', async () => {
    load.mockResolvedValue(null);
    const res = response();

    await testHandler(
      request('POST', { id: '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('cleans up an expired subscription', async () => {
    const prefs = preferences();
    load.mockResolvedValue(prefs);
    send.mockResolvedValue('expired');
    testMessage.mockReturnValue({
      title: 'Test',
      body: 'Test',
      tag: 'test',
      url: '/notifications'
    });
    const res = response();

    await testHandler(request('POST', { id: prefs.id }), res);

    expect(remove).toHaveBeenCalledWith(prefs.id);
    expect(res.status).toHaveBeenCalledWith(410);
  });
});

describe('GET /api/tick', () => {
  const tickRequest = (secret = 'secret') =>
    request('POST', undefined, { authorization: `Bearer ${secret}` });

  test('rejects missing or wrong secrets', async () => {
    process.env.CRON_SECRET = 'secret';
    const res = response();

    await tickHandler(tickRequest('wrong'), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('sends a due digest and records the local send date', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T07:00:00.000Z'));
    process.env.CRON_SECRET = 'secret';

    const prefs = preferences({ time: '08:00' });
    list.mockResolvedValue([prefs]);
    summaries.mockResolvedValue([{ name: 'Berlin', temperature: 5, code: 3 }]);
    dailyMessage.mockReturnValue({
      title: 'Weathered',
      body: 'Berlin',
      tag: 'weathered-daily',
      url: '/favorites'
    });
    send.mockResolvedValue('sent');
    const res = response();

    await tickHandler(tickRequest(), res);

    expect(send).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: prefs.id,
        lastSentDate: '2026-11-10'
      })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ checked: 1, sent: 1, failed: 0 })
    );
  });

  test('skips a digest that was already sent today', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T07:00:00.000Z'));
    process.env.CRON_SECRET = 'secret';

    list.mockResolvedValue([
      preferences({ time: '08:00', lastSentDate: '2026-11-10' })
    ]);
    const res = response();

    await tickHandler(tickRequest(), res);

    expect(send).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sent: 0, skipped: 1 })
    );
  });

  test('removes expired subscriptions', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T07:00:00.000Z'));
    process.env.CRON_SECRET = 'secret';

    const prefs = preferences({ time: '08:00' });
    list.mockResolvedValue([prefs]);
    summaries.mockResolvedValue([]);
    dailyMessage.mockReturnValue({
      title: 'Weathered',
      body: '',
      tag: 'weathered-daily',
      url: '/favorites'
    });
    send.mockResolvedValue('expired');
    const res = response();

    await tickHandler(tickRequest(), res);

    expect(remove).toHaveBeenCalledWith(prefs.id);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ expired: 1 })
    );
  });
});
