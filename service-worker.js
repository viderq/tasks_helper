const CACHE_NAME = 'tasks-cache-v0.5';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css'
];

/* --- normalize helper --- */
function normalize(request) {
  const url = new URL(request.url);
  if (url.origin === location.origin && url.pathname === '/') {
    return new Request('./index.html', { mode: 'same-origin' });
  }
  url.search = ''; // убираем query
  return new Request(url, {
    mode: request.mode,
    credentials: request.credentials
  });
}

/* --- INSTALL --- */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of PRECACHE_URLS) {
        try {
          const response = await fetch(url, { cache: 'no-store' });
          if (response.ok) {
            await cache.put(normalize(new Request(url)), response.clone());
          }
        } catch (err) {
          console.warn(`Не удалось закэшировать ${url}`, err);
        }
      }
    })
  );
});

/* --- ACTIVATE --- */
self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

/* --- FETCH --- */
self.addEventListener('fetch', event => {
  const { request } = event;

  // Пропускаем запросы на API, PHP, POST и не GET запросы
  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.endsWith('.php') ||
    request.url.includes('bot') ||
    request.url.includes('token=')
  ) {
    return; // не обрабатываем
  }

  // Запрос навигации — всегда index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(normalize(new Request('./index.html'))).then(
        resp => resp || fetch(request).catch(() => offlineFallback())
      )
    );
    return;
  }

  // Остальное — cache-first
  event.respondWith(
    caches.match(normalize(request)).then(cached => {
      return cached || fetch(request).then(resp => {
        if (
          resp.ok &&
          resp.type === 'basic' &&
          resp.url.startsWith(self.location.origin)
        ) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(normalize(request), resp.clone());
          });
        }
        return resp;
      }).catch(() => {
        // fallback на index.html если ничего не найдено
        return caches.match('./index.html');
      });
    })
  );
});

function offlineFallback() {
  return new Response('<h1>Нет подключения</h1><p>Вы офлайн</p>', {
    headers: { 'Content-Type': 'text/html' }
  });
}
