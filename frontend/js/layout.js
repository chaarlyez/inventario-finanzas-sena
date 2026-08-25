// Construye el sidebar y la barra superior en todas las páginas, y expone
// utilidades compartidas (iconos, modal, badges, gráfico) en `window.Layout`.

// Geometría tomada tal cual del set oficial de iconos de marca
// (frontend/assets/stokio/iconos.svg), pero sin el stroke="#A855F7" fijo:
// aquí se pinta con currentColor para poder heredar color según el
// contexto (blanco sobre círculos morados, gris inactivo, rojo en
// eliminar, etc.) — ver el README de esa carpeta para más detalle.
const ICONOS = {
  home: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  box: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 7 9 5 9-5M3 7v10l9 5 9-5V7"/>',
  cash: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.75c0-1 .9-1.75 2.5-1.75s2.5.7 2.5 1.5c0 2-5 1.25-5 3.25 0 .9 1 1.75 2.5 1.75s2.5-.75 2.5-1.75"/><path d="M12 6.5v11"/>',
  chart: '<path d="M4 20V4m0 16h16M7 16l4-4 3 2 5-6"/>',
  alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4-4"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.75c0 1.5-2.15 1.85-2.4 3"/><path d="M12 17h.01"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  close: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pencil: '<path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m13.5 8.5 3 3"/>',
  trash: '<path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13"/>',
  ver: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  entrada: '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
  salida: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  externalLink: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  mapPin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 9v-2a6 6 0 0 0-3-5.2"/>',
  truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
  arrowLeftRight: '<path d="M4 7h13m0 0-3-3m3 3-3 3M20 17H7m0 0 3-3m-3 3 3 3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  qrCode: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2m2 0h2m-6 3h3m3-1v4m-3 0h2"/>',
  camara: '<path d="M4 7h4l2-2h4l2 2h4v12H4V7Z"/><circle cx="12" cy="13" r="3"/>',
  impresora: '<path d="M6 9V4h12v5M6 18H4V10h16v8h-2M7 15h10v5H7z"/>',
  configuracion: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.2 2.2-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V20.4h-3.1v-.1A1.7 1.7 0 0 0 10.5 18.7a1.7 1.7 0 0 0-1.87.34l-.06.06-2.2-2.2.06-.06A1.7 1.7 0 0 0 6.77 15a1.7 1.7 0 0 0-1.57-1H5.1v-3.1h.1A1.7 1.7 0 0 0 6.77 9.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06 2.2-2.2.06.06a1.7 1.7 0 0 0 1.87.34 1.7 1.7 0 0 0 1.03-1.56V4.5h3.1v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06 2.2 2.2-.06.06a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.57 1h.1V14h-.1A1.7 1.7 0 0 0 19.4 15Z"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
};

