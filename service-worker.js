const CACHE_NAME = 'tasks-cache-v0.6';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './script.js', // добавь вручную свой JS-файл
];

// Файлы, которые мы считаем кэшируемыми по расширению
const CACHEABLE_EXTENSIONS = ['.html', '.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff', '.woff2', '.ttf'];

// Упрощённая нормализация URL
function normalize(request) {
  const url = new URL(request.url);
  if (url.origin === location.origin && url.pathname === '/') {
    return new Request('./index.html', { mode: 'same-origin' });
  }
  url.search = '';
  return new Request(url, {
    mode: request.mode,
    credentials: request.credentials
  });
}

// INSTALL
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

// ACTIVATE
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

// FETCH
self.addEventListener('fetch', event => {
  const { request } = event;

  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.endsWith('.php') ||
    request.url.includes('token=') ||
    request.url.includes('bot')
  ) {
    return; // пропускаем нежелательные запросы
  }

  const normalized = normalize(request);

  // Страница навигации → index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(
        cached => cached || fetch(normalized).catch(() => offlineFallback())
      )
    );
    return;
  }

  // Все остальные запросы: cache-first
  event.respondWith(
    caches.match(normalized).then(cached => {
      if (cached) return cached;

      return fetch(normalized)
        .then(response => {
          // Кэшируем, если ресурс подходит
          const ext = normalized.url.split('.').pop();
          if (
            response.ok &&
            response.type === 'basic' &&
            response.url.startsWith(self.location.origin) &&
            CACHEABLE_EXTENSIONS.includes('.' + ext)
          ) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(normalized, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          return offlineFallback();
        });
    })
  );
});

// Fallback страница
function offlineFallback() {
  return new Response('<h1>Вы офлайн</h1><p>Проверьте соединение</p>', {
    headers: { 'Content-Type': 'text/html' }
  });
}
