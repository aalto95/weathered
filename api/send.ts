import { createEndpoint } from '../src/server/endpoint.js';
import send from '../src/server/routes/send.js';

export const app = createEndpoint('/api/send', send);

export const config = {
  runtime: 'nodejs'
};

export default {
  fetch(request: Request) {
    return app.fetch(request);
  }
};