function construirIcono(nombre, tam = 20) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] || ''}</svg>`;
}

const NAV = [
  { key: 'dashboard', label: 'Resumen', labelCorto: 'Inicio', href: 'index.html', icon: 'home' },
  { key: 'productos', label: 'Productos', href: 'inventario.html', icon: 'box' },
  { key: 'inventario', label: 'Inventario', labelCorto: 'Stock', href: 'movimientos-stock.html', icon: 'arrowLeftRight' },
  { key: 'ambientes', label: 'Ambientes', href: 'ambientes.html', icon: 'mapPin' },
  { key: 'distribuidores', label: 'Distribuidores', labelCorto: 'Distrib.', href: 'distribuidores.html', icon: 'truck' },
  { key: 'dinero', label: 'Movimientos de dinero', labelCorto: 'Dinero', href: 'movimientos.html', icon: 'cash' },
  { key: 'reportes', label: 'Reportes', href: 'reportes.html', icon: 'chart' },
  { key: 'alertas', label: 'Alertas', href: 'alertas.html', icon: 'alert' },
  { key: 'usuarios', label: 'Usuarios', href: 'usuarios.html', icon: 'users', soloAdmin: true },
];

function construirLayout() {
  const paginaActual = document.body.dataset.page || '';
  const placeholderBusqueda = document.body.dataset.searchPlaceholder || 'Buscar productos, categorías…';

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="logo">
      <img class="logo-icon" src="assets/stokio/isotipo.svg" alt="" width="30" height="34" />
      <span class="logo-text">STOKIO</span>
    </div>
    <ul class="nav-lista">
      ${NAV.map((item) => `
        <li data-solo-admin="${item.soloAdmin ? '1' : ''}" ${item.soloAdmin ? 'hidden' : ''}>
          <a href="${item.href}" class="${item.key === paginaActual ? 'activo' : ''}">
            ${construirIcono(item.icon, 19)}
            <span>${item.label}</span>
          </a>
        </li>
      `).join('')}
    </ul>
    <div class="sidebar-perfil">
      <button type="button" class="usuario" id="botonUsuario">
        <div class="avatar" id="avatarIniciales">…</div>
        <div class="usuario-texto">
          <div class="nombre" id="nombreUsuario">Cargando…</div>
          <div class="rol" id="rolUsuario"></div>
        </div>
        ${construirIcono('chevronDown', 16)}
      </button>
      <div class="usuario-menu" id="menuUsuario" hidden>
        <button type="button" id="botonCerrarSesion">${construirIcono('logout', 16)} Cerrar sesión</button>
      </div>
    </div>
  `;

  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.innerHTML = `
    <label class="buscador">
      ${construirIcono('search', 17)}
      <input type="search" id="buscarGlobal" placeholder="${placeholderBusqueda}" autocomplete="off" />
    </label>
    <div class="topbar-spacer"></div>
    <button type="button" class="icono-boton" id="botonEscanearQr" title="Escanear código">
      ${construirIcono('qrCode', 18)}
    </button>
    <a class="icono-boton" href="alertas.html" title="Alertas">
      ${construirIcono('bell', 18)}
      <span class="punto" id="puntoAlertas"></span>
    </a>
    <a class="icono-boton" href="https://github.com/chaarlyez/inventario-finanzas-sena#readme" target="_blank" rel="noopener" title="Ayuda">
      ${construirIcono('help', 18)}
    </a>
  `;

  const ITEMS_TABBAR = ['dashboard', 'productos', 'inventario', 'dinero'];
  const tabbarMovil = document.createElement('nav');
  tabbarMovil.className = 'tabbar-movil';
  tabbarMovil.innerHTML = NAV.filter((item) => ITEMS_TABBAR.includes(item.key)).map((item) => `
    <a href="${item.href}" class="${item.key === paginaActual ? 'activo' : ''}">
      <span class="tab-icono">${construirIcono(item.icon, 20)}</span>
      <span>${item.labelCorto || item.label}</span>
    </a>
  `).join('') + `
    <button type="button" class="tab-mas" id="botonMasMovil">
      <span class="tab-icono">
        ${construirIcono('menu', 20)}
        <span class="punto" id="puntoAlertasMovil"></span>
      </span>
      <span>Más</span>
    </button>
  `;

  document.body.prepend(tabbarMovil);
  document.body.prepend(topbar);
  document.body.prepend(sidebar);

  document.getElementById('buscarGlobal').addEventListener('input', (e) => {
    if (typeof window.onBuscarGlobal === 'function') window.onBuscarGlobal(e.target.value.trim().toLowerCase());
  });

  document.getElementById('botonMasMovil').addEventListener('click', () => _abrirMenuMas(paginaActual));
  document.getElementById('botonEscanearQr').addEventListener('click', () => window.Layout.abrirEscanerQr());

  const botonUsuario = document.getElementById('botonUsuario');
  const menuUsuario = document.getElementById('menuUsuario');
  botonUsuario.addEventListener('click', (e) => {
    e.stopPropagation();
    menuUsuario.hidden = !menuUsuario.hidden;
  });
  document.addEventListener('click', () => { menuUsuario.hidden = true; });
  document.getElementById('botonCerrarSesion').addEventListener('click', async () => {
    await apiPost('/auth/logout', {}).catch(() => {});
    window.location.href = 'login.html';
  });

  _actualizarPuntoAlertas();
  _cargarUsuarioActual();
}

