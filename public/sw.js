const SHELL = 'roam-shell-v1';
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      const response = await fetch('/', { cache: 'reload' });
      if (!response.ok) throw new Error('Shell unavailable');
      const html = await response.clone().text();
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)].map((m) => m[1]);
      await cache.addAll([
        '/offline.html',
        '/icon.svg',
        '/icon-192.png',
        '/icon-512.png',
        '/manifest.webmanifest',
        ...assets,
      ]);
      await cache.put('/', response);
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith('roam-shell-') && key !== SHELL) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener('fetch', (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/media/')) return;
  event.respondWith(
    (async () => {
      if (request.mode === 'navigate') {
        try {
          const response = await fetch(request);
          if (response.ok) await (await caches.open(SHELL)).put('/', response.clone());
          return response;
        } catch {
          return (
            (await (await caches.open(SHELL)).match('/')) ||
            (await caches.match('/offline.html')) ||
            new Response('Offline', { status: 503 })
          );
        }
      }
      const asset = url.origin === self.location.origin && url.pathname.startsWith('/assets/');
      const cached = await caches.match(request);
      if (cached && (!asset || !cached.headers.get('Content-Type')?.includes('text/html')))
        return cached;
      const response = await fetch(request);
      if (asset && response.ok && !response.headers.get('Content-Type')?.includes('text/html'))
        await (await caches.open(SHELL)).put(request, response.clone());
      return response;
    })(),
  );
});
