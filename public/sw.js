/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'dropflow-cache-v4-ios';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/favicon-32.png',
  '/icons/favicon-48.png',
  '/icons/apple-touch-icon.png',
  '/icons/apple-touch-icon-167.png',
  '/icons/apple-touch-icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
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

  const requestUrl = new URL(e.request.url);

  // Cache only this app's navigation and static assets. Never cache Firebase,
  // authentication, analytics or other third-party data responses.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const isNavigation = e.request.mode === 'navigate';
  const isStaticAsset = ['script', 'style', 'image', 'font', 'manifest'].includes(e.request.destination);
  if (!isNavigation && !isStaticAsset) {
    return;
  }

  e.respondWith(
    (isNavigation ? fetch(e.request).then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
      }
      return networkResponse;
    }) : caches.match(e.request).then((cachedResponse) => cachedResponse || fetch(e.request).then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
      }
      return networkResponse;
    }))).catch(() => caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      throw new Error('Offline resource unavailable');
    }))
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
      tag: 'dropflow-msg-' + Date.now(),
      renotify: true
    };
    self.registration.showNotification(title || 'DropFlow 🚀', options);
  }
});
