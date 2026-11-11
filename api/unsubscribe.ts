import { handle } from '@hono/vercel';
import { createEndpoint } from '../src/server/endpoint.js';
import unsubscribe from '../src/server/routes/unsubscribe.js';

export const app = createEndpoint('/api/unsubscribe', unsubscribe);

export const config = {
  runtime: 'nodejs'
};

export default handle(app);
