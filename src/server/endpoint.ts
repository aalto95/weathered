import { Hono } from 'hono';

/**
 * Wraps a Hono sub-app in the shared middleware and mounts it at the public
 * Vercel Function path. Keeping the path here means the app behaves the same
 * under `vercel dev` and in production.
 */
export const createEndpoint = (basePath: string, route: Hono) => {
  const app = new Hono();

  app.use('*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    await next();
  });

  app.route(basePath, route);
  app.notFound((c) => c.json({ error: 'Not found' }, 404));

  return app;
};
