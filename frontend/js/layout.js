// Construye el sidebar y la barra superior en todas las páginas, y expone
// utilidades compartidas (iconos, modal, badges, gráfico) en `window.Layout`.

const ICONOS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  cash: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.75c0-1 .9-1.75 2.5-1.75s2.5.7 2.5 1.5c0 2-5 1.25-5 3.25 0 .9 1 1.75 2.5 1.75s2.5-.75 2.5-1.75"/><path d="M12 6.5v11"/>',
  chart: '<path d="M4 19h16"/><path d="M7 19V10"/><path d="M12 19V5"/><path d="M17 19v-7"/>',
  alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.75c0 1.5-2.15 1.85-2.4 3"/><path d="M12 17h.01"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  close: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>',
  trash: '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>',
  entrada: '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
  salida: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  externalLink: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  package: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5"/><path d="M12 21v-8"/>',
};

function construirIcono(nombre, tam = 20) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] || ''}</svg>`;
}

const NAV = [
  { key: 'dashboard', label: 'Dashboard', labelCorto: 'Inicio', href: 'index.html', icon: 'home' },
  { key: 'productos', label: 'Productos', href: 'inventario.html', icon: 'box' },
  { key: 'dinero', label: 'Movimientos de dinero', labelCorto: 'Dinero', href: 'movimientos.html', icon: 'cash' },
  { key: 'reportes', label: 'Reportes', href: 'reportes.html', icon: 'chart' },
  { key: 'alertas', label: 'Alertas', href: 'alertas.html', icon: 'alert' },
];

function construirLayout() {
  const paginaActual = document.body.dataset.page || '';
  const placeholderBusqueda = document.body.dataset.searchPlaceholder || 'Buscar productos, categorías…';

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="logo">
      <span class="logo-icon">${construirIcono('package', 20)}</span>
      <span class="logo-text">INVENTARIO<b>SENA</b></span>
    </div>
    <ul class="nav-lista">
      ${NAV.map((item) => `
        <li>
          <a href="${item.href}" class="${item.key === paginaActual ? 'activo' : ''}">
            ${construirIcono(item.icon, 19)}
            <span>${item.label}</span>
          </a>
        </li>
      `).join('')}
    </ul>
    <div class="sidebar-card">
      <div class="titulo">a lo maldita sea</div>
      <div class="desc">Proyecto SENA de Charly — inventario y finanzas de la marca.</div>
      <a class="enlace" href="https://github.com/chaarlyez/inventario-finanzas-sena" target="_blank" rel="noopener">
        Ver repositorio ${construirIcono('externalLink', 14)}
      </a>
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
    <a class="icono-boton" href="alertas.html" title="Alertas">
      ${construirIcono('bell', 18)}
      <span class="punto" id="puntoAlertas"></span>
    </a>
    <a class="icono-boton" href="https://github.com/chaarlyez/inventario-finanzas-sena#readme" target="_blank" rel="noopener" title="Ayuda">
      ${construirIcono('help', 18)}
    </a>
    <div class="usuario">
      <div class="avatar">CH</div>
      <div class="usuario-texto">
        <div class="nombre">Charly</div>
        <div class="rol">a lo maldita sea</div>
      </div>
    </div>
  `;

  const tabbarMovil = document.createElement('nav');
  tabbarMovil.className = 'tabbar-movil';
  tabbarMovil.innerHTML = NAV.map((item) => `
    <a href="${item.href}" class="${item.key === paginaActual ? 'activo' : ''}">
      <span class="tab-icono">
        ${construirIcono(item.icon, 20)}
        ${item.key === 'alertas' ? '<span class="punto" id="puntoAlertasMovil"></span>' : ''}
      </span>
      <span>${item.labelCorto || item.label}</span>
    </a>
  `).join('');

  document.body.prepend(tabbarMovil);
  document.body.prepend(topbar);
  document.body.prepend(sidebar);

  document.getElementById('buscarGlobal').addEventListener('input', (e) => {
    if (typeof window.onBuscarGlobal === 'function') window.onBuscarGlobal(e.target.value.trim().toLowerCase());
  });

  _actualizarPuntoAlertas();
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

function _abrirModal(tituloHtml, contenidoHtml) {
  _cerrarModal();
  const overlay = document.createElement('div');
  overlay.className = 'overlay-modal';
  overlay.id = 'overlayModal';
  overlay.innerHTML = `
    <div class="modal">
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
}

// ---------- Badges ----------

function _badgeEstadoStock(p) {
  if (p.stock_actual <= 0) return { texto: 'Sin stock', clase: 'badge-rojo' };
  if (p.stock_actual <= p.stock_minimo) return { texto: 'Stock bajo', clase: 'badge-amarillo' };
  return { texto: 'En stock', clase: 'badge-verde' };
}

const PALETA_CATEGORIAS = ['badge-morado', 'badge-azul', 'badge-rosado', 'badge-naranja', 'badge-verde'];

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
          <stop offset="0%" stop-color="#7c5cfc" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#7c5cfc" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="gradSalidas" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ef5da8" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#ef5da8" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${filasGrid}
      <path d="${area('salidas')}" fill="url(#gradSalidas)" stroke="none" />
      <path d="${area('entradas')}" fill="url(#gradEntradas)" stroke="none" />
      <path d="${linea('salidas')}" fill="none" stroke="#ef5da8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${linea('entradas')}" fill="none" stroke="#7c5cfc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${etiquetasX}
    </svg>
  `;
}

function _debounce(fn, espera = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), espera);
  };
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
  debounce: _debounce,
};

construirLayout();
