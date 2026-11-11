import { createEndpoint } from '../src/server/endpoint.js';
import test from '../src/server/routes/test.js';

export const app = createEndpoint('/api/test', test);

export const config = {
  runtime: 'nodejs'
};

export default {
  fetch(request: Request) {
    return app.fetch(request);
  }
};