function _abrirMenuMas(paginaActual) {
  const ITEMS_TABBAR = ['dashboard', 'productos', 'inventario', 'dinero'];
  const resto = NAV.filter((item) => !ITEMS_TABBAR.includes(item.key) && !(item.soloAdmin && !window.Layout.usuarioActual?.esAdmin));
  _abrirModal('Más opciones', `
    <div class="menu-mas-lista">
      ${resto.map((item) => `
        <a href="${item.href}" class="menu-mas-item ${item.key === paginaActual ? 'activo' : ''}">
          ${construirIcono(item.icon, 18)}
          <span>${item.label}</span>
        </a>
      `).join('')}
    </div>
  `);
}

// Trae el usuario de la sesión activa y ajusta la interfaz según su rol.
async function _cargarUsuarioActual() {
  try {
    const usuario = await apiGet('/auth/yo');
    const iniciales = usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('avatarIniciales').textContent = iniciales;
    document.getElementById('nombreUsuario').textContent = usuario.nombre;
    document.getElementById('rolUsuario').textContent = usuario.rol === 'administrador' ? 'Administrador' : 'Colaborador';

    window.Layout.usuarioActual = { ...usuario, esAdmin: usuario.rol === 'administrador' };

    if (usuario.rol !== 'administrador') {
      document.querySelectorAll('[data-solo-admin="1"]').forEach((el) => { el.hidden = true; });
    } else {
      document.querySelectorAll('[data-solo-admin="1"]').forEach((el) => { el.hidden = false; });
    }
  } catch {
    // apiGet ya redirige a login.html si la sesión no es válida.
  }
}

async function _actualizarPuntoAlertas() {
  try {
    const productos = await apiGet('/productos');
    const hayAlertas = productos.some((p) => p.stock_actual <= p.stock_minimo);
    document.getElementById('puntoAlertas')?.classList.toggle('visible', hayAlertas);
    document.getElementById('puntoAlertasMovil')?.classList.toggle('visible', hayAlertas);
  } catch {
    // silencioso: si el API no responde todavía, no rompe el layout
  }
}

// ---------- Modal genérico ----------

let _alCerrarModal = null;

