const CACHE_NAME = 'tasks-cache-v0.7';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './script.js', // твой JS
];

// Расширения для кешируемых локальных ресурсов
const CACHEABLE_EXTENSIONS = ['.html', '.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff', '.woff2', '.ttf'];

// Нормализация для навигации (главной страницы)
function normalize(request) {
  const url = new URL(request.url);
  if (url.origin === location.origin && (url.pathname === '/' || url.pathname === '/index.html')) {
    return new Request('./index.html', { mode: 'same-origin' });
  }
  return request; // НЕ убираем query
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

  // Пропускаем все запросы к внешним серверам (не наш origin)
  if (new URL(request.url).origin !== self.location.origin) {
    // Прямо перекидываем запрос в сеть без кеша
    return;
  }

  // Пропускаем не GET запросы
  if (request.method !== 'GET') return;

  // Навигация → отдаём из кеша index.html или сеть
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(
        cached => cached || fetch(request).catch(() => offlineFallback())
      )
    );
    return;
  }

  // Остальное — cache-first для локальных ресурсов
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          const ext = request.url.split('.').pop().toLowerCase();
          if (
            response.ok &&
            response.type === 'basic' &&
            CACHEABLE_EXTENSIONS.includes('.' + ext)
          ) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => offlineFallback());
    })
  );
});

function offlineFallback() {
  return new Response('<h1>Вы офлайн</h1><p>Проверьте соединение</p>', {
    headers: { 'Content-Type': 'text/html' }
  });
}
