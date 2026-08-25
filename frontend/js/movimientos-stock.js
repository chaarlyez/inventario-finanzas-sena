const { icono, debounce, abrirModalMovimiento, abrirModalVenta } = window.Layout;

let productosCache = [];
let movimientosCache = [];
let textoBusqueda = '';

document.querySelector('.icono-circulo.morado').innerHTML = icono('box', 20);
document.querySelector('.icono-circulo.azul').innerHTML = icono('entrada', 20);
document.querySelector('.icono-circulo.naranja').innerHTML = icono('salida', 20);
document.querySelector('.icono-circulo.verde').innerHTML = icono('cash', 20);

function mostrarMensaje(texto, tipo = '') {
  const el = document.getElementById('mensajeGlobal');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  if (texto) setTimeout(() => { if (el.textContent === texto) el.textContent = ''; }, 4000);
}

async function recargar() {
  await cargarTodo();
  mostrarMensaje('Listo.', 'exito');
}

function poblarFiltroProducto() {
  const select = document.getElementById('filtroProducto');
  const actual = select.value;
  select.innerHTML = '<option value="">Todos los productos</option>' +
    productosCache.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('');
  if (actual) select.value = actual;
}

function calcularStats() {
  document.getElementById('statStockTotal').textContent = productosCache.reduce((acc, p) => acc + p.stock_actual, 0);

  const hace30Dias = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const enUltimos30 = (m) => new Date(m.fecha).getTime() >= hace30Dias;

  const entradas30 = movimientosCache.filter((m) => m.tipo === 'entrada' && enUltimos30(m)).reduce((acc, m) => acc + m.cantidad, 0);
  const salidas30 = movimientosCache.filter((m) => m.tipo === 'salida' && enUltimos30(m)).reduce((acc, m) => acc + m.cantidad, 0);
  const ventas30 = movimientosCache.filter((m) => m.tipo === 'salida' && m.motivo === 'venta' && enUltimos30(m)).length;

  document.getElementById('statEntradas30').textContent = entradas30;
  document.getElementById('statSalidas30').textContent = salidas30;
  document.getElementById('statVentas30').textContent = ventas30;
}

function aplicarFiltros() {
  const productoId = document.getElementById('filtroProducto').value;
  const tipo = document.getElementById('filtroTipo').value;

  const filtrados = movimientosCache.filter((m) => {
    if (productoId && String(m.producto_id) !== productoId) return false;
    if (tipo && m.tipo !== tipo) return false;
    if (textoBusqueda) {
      const texto = `${m.producto_nombre} ${m.motivo || ''}`.toLowerCase();
      if (!texto.includes(textoBusqueda)) return false;
    }
    return true;
  });

  renderTabla(filtrados);
}

function renderTabla(lista) {
  const tbody = document.getElementById('tablaHistorial');
  tbody.innerHTML = lista.length
    ? lista.map((m) => `
        <tr>
          <td>${new Date(m.fecha).toLocaleString('es-CO')}</td>
          <td>${m.producto_nombre}</td>
          <td><span class="badge ${m.tipo === 'entrada' ? 'badge-verde' : 'badge-rojo'}">${m.tipo === 'entrada' ? 'Entrada' : 'Salida'}</span></td>
          <td>${m.cantidad}</td>
          <td>${m.motivo || '—'}</td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="5">Ningún movimiento coincide con el filtro.</td></tr>';
}

async function cargarTodo() {
  const [productos, movimientos] = await Promise.all([
    apiGet('/productos'),
    apiGet('/movimientos-inventario'),
  ]);
  productosCache = productos;
  movimientosCache = [...movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id);
  poblarFiltroProducto();
  calcularStats();
  aplicarFiltros();
}

document.getElementById('btnRegistrarMovimiento').innerHTML = `${icono('arrowLeftRight', 17)} Registrar movimiento`;
document.getElementById('btnRegistrarMovimiento').addEventListener('click', () => abrirModalMovimiento({ onExito: recargar }));
document.getElementById('btnRegistrarVenta').innerHTML = `${icono('cash', 17)} Registrar venta`;
document.getElementById('btnRegistrarVenta').addEventListener('click', () => abrirModalVenta({ onExito: recargar }));

document.getElementById('filtroProducto').addEventListener('change', aplicarFiltros);
document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);
window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; aplicarFiltros(); }, 150);

cargarTodo();
