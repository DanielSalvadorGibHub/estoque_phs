/* Cache simples: o aplicativo abre mesmo sem sinal. */
const CACHE = 'almox-tec-v1';
const ARQUIVOS = ['tecnico.html', 'manifest.json', 'icone.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  /* nunca guarda em cache as chamadas ao Apps Script */
  if (u.hostname.includes('script.google.com') || u.hostname.includes('googleusercontent.com')) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.ok && u.origin === location.origin) {
        const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c));
      }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('tecnico.html')))
  );
});
