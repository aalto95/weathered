import { handle } from '@hono/vercel';
import { createEndpoint } from '../src/server/endpoint.js';
import send from '../src/server/routes/send.js';

export const app = createEndpoint('/api/send', send);

export const config = {
  runtime: 'nodejs'
};

export default handle(app);
