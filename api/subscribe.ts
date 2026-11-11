import { createEndpoint } from '../src/server/endpoint.js';
import subscribe from '../src/server/routes/subscribe.js';

export const app = createEndpoint('/api/subscribe', subscribe);

export const config = {
  runtime: 'nodejs'
};

export default {
  fetch(request: Request) {
    return app.fetch(request);
  }
};