function _abrirModal(tituloHtml, contenidoHtml, opciones = {}) {
  _cerrarModal();
  _alCerrarModal = opciones.onClose || null;
  const overlay = document.createElement('div');
  overlay.className = `overlay-modal ${opciones.claseModal || ''}`;
  overlay.id = 'overlayModal';
  overlay.innerHTML = `
    <div class="modal ${opciones.tipo === 'drawer' ? 'modal-drawer' : ''}">
      <div class="modal-cabecera">
        <h2>${tituloHtml}</h2>
        <button type="button" class="modal-cerrar" aria-label="Cerrar">${construirIcono('close', 20)}</button>
      </div>
      ${contenidoHtml}
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-cerrar').addEventListener('click', _cerrarModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) _cerrarModal(); });
  document.addEventListener('keydown', _escCierraModal);
  return overlay;
}

function _escCierraModal(e) {
  if (e.key === 'Escape') _cerrarModal();
}

function _cerrarModal() {
  const overlay = document.getElementById('overlayModal');
  if (overlay) overlay.remove();
  document.removeEventListener('keydown', _escCierraModal);
  if (_alCerrarModal) {
    const fn = _alCerrarModal;
    _alCerrarModal = null;
    fn();
  }
}

// ---------- Badges ----------

function _badgeEstadoStock(p) {
  if (p.stock_actual <= 0) return { texto: 'Sin stock', clase: 'badge-rojo' };
  if (p.stock_actual <= p.stock_minimo) return { texto: 'Stock bajo', clase: 'badge-amarillo' };
  return { texto: 'En stock', clase: 'badge-verde' };
}

const PALETA_CATEGORIAS = ['badge-morado', 'badge-azul', 'badge-teal', 'badge-naranja', 'badge-verde'];

function _badgeCategoria(categoria) {
  if (!categoria) return '<span class="badge badge-gris">Sin categoría</span>';
  let hash = 0;
  for (let i = 0; i < categoria.length; i++) hash = (hash * 31 + categoria.charCodeAt(i)) >>> 0;
  const clase = PALETA_CATEGORIAS[hash % PALETA_CATEGORIAS.length];
  return `<span class="badge ${clase}">${categoria}</span>`;
}

// ---------- Fechas ----------

function _formatoFechaLarga(fecha) {
  const texto = fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function _formatoFechaCorta(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function _claveDia(fechaIso) {
  return new Date(fechaIso).toISOString().slice(0, 10);
}

// ---------- Gráfico de líneas (entradas vs salidas) ----------

function _renderizarChart(contenedor, dias) {
  // dias: [{ clave: 'YYYY-MM-DD', entradas: N, salidas: N }, ...] ya ordenado
  const hayDatos = dias.some((d) => d.entradas > 0 || d.salidas > 0);
  if (!hayDatos) {
    contenedor.innerHTML = '<p class="chart-vacio">Todavía no hay movimientos de stock esta semana.</p>';
    return;
  }

  const ancho = 600;
  const alto = 220;
  const padI = 34;
  const padD = 10;
  const padA = 14;
  const padB = 26;
  const plotW = ancho - padI - padD;
  const plotH = alto - padA - padB;

  const maxCrudo = Math.max(1, ...dias.map((d) => Math.max(d.entradas, d.salidas)));
  const maxVal = Math.ceil(maxCrudo / 5) * 5 || 5;
  const xStep = dias.length > 1 ? plotW / (dias.length - 1) : 0;

  const puntoX = (i) => padI + i * xStep;
  const puntoY = (v) => padA + plotH - (v / maxVal) * plotH;

  const linea = (campo) => dias.map((d, i) => `${i === 0 ? 'M' : 'L'} ${puntoX(i).toFixed(1)},${puntoY(d[campo]).toFixed(1)}`).join(' ');
  const area = (campo) => `${linea(campo)} L ${puntoX(dias.length - 1).toFixed(1)},${(padA + plotH).toFixed(1)} L ${puntoX(0).toFixed(1)},${(padA + plotH).toFixed(1)} Z`;

  const filasGrid = [0, 0.5, 1].map((frac) => {
    const y = padA + plotH * (1 - frac);
    const valor = Math.round(maxVal * frac);
    return `
      <line x1="${padI}" y1="${y}" x2="${ancho - padD}" y2="${y}" stroke="#ebe9f5" stroke-width="1" />
      <text x="${padI - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#a9a8bd">${valor}</text>
    `;
  }).join('');

  const etiquetasX = dias.map((d, i) => `<text x="${puntoX(i).toFixed(1)}" y="${alto - 6}" text-anchor="middle" font-size="10" fill="#a9a8bd">${d.etiqueta}</text>`).join('');

  contenedor.innerHTML = `
    <svg viewBox="0 0 ${ancho} ${alto}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6d28d9" stop-opacity="0.24" />
          <stop offset="100%" stop-color="#6d28d9" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="gradSalidas" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0891b2" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#0891b2" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${filasGrid}
      <path d="${area('salidas')}" fill="url(#gradSalidas)" stroke="none" />
      <path d="${area('entradas')}" fill="url(#gradEntradas)" stroke="none" />
      <path d="${linea('salidas')}" fill="none" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${linea('entradas')}" fill="none" stroke="#6d28d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      ${etiquetasX}
    </svg>
  `;
}

// ---------- Grafico de dona: estado del inventario ----------

// Estados reales del modelo de datos (stock), no los de activos que
// describe la guia: aqui un producto esta en stock, bajo minimo o agotado.
const ESTADOS_STOCK = [
  { clave: 'en_stock', nombre: 'En stock', color: '#16a34a' },
  { clave: 'bajo', nombre: 'Stock bajo', color: '#d97706' },
  { clave: 'agotado', nombre: 'Sin stock', color: '#dc2626' },
];

function _clasificarStock(p) {
  if (p.stock_actual <= 0) return 'agotado';
  if (p.stock_actual <= p.stock_minimo) return 'bajo';
  return 'en_stock';
}

function _renderizarDona(contenedor, productos) {
  const total = productos.length;
  if (!total) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="icono-vacio">${construirIcono('box', 26)}</div>
        <div class="titulo">Aún no hay productos registrados</div>
        <p class="desc">Cuando agregues el primer producto verás aquí cómo se reparte tu inventario.</p>
      </div>`;
    return;
  }

  const conteo = { en_stock: 0, bajo: 0, agotado: 0 };
  productos.forEach((p) => { conteo[_clasificarStock(p)] += 1; });

  const R = 62;          // radio de la linea media del anillo
  const GROSOR = 22;
  const CIRC = 2 * Math.PI * R;
  const SEPARADOR = 2;   // hueco de 2 px entre segmentos, sobre la superficie

  // Segmentos visibles, en el orden fijo de ESTADOS_STOCK (nunca por ranking):
  // el color sigue al estado, no a su posicion en la tabla.
  const visibles = ESTADOS_STOCK.filter((e) => conteo[e.clave] > 0);

  let acumulado = 0;
  const segmentos = visibles.map((e) => {
    const largo = (conteo[e.clave] / total) * CIRC;
    // Con un solo segmento no se dibuja hueco: seria un corte sin sentido.
    const hueco = visibles.length > 1 ? SEPARADOR : 0;
    const visible = Math.max(largo - hueco, 0.6);
    const desfase = -acumulado;
    acumulado += largo;
    return `<circle cx="80" cy="80" r="${R}" fill="none" stroke="${e.color}"
      stroke-width="${GROSOR}" stroke-dasharray="${visible.toFixed(2)} ${(CIRC - visible).toFixed(2)}"
      stroke-dashoffset="${desfase.toFixed(2)}" transform="rotate(-90 80 80)"><title>${e.nombre}: ${conteo[e.clave]} de ${total}</title></circle>`;
  }).join('');

  // La leyenda hace de etiqueta directa de cada segmento. Es obligatoria:
  // el par ambar/verde queda en la banda 6-8 de separacion para daltonismo,
  // que solo es admisible acompanado de nombre y cifra.
  const leyenda = ESTADOS_STOCK.map((e) => {
    const n = conteo[e.clave];
    const pct = (n / total) * 100;
    return `
      <li>
        <span class="punto" style="background:${e.color}"></span>
        <span class="nombre">${e.nombre}</span>
        <span class="cantidad">${_formatoNumero(n)}</span>
        <span class="pct">${_formatoPorcentaje(pct)}</span>
      </li>`;
  }).join('');

  contenedor.innerHTML = `
    <div class="dona-bloque">
      <div class="dona-figura">
        <svg viewBox="0 0 160 160" role="img" aria-label="Distribución de ${total} productos por estado de stock">
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="#f1f0f6" stroke-width="${GROSOR}" />
          ${segmentos}
        </svg>
        <div class="dona-centro">
          <span class="cifra">${_formatoNumero(total)}</span>
          <span class="unidad">producto${total === 1 ? '' : 's'}</span>
        </div>
      </div>
      <ul class="dona-leyenda">${leyenda}</ul>
    </div>`;
}

