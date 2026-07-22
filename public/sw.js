/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'dropflow-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/public/manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('Error buffering initial offline assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Intercept Event (Stale-while-revalidate pattern)
self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') {
    return;
  }

  const url = e.request.url;

  // Skip API calls, chrome extensions, hot reloads, etc.
  if (
    url.includes('/api/') || 
    url.includes('chrome-extension') || 
    url.includes('__vite_ping') ||
    url.includes('/@vite/') ||
    url.includes('/@fs/') ||
    url.includes('sockjs') ||
    url.includes('ws') ||
    url.includes('node_modules')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          throw err;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Notification Click Event (Mobile & Desktop PWA)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Push Event Receiver for background push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'DropFlow', body: 'Nova atualização do seu negócio!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (_) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'dropflow-push-' + Date.now(),
    renotify: true,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Client Message Event Receiver (Trigger notifications on mobile PWA & Desktop)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    const options = {
      body: body || 'Notificação DropFlow',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'dropflow-msg-' + Date.now(),
      renotify: true
    };
    self.registration.showNotification(title || 'DropFlow 🚀', options);
  }
});
