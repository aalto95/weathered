import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { app as sendApp } from '../../api/send';
import subscribeEntry, { app as subscribeApp } from '../../api/subscribe';
import { app as testApp } from '../../api/test';
import { app as tickApp } from '../../api/tick';
import { app as unsubscribeApp } from '../../api/unsubscribe';
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
import {
  cancelNotification,
  isQstashConfigured,
  scheduleNotification,
  verifyQstashRequest
} from './qstash';
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

vi.mock('./qstash', () => ({
  isQstashConfigured: vi.fn(),
  scheduleNotification: vi.fn(),
  cancelNotification: vi.fn(),
  verifyQstashRequest: vi.fn()
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
const qstashConfigured = vi.mocked(isQstashConfigured);
const schedule = vi.mocked(scheduleNotification);
const cancel = vi.mocked(cancelNotification);
const verify = vi.mocked(verifyQstashRequest);

const apps = {
  '/api/subscribe': subscribeApp,
  '/api/unsubscribe': unsubscribeApp,
  '/api/test': testApp,
  '/api/send': sendApp,
  '/api/tick': tickApp
};

type ApiPath = keyof typeof apps;

const request = (path: ApiPath, init?: RequestInit) =>
  apps[path].request(path, init);

const post = (
  path: ApiPath,
  body?: unknown,
  headers: Record<string, string> = {}
) =>
  request(path, {
    method: 'POST',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

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
  qstashConfigured.mockReturnValue(true);
  schedule.mockResolvedValue('msg_1');
  cancel.mockResolvedValue(undefined);
  verify.mockResolvedValue(false);
  process.env.APP_URL = 'https://weathered.test';
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.CRON_SECRET;
  delete process.env.APP_URL;
});

describe('POST /api/subscribe', () => {
  test('creates a subscription', async () => {
    const res = await post('/api/subscribe', validBody());

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ id: expect.any(String) });
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        time: '08:30',
        timezone: 'Europe/Berlin',
        favorites: validBody().favorites
      })
    );
    expect(schedule).toHaveBeenCalled();
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({ qstashMessageId: 'msg_1' })
    );
  });

  test('updates an existing subscription and preserves creation time', async () => {
    const existing = preferences({ qstashMessageId: 'msg_old' });
    load.mockResolvedValue(existing);

    const res = await post('/api/subscribe', {
      ...validBody(),
      id: existing.id
    });

    expect(res.status).toBe(200);
    expect(cancel).toHaveBeenCalledWith('msg_old');
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existing.id,
        createdAt: existing.createdAt
      })
    );
    expect(schedule).toHaveBeenCalled();
  });

  test('rejects invalid input', async () => {
    const res = await post('/api/subscribe', {
      ...validBody(),
      time: '25:00'
    });

    expect(res.status).toBe(400);
  });

  test('rejects unsupported methods', async () => {
    const res = await request('/api/subscribe');

    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: 'Method not allowed' });
  });

  test('exposes the Vercel fetch handler', async () => {
    const res = await subscribeEntry.fetch(
      new Request('https://weathered.test/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody())
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: expect.any(String) });
  });
});

describe('POST /api/unsubscribe', () => {
  test('deletes the subscription and cancels the QStash message', async () => {
    const id = '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
    load.mockResolvedValue(preferences({ qstashMessageId: 'msg_old' }));

    const res = await post('/api/unsubscribe', { id });

    expect(res.status).toBe(200);
    expect(cancel).toHaveBeenCalledWith('msg_old');
    expect(remove).toHaveBeenCalledWith(id);
  });

  test('rejects invalid ids', async () => {
    const res = await post('/api/unsubscribe', { id: '../x' });

    expect(res.status).toBe(400);
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

    const res = await post('/api/test', { id: prefs.id });

    expect(res.status).toBe(200);
    expect(testMessage).toHaveBeenCalledWith(prefs.lang);
    expect(send).toHaveBeenCalledWith(
      prefs,
      expect.objectContaining({ title: 'Test' })
    );
  });

  test('returns 404 for an unknown subscription', async () => {
    load.mockResolvedValue(null);

    const res = await post('/api/test', {
      id: '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d'
    });

    expect(res.status).toBe(404);
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

    const res = await post('/api/test', { id: prefs.id });

    expect(res.status).toBe(410);
    expect(remove).toHaveBeenCalledWith(prefs.id);
  });
});