// ---------- Barras horizontales: inventario por ambiente ----------

function _renderizarBarrasAmbiente(contenedor, ambientes) {
  const conStock = ambientes
    .filter((a) => a.stock_total > 0)
    .sort((a, b) => b.stock_total - a.stock_total)
    .slice(0, 5);

  if (!conStock.length) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="icono-vacio">${construirIcono('mapPin', 26)}</div>
        <div class="titulo">Todavía no hay stock por ambiente</div>
        <p class="desc">Asigna un ambiente a tus productos para ver aquí cómo se distribuyen.</p>
      </div>`;
    return;
  }

  const maximo = conStock[0].stock_total;
  contenedor.innerHTML = `<ul class="barras-ambiente">${conStock.map((a, i) => `
    <li class="barra-item ${i === 0 ? 'lider' : ''}">
      <div class="barra-fila">
        <span class="barra-nombre">${a.nombre}</span>
        <span class="barra-valor">${_formatoNumero(a.stock_total)}</span>
      </div>
      <div class="barra-riel" role="img" aria-label="${a.nombre}: ${a.stock_total} unidades en stock">
        <div class="barra-relleno" style="width:${Math.max((a.stock_total / maximo) * 100, 2).toFixed(1)}%"></div>
      </div>
    </li>`).join('')}</ul>`;
}

// ---------- Formato de numeros y tiempo ----------

// Guia §17: separador de miles en espanol -> 1.248
function _formatoNumero(n) {
  return Number(n || 0).toLocaleString('es-CO');
}

function _formatoPorcentaje(n) {
  return `${Number(n).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function _tiempoRelativo(fechaIso) {
  const minutos = Math.round((Date.now() - new Date(fechaIso).getTime()) / 60000);
  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return 'Ayer';
  if (dias < 30) return `Hace ${dias} días`;
  return _formatoFechaCorta(fechaIso);
}

function _debounce(fn, espera = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), espera);
  };
}

