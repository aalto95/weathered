import { createEndpoint } from '../src/server/endpoint.js';
import tick from '../src/server/routes/tick.js';

export const app = createEndpoint('/api/tick', tick);

export const config = {
  runtime: 'nodejs'
};

export default {
  fetch(request: Request) {
    return app.fetch(request);
  }
};
