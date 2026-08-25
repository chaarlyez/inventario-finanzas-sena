// Controlador de tema. Se carga en el <head>, antes que la hoja de estilos
// pinte nada, para que al abrir en oscuro no haya un destello blanco.
//
// Tres estados, no dos:
//   'sistema' (por defecto) — no marca nada y deja decidir a la media query
//   'claro'  — fuerza el tema claro aunque el sistema esté en oscuro
//   'oscuro' — fuerza el tema oscuro aunque el sistema esté en claro
(function () {
  const CLAVE = 'stokio:tema';
  const VALIDOS = ['sistema', 'claro', 'oscuro'];

  function leer() {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return VALIDOS.includes(guardado) ? guardado : 'sistema';
    } catch {
      // Modo privado o almacenamiento bloqueado: se cae a 'sistema'.
      return 'sistema';
    }
  }

  function aplicar(tema) {
    if (tema === 'sistema') document.documentElement.removeAttribute('data-tema');
    else document.documentElement.setAttribute('data-tema', tema);
  }

  function guardar(tema) {
    if (!VALIDOS.includes(tema)) return;
    try {
      localStorage.setItem(CLAVE, tema);
    } catch {
      // Si no se puede guardar, el tema igual se aplica en esta sesión.
    }
    aplicar(tema);
    document.dispatchEvent(new CustomEvent('temacambiado', { detail: { tema, efectivo: efectivo() } }));
  }

  // Qué tema se está viendo de hecho, resolviendo 'sistema'.
  function efectivo() {
    const t = leer();
    if (t !== 'sistema') return t;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }

  aplicar(leer());

  // Si el usuario está en 'sistema' y cambia el tema del sistema operativo,
  // la interfaz debe seguirlo sin recargar.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (leer() === 'sistema') {
      document.dispatchEvent(new CustomEvent('temacambiado', { detail: { tema: 'sistema', efectivo: efectivo() } }));
    }
  });

  window.Tema = { leer, guardar, efectivo, VALIDOS };
})();
