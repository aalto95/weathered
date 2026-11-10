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
