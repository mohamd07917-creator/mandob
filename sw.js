// ══════════════════════════════════════════════
// مندوب — Service Worker v3.0
// ══════════════════════════════════════════════

const CACHE_NAME = 'mandob-v3';
const STATIC_CACHE = 'mandob-static-v3';
const DYNAMIC_CACHE = 'mandob-dynamic-v3';

// الملفات التي تُحفظ عند التثبيت
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap',
];

// ── INSTALL ──
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(url => {
        return new Request(url, { mode: 'no-cors' });
      })).catch(err => {
        // تجاهل أخطاء الـ CORS للـ fonts
        console.warn('[SW] Some assets failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل Firebase و Chrome Extension requests
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.protocol === 'chrome-extension:' ||
    request.method !== 'GET'
  ) {
    return;
  }

  // استراتيجية: Cache First ثم Network للملفات الثابتة
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        }).catch(() => {
          // Offline fallback
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // Network First لباقي الطلبات
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ── BACKGROUND SYNC (لو كان الجهاز offline) ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-houses') {
    console.log('[SW] Background sync triggered');
  }
});

// ── PUSH NOTIFICATIONS (مستقبلاً) ──
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'مندوب', body: 'إشعار جديد' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      dir: 'rtl',
      lang: 'ar',
    })
  );
});
