import { afterEach, describe, expect, test, vi } from 'vitest';

const resetEnv = () => {
  delete process.env.QSTASH_TOKEN;
  delete process.env.QSTASH_CURRENT_SIGNING_KEY;
  delete process.env.QSTASH_NEXT_SIGNING_KEY;
  delete process.env.CRON_SECRET;
};

afterEach(() => {
  vi.resetModules();
  resetEnv();
});

describe('isQstashConfigured', () => {
  test('only requires the token for scheduling', async () => {
    resetEnv();
    process.env.QSTASH_TOKEN = 'token';

    const { isQstashConfigured } = await import('./qstash');

    expect(isQstashConfigured()).toBe(true);
  });

  test('is disabled without a token', async () => {
    resetEnv();

    const { isQstashConfigured } = await import('./qstash');

    expect(isQstashConfigured()).toBe(false);
  });
});
