// ══════════════════════════════════════════════
// مندوب — Service Worker v4.0
// مسارات نسبية — متوافق مع GitHub Pages
// ══════════════════════════════════════════════

const CACHE = 'mandob-v4';

// الملفات الأساسية فقط — بمسارات نسبية
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ── INSTALL: cache الملفات الأساسية ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      // كل ملف على حدة لتجنب فشل الكل بسبب ملف واحد
      return Promise.allSettled(
        CORE_FILES.map(url =>
          cache.add(new Request(url, { cache: 'reload' }))
            .catch(e => console.warn('[SW] Failed to cache:', url, e))
        )
      );
    }).then(() => {
      console.log('[SW] Installed ✓');
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: احذف الكاش القديم ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Cache First, Network Fallback ──
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // تجاهل: Firebase, extensions, non-GET
  if (
    req.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('firebase')
  ) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // أرجع من الكاش + حدّث في الخلفية
        const networkFetch = fetch(req).then(response => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            caches.open(CACHE).then(c => c.put(req, response.clone()));
          }
          return response;
        }).catch(() => {});
        return cached;
      }

      // مو موجود في الكاش — اجلبه من الشبكة
      return fetch(req).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return response;
      }).catch(() => {
        // Offline fallback
        if (req.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
