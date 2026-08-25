const { icono, debounce } = window.Layout;

let filasCache = [];
let textoBusqueda = '';

document.querySelector('.icono-circulo.verde').innerHTML = icono('cash', 20);
document.querySelector('.icono-circulo.rojo').innerHTML = icono('cash', 20);
document.querySelector('.icono-circulo.morado').innerHTML = icono('chart', 20);
document.querySelector('.icono-circulo.azul').innerHTML = icono('box', 20);

async function cargarResumen() {
  const resumen = await apiGet('/reportes/resumen');
  document.getElementById('resIngresos').textContent = formatoMoneda(resumen.ingresos_totales);
  document.getElementById('resEgresos').textContent = formatoMoneda(resumen.egresos_totales);
  const balanceEl = document.getElementById('resBalance');
  balanceEl.textContent = formatoMoneda(resumen.balance);
  balanceEl.classList.toggle('valor-positivo', resumen.balance >= 0);
  balanceEl.classList.toggle('valor-negativo', resumen.balance < 0);
  document.getElementById('resValorInventario').textContent = formatoMoneda(resumen.valor_inventario_actual);
}

function badgeMargen(pct) {
  if (pct == null) return '<span class="badge badge-gris">—</span>';
  if (pct >= 30) return `<span class="badge badge-verde">${pct.toFixed(1)}%</span>`;
  if (pct >= 10) return `<span class="badge badge-amarillo">${pct.toFixed(1)}%</span>`;
  return `<span class="badge badge-rojo">${pct.toFixed(1)}%</span>`;
}

function aplicarFiltro() {
  const filtradas = textoBusqueda
    ? filasCache.filter((f) => f.nombre.toLowerCase().includes(textoBusqueda))
    : filasCache;
  renderTabla(filtradas);
}

function renderTabla(filas) {
  const tbody = document.getElementById('tablaRentabilidad');
  tbody.innerHTML = filas.length
    ? filas.map((f) => `
        <tr>
          <td>${f.nombre}</td>
          <td>${f.unidades_vendidas}</td>
          <td>${formatoMoneda(f.ingresos)}</td>
          <td>${formatoMoneda(f.costo_vendido)}</td>
          <td class="${f.utilidad >= 0 ? 'valor-positivo' : 'valor-negativo'}">${formatoMoneda(f.utilidad)}</td>
          <td>${badgeMargen(f.margen_porcentaje)}</td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="6">Todavía no hay productos.</td></tr>';
}

async function cargarRentabilidad() {
  filasCache = await apiGet('/reportes/rentabilidad');
  aplicarFiltro();
}

window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; aplicarFiltro(); }, 150);

cargarResumen();
cargarRentabilidad();