describe('/api/tick', () => {
  const tickRequest = (secret = 'secret') =>
    post('/api/tick', undefined, {
      authorization: `Bearer ${secret}`
    });

  test('rejects missing or wrong secrets', async () => {
    process.env.CRON_SECRET = 'secret';

    const res = await tickRequest('wrong');

    expect(res.status).toBe(401);
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

    const res = await tickRequest();

    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalled();
    expect(schedule).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: prefs.id,
        lastSentDate: '2026-11-10'
      })
    );
    expect(await res.json()).toEqual(
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

    const res = await tickRequest();

    expect(send).not.toHaveBeenCalled();
    expect(await res.json()).toEqual(
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

    const res = await tickRequest();

    expect(remove).toHaveBeenCalledWith(prefs.id);
    expect(await res.json()).toEqual(expect.objectContaining({ expired: 1 }));
  });
});

describe('POST /api/send', () => {
  const sendRequest = (id: string, headers: Record<string, string> = {}) =>
    post('/api/send', { id }, headers);

  test('rejects an unauthorized request', async () => {
    process.env.CRON_SECRET = 'secret';

    const res = await sendRequest(preferences().id);

    expect(res.status).toBe(401);
  });

  test('accepts a valid QStash signature', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T07:00:00.000Z'));
    process.env.CRON_SECRET = 'secret';
    verify.mockResolvedValue(true);

    const prefs = preferences({ time: '08:00' });
    load.mockResolvedValue(prefs);
    summaries.mockResolvedValue([{ name: 'Berlin', temperature: 5, code: 3 }]);
    dailyMessage.mockReturnValue({
      title: 'Weathered',
      body: 'Berlin',
      tag: 'weathered-daily',
      url: '/favorites'
    });
    send.mockResolvedValue('sent');

    const res = await sendRequest(prefs.id, {
      'upstash-signature': 'signature'
    });

    expect(res.status).toBe(200);
    expect(verify).toHaveBeenCalledWith(
      'signature',
      JSON.stringify({ id: prefs.id })
    );
    expect(send).toHaveBeenCalled();
  });

  test('sends a due digest and schedules the next QStash run', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T07:00:00.000Z'));
    process.env.CRON_SECRET = 'secret';

    const prefs = preferences({
      time: '08:00',
      qstashMessageId: 'msg_current'
    });
    load.mockResolvedValue(prefs);
    summaries.mockResolvedValue([{ name: 'Berlin', temperature: 5, code: 3 }]);
    dailyMessage.mockReturnValue({
      title: 'Weathered',
      body: 'Berlin',
      tag: 'weathered-daily',
      url: '/favorites'
    });
    send.mockResolvedValue('sent');
    schedule.mockResolvedValue('msg_next');

    const res = await sendRequest(prefs.id, {
      'x-weathered-secret': 'secret'
    });

    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalled();
    expect(schedule).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        lastSentDate: '2026-11-10',
        qstashMessageId: 'msg_next'
      })
    );
  });

  test('skips a message that is not due yet and reschedules', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T05:00:00.000Z'));
    process.env.CRON_SECRET = 'secret';

    const prefs = preferences({ time: '08:00' });
    load.mockResolvedValue(prefs);

    const res = await sendRequest(prefs.id, {
      'x-weathered-secret': 'secret'
    });

    expect(send).not.toHaveBeenCalled();
    expect(schedule).toHaveBeenCalled();
    expect(await res.json()).toEqual({
      ok: true,
      skipped: 'not-due'
    });
  });

  test('returns 502 when push delivery fails', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T07:00:00.000Z'));
    process.env.CRON_SECRET = 'secret';

    const prefs = preferences({ time: '08:00' });
    load.mockResolvedValue(prefs);
    summaries.mockResolvedValue([]);
    dailyMessage.mockReturnValue({
      title: 'Weathered',
      body: '',
      tag: 'weathered-daily',
      url: '/favorites'
    });
    send.mockResolvedValue('failed');

    const res = await sendRequest(prefs.id, {
      'x-weathered-secret': 'secret'
    });

    expect(res.status).toBe(502);
    expect(schedule).not.toHaveBeenCalled();
  });

  test('returns success for a missing subscription', async () => {
    process.env.CRON_SECRET = 'secret';
    load.mockResolvedValue(null);

    const res = await sendRequest(preferences().id, {
      'x-weathered-secret': 'secret'
    });

    expect(await res.json()).toEqual({
      ok: true,
      skipped: 'missing'
    });
  });
});
