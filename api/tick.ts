import { handle } from '@hono/vercel';
import { createEndpoint } from '../src/server/endpoint.js';
import tick from '../src/server/routes/tick.js';

export const app = createEndpoint('/api/tick', tick);

export const config = {
  runtime: 'nodejs'
};

export default handle(app);
