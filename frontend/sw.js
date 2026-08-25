// Service worker de Stokio.
//
// Solo cachea el armazón de la aplicación: HTML, CSS, JavaScript e íconos.
// Las respuestas del API nunca se guardan — el stock cambia y mostrar una
// cifra vieja de inventario sería peor que no mostrar nada.

const VERSION = 'stokio-v1';

const ARMAZON = [
  './',
  './index.html',
  './inventario.html',
  './etiquetas.html',
  './movimientos-stock.html',
  './movimientos.html',
  './ambientes.html',
  './distribuidores.html',
  './reportes.html',
  './alertas.html',
  './usuarios.html',
  './login.html',
  './css/style.css',
  './css/login.css',
  './js/tema.js',
  './js/api.js',
  './js/layout.js',
  './js/qr.js',
  './js/dashboard.js',
  './js/etiquetas.js',
  './js/inventario.js',
  './manifest.webmanifest',
  './assets/stokio/isotipo.svg',
  './assets/stokio/favicon.svg',
  './assets/stokio/pwa/icono-192.png',
  './assets/stokio/pwa/icono-512.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // addAll falla entero si un solo archivo falla; se piden de a uno para
    // que un recurso ausente no impida instalar el resto.
    await Promise.all(ARMAZON.map((ruta) => cache.add(ruta).catch(() => null)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;

  // El API siempre va a la red. Datos de inventario cacheados llevarían a
  // vender algo que ya no hay.
  if (url.pathname.startsWith('/api/')) return;

  evento.respondWith((async () => {
    const cache = await caches.open(VERSION);

    // Primero la red, para que un despliegue nuevo se vea enseguida; el
    // caché queda como respaldo cuando no hay conexión.
    try {
      const respuesta = await fetch(peticion);
      if (respuesta && respuesta.ok) cache.put(peticion, respuesta.clone());
      return respuesta;
    } catch {
      const guardada = await cache.match(peticion);
      if (guardada) return guardada;
      // Si se pide una página y no hay nada, se entrega el armazón.
      if (peticion.mode === 'navigate') {
        const inicio = await cache.match('./index.html');
        if (inicio) return inicio;
      }
      throw new Error('Sin conexión y sin copia guardada.');
    }
  })());
});
