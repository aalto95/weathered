import { Hono } from 'hono';
import { afterEach, describe, expect, test } from 'vitest';
import { getAppUrl } from './http';

const app = new Hono();
app.get('/', (c) => c.text(getAppUrl(c)));

afterEach(() => {
  delete process.env.APP_URL;
});

describe('getAppUrl', () => {
  test('uses a public APP_URL', async () => {
    process.env.APP_URL = 'https://weathered.vercel.app/';

    const res = await app.request('https://preview.vercel.app/');

    expect(await res.text()).toBe('https://weathered.vercel.app');
  });

  test('ignores a localhost APP_URL', async () => {
    process.env.APP_URL = 'http://localhost:3000';

    const res = await app.request('https://weathered.test/');

    expect(await res.text()).toBe('https://weathered.test');
  });

  test('ignores an invalid APP_URL', async () => {
    process.env.APP_URL = 'not a url';

    const res = await app.request('https://weathered.test/');

    expect(await res.text()).toBe('https://weathered.test');
  });

  test('uses forwarded headers when APP_URL is unset', async () => {
    const res = await app.request('https://internal.test/', {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'weathered.vercel.app'
      }
    });

    expect(await res.text()).toBe('https://weathered.vercel.app');
  });
});
