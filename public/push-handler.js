/* global self */

self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || 'Weathered';
  const options = {
    body: payload.body || 'Open Weathered for your forecast.',
    icon: '/icons/manifest/192x192.png',
    badge: '/icons/manifest/192x192.png',
    tag: payload.tag || 'weathered-daily',
    renotify: true,
    data: {
      url: payload.url || '/favorites'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/favorites';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ('focus' in client) {
            if ('navigate' in client) {
              client.navigate(url).catch(() => undefined);
            }
            return client.focus();
          }
        }

        return self.clients.openWindow(url);
      })
  );
});