// ---------- Movimientos de stock (entrada/salida/venta) reutilizables ----------
// Usados desde Productos, Inventario y el detalle de producto, para no repetir
// la misma lógica de formulario en cada página.

async function _abrirModalMovimiento({ productoId, tipo, onExito } = {}) {
  const productos = await apiGet('/productos');
  const opciones = productos.map((p) => `<option value="${p.id}" ${p.id === productoId ? 'selected' : ''}>${p.nombre} (stock: ${p.stock_actual})</option>`).join('');

  const overlay = _abrirModal('Registrar movimiento de stock', `
    <form id="formMovimiento">
      <label class="campo">Producto
        <select name="producto_id" required>${opciones}</select>
      </label>
      <div class="fila-campos">
        <label class="campo">Tipo
          <select name="tipo" required>
            <option value="entrada" ${tipo === 'entrada' ? 'selected' : ''}>Entrada</option>
            <option value="salida" ${tipo === 'salida' ? 'selected' : ''}>Salida</option>
          </select>
        </label>
        <label class="campo">Cantidad
          <input name="cantidad" type="number" min="1" step="1" required />
        </label>
      </div>
      <label class="campo">Motivo
        <input name="motivo" placeholder="ej. compra, venta, ajuste" />
      </label>
      <p class="mensaje error" id="mensajeModal"></p>
      <div class="modal-acciones">
        <button type="button" class="btn btn-secundario" id="btnCancelarModal">Cancelar</button>
        <button type="submit" class="btn btn-primario">Registrar</button>
      </div>
    </form>
  `);

  overlay.querySelector('#btnCancelarModal').addEventListener('click', _cerrarModal);
  overlay.querySelector('#formMovimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    try {
      await apiPost('/movimientos-inventario', {
        producto_id: Number(datos.producto_id),
        tipo: datos.tipo,
        cantidad: Number(datos.cantidad),
        motivo: datos.motivo || null,
      });
      _cerrarModal();
      if (onExito) onExito();
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
}

async function _abrirModalVenta({ productoId, onExito } = {}) {
  const productos = await apiGet('/productos');
  if (productos.length === 0) return;

  const productoInicial = productos.find((p) => p.id === productoId) || productos[0];
  const opciones = productos.map((p) => `<option value="${p.id}" data-precio="${p.precio_venta}" ${p.id === productoInicial.id ? 'selected' : ''}>${p.nombre} (stock: ${p.stock_actual})</option>`).join('');

  const overlay = _abrirModal('Registrar venta', `
    <form id="formVenta">
      <label class="campo">Producto
        <select name="producto_id" id="selectProductoVenta" required>${opciones}</select>
      </label>
      <div class="fila-campos">
        <label class="campo">Cantidad
          <input name="cantidad" type="number" min="1" step="1" value="1" required />
        </label>
        <label class="campo">Precio unitario
          <input name="precio_unitario" type="number" min="0" step="1" value="${productoInicial.precio_venta}" required />
        </label>
      </div>
      <label class="campo">Nota (opcional)
        <input name="descripcion" placeholder="ej. venta por Instagram" />
      </label>
      <p style="margin: 0 0 0.85rem; font-size: 0.9rem;">Total: <strong id="totalVenta">${formatoMoneda(productoInicial.precio_venta)}</strong></p>
      <p class="mensaje error" id="mensajeModal"></p>
      <div class="modal-acciones">
        <button type="button" class="btn btn-secundario" id="btnCancelarModal">Cancelar</button>
        <button type="submit" class="btn btn-primario">Registrar venta</button>
      </div>
    </form>
  `);

  const campoCantidad = overlay.querySelector('[name=cantidad]');
  const campoPrecio = overlay.querySelector('[name=precio_unitario]');
  const totalEl = overlay.querySelector('#totalVenta');
  const actualizarTotal = () => { totalEl.textContent = formatoMoneda(Number(campoCantidad.value || 0) * Number(campoPrecio.value || 0)); };
  campoCantidad.addEventListener('input', actualizarTotal);
  campoPrecio.addEventListener('input', actualizarTotal);
  overlay.querySelector('#selectProductoVenta').addEventListener('change', (e) => {
    campoPrecio.value = e.target.selectedOptions[0].dataset.precio;
    actualizarTotal();
  });

  overlay.querySelector('#btnCancelarModal').addEventListener('click', _cerrarModal);
  overlay.querySelector('#formVenta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    try {
      await apiPost('/ventas', {
        producto_id: Number(datos.producto_id),
        cantidad: Number(datos.cantidad),
        precio_unitario: Number(datos.precio_unitario),
        descripcion: datos.descripcion || null,
      });
      _cerrarModal();
      if (onExito) onExito();
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
}

// ---------- Detalle de producto (drawer) ----------

async function _abrirDetalleProducto(productoId, { onExito } = {}) {
  const [producto, movimientos] = await Promise.all([
    apiGet(`/productos/${productoId}`),
    apiGet('/movimientos-inventario'),
  ]);

  const historial = movimientos.filter((m) => m.producto_id === productoId).slice(0, 8);
  const estado = _badgeEstadoStock(producto);

  const overlay = _abrirModal(producto.nombre, `
    <p class="detalle-subtitulo">
      <code>${producto.sku || 'sin SKU'}</code> · ${producto.categoria || 'Sin categoría'} ·
      <span class="badge ${estado.clase}">${estado.texto}</span>
    </p>

    <div class="detalle-acciones">
      <button type="button" class="btn btn-primario" data-accion="vender">${construirIcono('cash', 15)} Vender</button>
      <button type="button" class="btn btn-secundario" data-accion="entrada">${construirIcono('entrada', 15)} Entrada</button>
      <button type="button" class="btn btn-secundario" data-accion="salida">${construirIcono('salida', 15)} Salida</button>
      <button type="button" class="btn btn-secundario" data-accion="editar">${construirIcono('pencil', 15)} Editar</button>
    </div>

    <div class="detalle-specs">
      <div><span>Costo unitario</span><strong>${formatoMoneda(producto.costo_unitario)}</strong></div>
      <div><span>Precio de venta</span><strong>${formatoMoneda(producto.precio_venta)}</strong></div>
      <div><span>Stock actual</span><strong>${producto.stock_actual}</strong></div>
      <div><span>Stock mínimo</span><strong>${producto.stock_minimo}</strong></div>
      <div><span>Ambiente</span><strong>${producto.ambiente_nombre || '—'}</strong></div>
      <div><span>Distribuidor</span><strong>${producto.distribuidor_nombre || '—'}</strong></div>
    </div>

    <h3 class="detalle-seccion">Código interno</h3>
    <div class="detalle-codigo">
      <code>${producto.sku || '—'}</code>
      ${producto.sku ? `<button type="button" class="btn-icono" id="btnCopiarSku" title="Copiar código">${construirIcono('externalLink', 14)}</button>` : ''}
    </div>

    <h3 class="detalle-seccion">Movimientos recientes</h3>
    <div class="detalle-timeline">
      ${historial.length ? historial.map((m) => `
        <div class="detalle-timeline-item">
          <span class="punto ${m.tipo === 'entrada' ? 'punto-verde' : 'punto-rojo'}"></span>
          <div>
            <div class="titulo">${m.tipo === 'entrada' ? 'Entrada' : 'Salida'} de ${m.cantidad} unidad${m.cantidad === 1 ? '' : 'es'} ${m.motivo ? `· ${m.motivo}` : ''}</div>
            <div class="fecha">${new Date(m.fecha).toLocaleString('es-CO')}</div>
          </div>
        </div>
      `).join('') : '<p class="sin-alertas">Todavía no hay movimientos para este producto.</p>'}
    </div>
  `);

  overlay.querySelector('[data-accion=vender]').addEventListener('click', () => _abrirModalVenta({ productoId, onExito }));
  overlay.querySelector('[data-accion=entrada]').addEventListener('click', () => _abrirModalMovimiento({ productoId, tipo: 'entrada', onExito }));
  overlay.querySelector('[data-accion=salida]').addEventListener('click', () => _abrirModalMovimiento({ productoId, tipo: 'salida', onExito }));
  overlay.querySelector('[data-accion=editar]').addEventListener('click', () => {
    window.location.href = `inventario.html?editar=${productoId}`;
  });
  overlay.querySelector('#btnCopiarSku')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(producto.sku);
    } catch {
      // clipboard puede no estar disponible (ej. sin HTTPS); no es crítico
    }
  });
}

