import type { Context } from 'hono';

export const methodNotAllowed = (c: Context) =>
  c.json({ error: 'Method not allowed' }, 405);

/**
 * Vercel gives us the raw request body through the Web `Request` object.
 * Malformed JSON is treated as an empty body so validation can reject it with
 * the usual 400 response instead of throwing a parse error.
 */
export const parseJsonBody = (raw: string): unknown => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const readJsonBody = async (c: Context): Promise<unknown> =>
  parseJsonBody(await c.req.text());
