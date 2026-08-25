const { icono, badgeCategoria, debounce } = window.Layout;

let productosCache = [];
let textoBusqueda = '';

function filtrarTexto(lista) {
  if (!textoBusqueda) return lista;
  return lista.filter((p) => `${p.nombre} ${p.categoria || ''}`.toLowerCase().includes(textoBusqueda));
}

function render() {
  const sinStock = filtrarTexto(productosCache.filter((p) => p.stock_actual <= 0));
  const stockBajo = filtrarTexto(productosCache.filter((p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo));

  const tbodySin = document.getElementById('tablaSinStock');
  tbodySin.innerHTML = sinStock.length
    ? sinStock.map((p) => `
        <tr>
          <td>
            <div class="celda-producto">
              <div class="icono-producto">${icono('box', 17)}</div>
              <div><div class="nombre">${p.nombre}</div><div class="sku">SKU: ${p.sku || '—'}</div></div>
            </div>
          </td>
          <td>${badgeCategoria(p.categoria)}</td>
          <td>${p.stock_minimo}</td>
          <td><a class="btn btn-secundario" href="inventario.html?movimiento=entrada&producto=${p.id}">${icono('entrada', 15)} Registrar entrada</a></td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="4">Ningún producto sin stock. 🎉</td></tr>';

  const tbodyBajo = document.getElementById('tablaStockBajo');
  tbodyBajo.innerHTML = stockBajo.length
    ? stockBajo.map((p) => `
        <tr>
          <td>
            <div class="celda-producto">
              <div class="icono-producto">${icono('box', 17)}</div>
              <div><div class="nombre">${p.nombre}</div><div class="sku">SKU: ${p.sku || '—'}</div></div>
            </div>
          </td>
          <td>${badgeCategoria(p.categoria)}</td>
          <td>${p.stock_actual}</td>
          <td>${p.stock_minimo}</td>
          <td><a class="btn btn-secundario" href="inventario.html?movimiento=entrada&producto=${p.id}">${icono('entrada', 15)} Registrar entrada</a></td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="5">Ningún producto con stock bajo. 🎉</td></tr>';
}

async function cargar() {
  productosCache = await apiGet('/productos');
  render();
}

window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; render(); }, 150);

cargar();
