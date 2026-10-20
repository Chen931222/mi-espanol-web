/* Mi Español Service Worker — network-first，離線時退回快取 */
const CACHE = 'mi-espanol-v5';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(r => {
        if (r) return r;
        // 只有「進站首頁」才退回 index.html；別的路徑寧可誠實報錯，
        // 也不要默默端出另一個頁面讓人以為程式沒生效
        const u = new URL(req.url);
        const isRoot = u.origin === self.location.origin && (u.pathname === '/' || u.pathname === '/index.html');
        if (isRoot) return caches.match('./index.html');
        return new Response('離線，而且這個頁面沒有快取版本。請確認本機伺服器有在跑。',
          { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }))
  );
});
