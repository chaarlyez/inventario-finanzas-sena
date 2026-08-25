// Registro del service worker y aviso de instalación.
//
// El navegador solo permite instalar una aplicación web si se sirve por
// HTTPS (o desde localhost). Por HTTP plano esto no hace nada, sin error.
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Sin service worker la aplicación funciona igual; solo pierde la
      // instalación y el arranque sin conexión.
    });
  });

  // Chrome y Edge avisan cuando la aplicación es instalable. Se guarda el
  // evento para poder ofrecer el botón en el momento adecuado, en lugar de
  // dejar que el navegador muestre su propio aviso.
  let invitacion = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    invitacion = e;
    document.dispatchEvent(new CustomEvent('pwainstalable'));
  });

  window.addEventListener('appinstalled', () => {
    invitacion = null;
    document.dispatchEvent(new CustomEvent('pwainstalada'));
  });

  // En iPhone no existe `beforeinstallprompt`: la instalación es manual,
  // desde Compartir › Añadir a pantalla de inicio. Hay que detectarlo para
  // poder explicárselo al usuario en vez de ofrecer un botón que no haría
  // nada.
  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const yaInstalada = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  window.PWA = {
    get sePuedeInstalar() { return invitacion !== null; },
    esIOS,
    yaInstalada,
    async instalar() {
      if (!invitacion) return false;
      invitacion.prompt();
      const { outcome } = await invitacion.userChoice;
      invitacion = null;
      return outcome === 'accepted';
    },
  };
})();
