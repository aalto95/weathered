import type { Context } from 'hono';

export const getAppUrl = (c: Context) => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }

  const proto = c.req.header('x-forwarded-proto') ?? 'https';
  const host = c.req.header('x-forwarded-host') ?? c.req.header('host');

  if (!host) {
    throw new Error('Could not determine the application URL');
  }

  return `${proto}://${host}`;
};
