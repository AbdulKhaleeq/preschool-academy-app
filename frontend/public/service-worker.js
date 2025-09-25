self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('wellingtonkids-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
        '/manifest.json',
        '/favicon.ico',
        '/logo192.png',
        '/logo512.png',
        '/MyLogo.png',
        // Precache static assets (update paths as needed)
        '/static/css/main.css',
        '/static/js/bundle.js',
        '/static/js/main.js',
        // Add more assets if needed
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== 'wellingtonkids-cache-v1')
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        // If request is for navigation, serve offline.html
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