// ---------- Escáner de código (cámara con BarcodeDetector, o manual) ----------

async function _abrirEscanerQr() {
  const soportaDeteccion = 'BarcodeDetector' in window;

  const overlay = _abrirModal('Escanear código', `
    <p class="mensaje">Ubica el código del producto dentro del recuadro, o ingrésalo manualmente.</p>
    ${soportaDeteccion ? `
      <div class="escaner-camara">
        <video id="videoEscaner" autoplay playsinline muted></video>
        <div class="escaner-marco"></div>
      </div>
      <p class="mensaje" id="mensajeCamara"></p>
    ` : '<p class="mensaje error">Tu navegador no soporta escaneo por cámara. Ingresa el código manualmente.</p>'}
    <form id="formCodigoManual" class="escaner-manual">
      <label class="campo">Código del producto (SKU)
        <input name="codigo" placeholder="ej. CAM-CLA-001" autofocus />
      </label>
      <button type="submit" class="btn btn-primario">Buscar</button>
    </form>
    <p class="mensaje error" id="mensajeEscaner"></p>
  `, { onClose: () => _detenerCamaraEscaner() });

  const buscarPorCodigo = async (codigo) => {
    const texto = codigo.trim().toLowerCase();
    if (!texto) return;
    const productos = await apiGet('/productos');
    const encontrado = productos.find((p) => (p.sku || '').toLowerCase() === texto);
    if (!encontrado) {
      overlay.querySelector('#mensajeEscaner').textContent = `No se encontró ningún producto con el código "${codigo}".`;
      return;
    }
    _detenerCamaraEscaner();
    _cerrarModal();
    _abrirDetalleProducto(encontrado.id);
  };

  overlay.querySelector('#formCodigoManual').addEventListener('submit', (e) => {
    e.preventDefault();
    buscarPorCodigo(new FormData(e.target).get('codigo'));
  });

  if (soportaDeteccion) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      _streamCamaraActivo = stream;
      const video = overlay.querySelector('#videoEscaner');
      video.srcObject = stream;
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

      const bucle = async () => {
        if (!_streamCamaraActivo) return;
        try {
          const codigos = await detector.detect(video);
          if (codigos.length > 0) {
            buscarPorCodigo(codigos[0].rawValue);
            return;
          }
        } catch {
          // frame no decodificable todavía, seguimos intentando
        }
        _rafEscaner = requestAnimationFrame(bucle);
      };
      _rafEscaner = requestAnimationFrame(bucle);
    } catch {
      const mensajeCamara = overlay.querySelector('#mensajeCamara');
      if (mensajeCamara) mensajeCamara.textContent = 'No se pudo acceder a la cámara. Usa el código manual.';
    }
  }
}

