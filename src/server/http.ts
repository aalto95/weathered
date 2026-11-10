import type { VercelRequest } from '@vercel/node';

export const readJsonBody = (request: VercelRequest): unknown => {
  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body);
    } catch {
      return null;
    }
  }
  return request.body;
};

const firstHeader = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const getAppUrl = (request: VercelRequest) => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }

  const proto = firstHeader(request.headers['x-forwarded-proto']) ?? 'https';
  const host = firstHeader(
    request.headers['x-forwarded-host'] ?? request.headers.host
  );

  if (!host) {
    throw new Error('Could not determine the application URL');
  }

  return `${proto}://${host}`;
};
