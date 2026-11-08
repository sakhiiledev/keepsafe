/* Keepsake offline cache: the app keeps working (and keeps your drafts) without a connection.
   Pages and code: network first, cached copy when offline. Photos, fonts and libraries: cache first. */
const VERSION = 'keepsake-v3';
const SHELL = [
  'index.html', 'builder.html', 'preview.html', 'dashboard.html', 'login.html', 'pricing.html',
  'builder.css', 'builder.js', 'look.js', 'video.js', 'app.css', 'cloud.js', 'config.js',
  'vendor/supabase-2.45.4.js', 'vendor/html-to-image-1.11.11.js',
  'engine/engine.css', 'engine/engine.js', 'engine/heritage.css', 'engine/heritage.js',
  'engine/templates.js', 'engine/templates-heritage.js', 'engine/catalog.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/supabase\.co$/.test(url.hostname) && !url.pathname.includes('/storage/v1/object/public/')) return; // live data is never cached
  const longLived = url.pathname.startsWith('/assets/') || url.pathname.startsWith('/vendor/') || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || url.pathname.includes('/storage/v1/object/public/');
  if (longLived) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
});
