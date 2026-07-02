// ═══════════════════════════════════════════════
//  Service Worker — Diego Nutrición
// ═══════════════════════════════════════════════
// CÓMO ACTUALIZAR: cada vez que subas cambios nuevos a GitHub, sube también este
// archivo con APP_VERSION incrementado (ej. '2026.07.02.2'). Si no cambias este
// número, los teléfonos que ya instalaron la app NO van a detectar la actualización,
// porque el navegador compara el sw.js byte a byte para decidir si hay algo nuevo.
const APP_VERSION = '2026.07.02.1';
const CACHE_NAME = `diego-nutricion-${APP_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── INSTALL ──
// Cachea el "app shell". Si falta algún ícono no rompe la instalación completa
// (Promise.allSettled en vez de cache.addAll, que aborta todo ante el primer 404).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] No se pudo cachear', url, err))
        )
      );
    })
  );
  // Importante: NO se llama self.skipWaiting() aquí a propósito. La nueva versión
  // se queda "esperando" hasta que el usuario confirme desde el banner de la app
  // (mensaje SKIP_WAITING) — así no se interrumpe una sesión en curso.
});

// ── ACTIVATE ──
// Borra cachés de versiones viejas para no acumular basura en el teléfono.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── MENSAJE DESDE LA APP ──
// La app llama a esto cuando el usuario toca "Actualizar ahora" en el banner.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── FETCH ──
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const esHTML = req.mode === 'navigate' || req.url.endsWith('.html') || req.url.endsWith('manifest.json');

  if (esHTML) {
    // Network-first: si hay internet, siempre intenta traer la versión más nueva
    // (así el navegador puede detectar que hay una actualización). Si falla
    // (sin señal / avión), sirve la copia cacheada para que la app funcione offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first para el resto (íconos, manifest, etc.) — más rápido y ahorra datos.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copia = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
        return res;
      });
    })
  );
});