let _streamCamaraActivo = null;
let _rafEscaner = null;

function _detenerCamaraEscaner() {
  if (_rafEscaner) cancelAnimationFrame(_rafEscaner);
  _rafEscaner = null;
  if (_streamCamaraActivo) {
    _streamCamaraActivo.getTracks().forEach((t) => t.stop());
    _streamCamaraActivo = null;
  }
}

window.Layout = {
  icono: construirIcono,
  abrirModal: _abrirModal,
  cerrarModal: _cerrarModal,
  badgeEstadoStock: _badgeEstadoStock,
  badgeCategoria: _badgeCategoria,
  formatoFechaLarga: _formatoFechaLarga,
  formatoFechaCorta: _formatoFechaCorta,
  claveDia: _claveDia,
  renderizarChart: _renderizarChart,
  renderizarDona: _renderizarDona,
  renderizarBarrasAmbiente: _renderizarBarrasAmbiente,
  clasificarStock: _clasificarStock,
  formatoNumero: _formatoNumero,
  formatoPorcentaje: _formatoPorcentaje,
  tiempoRelativo: _tiempoRelativo,
  debounce: _debounce,
  abrirModalMovimiento: _abrirModalMovimiento,
  abrirModalVenta: _abrirModalVenta,
  abrirDetalleProducto: _abrirDetalleProducto,
  abrirEscanerQr: _abrirEscanerQr,
};

construirLayout();
