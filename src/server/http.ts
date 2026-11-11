import type { Context } from 'hono';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

const isPublicUrl = (value: string) => {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      !LOCAL_HOSTS.has(url.hostname) &&
      !url.hostname.endsWith('.local')
    );
  } catch {
    return false;
  }
};

export const getAppUrl = (c: Context) => {
  const configured = process.env.APP_URL?.replace(/\/$/, '');

  // A local .env.local value must not be used by QStash in production: it
  // would schedule deliveries to localhost and only the cron fallback would
  // ever run.
  if (configured && isPublicUrl(configured)) {
    return configured;
  }

  const requestUrl = new URL(c.req.url);
  const proto =
    c.req.header('x-forwarded-proto') ?? requestUrl.protocol.replace(':', '');
  const host =
    c.req.header('x-forwarded-host') ?? c.req.header('host') ?? requestUrl.host;

  return `${proto}://${host}`;
};
