const { icono, abrirModal, cerrarModal, badgeEstadoStock, badgeCategoria, debounce, abrirModalMovimiento, abrirModalVenta, abrirDetalleProducto } = window.Layout;

let productosCache = [];
let ambientesCache = [];
let distribuidoresCache = [];
let textoBusqueda = '';

function pintarBotonesCabecera() {
  document.getElementById('btnNuevoProducto').innerHTML = `${icono('plus', 17)} Nuevo producto`;
  document.getElementById('btnRegistrarMovimiento').innerHTML = `${icono('entrada', 17)} Registrar movimiento`;
  document.getElementById('btnNuevoProducto').addEventListener('click', () => abrirModalProducto());
  document.getElementById('btnRegistrarMovimiento').addEventListener('click', () => abrirModalMovimiento({ onExito: recargar }));
}

function mostrarMensaje(texto, tipo = '') {
  const el = document.getElementById('mensajeGlobal');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  if (texto) setTimeout(() => { if (el.textContent === texto) el.textContent = ''; }, 4000);
}

// ---------- Carga de datos ----------

async function cargarTodo() {
  const [productos, ambientes, distribuidores] = await Promise.all([
    apiGet('/productos'),
    apiGet('/ambientes'),
    apiGet('/distribuidores'),
  ]);
  productosCache = productos;
  ambientesCache = ambientes;
  distribuidoresCache = distribuidores;
  poblarFiltros();
  aplicarFiltros();
}

async function recargar() {
  await cargarTodo();
  mostrarMensaje('Listo.', 'exito');
}

function poblarFiltros() {
  const selectCategoria = document.getElementById('filtroCategoria');
  const actualCategoria = selectCategoria.value;
  const categorias = [...new Set(productosCache.map((p) => p.categoria).filter(Boolean))].sort();
  selectCategoria.innerHTML = '<option value="">Todas las categorías</option>' +
    categorias.map((c) => `<option value="${c}">${c}</option>`).join('');
  if (categorias.includes(actualCategoria)) selectCategoria.value = actualCategoria;

  const selectAmbiente = document.getElementById('filtroAmbiente');
  const actualAmbiente = selectAmbiente.value;
  selectAmbiente.innerHTML = '<option value="">Todos los ambientes</option>' +
    ambientesCache.map((a) => `<option value="${a.id}">${a.nombre}</option>`).join('');
  if (actualAmbiente) selectAmbiente.value = actualAmbiente;
}

function estadoDe(p) {
  if (p.stock_actual <= 0) return 'sin_stock';
  if (p.stock_actual <= p.stock_minimo) return 'stock_bajo';
  return 'en_stock';
}

function aplicarFiltros() {
  const categoria = document.getElementById('filtroCategoria').value;
  const ambienteId = document.getElementById('filtroAmbiente').value;
  const estado = document.getElementById('filtroEstado').value;

  const filtrados = productosCache.filter((p) => {
    if (categoria && p.categoria !== categoria) return false;
    if (ambienteId && String(p.ambiente_id) !== ambienteId) return false;
    if (estado && estadoDe(p) !== estado) return false;
    if (textoBusqueda) {
      const texto = `${p.nombre} ${p.categoria || ''} ${p.sku || ''}`.toLowerCase();
      if (!texto.includes(textoBusqueda)) return false;
    }
    return true;
  });

  renderTablaProductos(filtrados);
}

function renderTablaProductos(lista) {
  const tbody = document.getElementById('tablaProductos');
  tbody.innerHTML = lista.length
    ? lista.map((p) => {
        const estado = badgeEstadoStock(p);
        return `
          <tr data-fila="${p.id}">
            <td>
              <div class="celda-producto">
                <div class="icono-producto">${icono('box', 17)}</div>
                <div>
                  <div class="nombre">${p.nombre}</div>
                  <div class="sku">SKU: ${p.sku || '—'}</div>
                </div>
              </div>
            </td>
            <td>${badgeCategoria(p.categoria)}</td>
            <td>${p.ambiente_nombre || '—'}</td>
            <td>${formatoMoneda(p.costo_unitario)}</td>
            <td>${formatoMoneda(p.precio_venta)}</td>
            <td>${p.stock_actual}</td>
            <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
            <td>
              <div class="acciones-fila">
                <button type="button" class="btn-icono" title="Ver detalle" data-detalle="${p.id}">${icono('externalLink', 15)}</button>
                <button type="button" class="btn-icono" title="Registrar venta" data-vender="${p.id}">${icono('cash', 15)}</button>
                <button type="button" class="btn-icono" title="Editar" data-editar="${p.id}">${icono('pencil', 15)}</button>
                <button type="button" class="btn-icono peligro" title="Eliminar" data-eliminar="${p.id}">${icono('trash', 15)}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="8">Ningún producto coincide con el filtro.</td></tr>';

  tbody.querySelectorAll('[data-editar]').forEach((btn) => btn.addEventListener('click', () => {
    const p = productosCache.find((x) => x.id === Number(btn.dataset.editar));
    abrirModalProducto(p);
  }));
  tbody.querySelectorAll('[data-eliminar]').forEach((btn) => btn.addEventListener('click', () => eliminarProducto(Number(btn.dataset.eliminar))));
  tbody.querySelectorAll('[data-vender]').forEach((btn) => btn.addEventListener('click', () => abrirModalVenta({ productoId: Number(btn.dataset.vender), onExito: recargar })));
  tbody.querySelectorAll('[data-detalle]').forEach((btn) => btn.addEventListener('click', () => abrirDetalleProducto(Number(btn.dataset.detalle), { onExito: recargar })));
}

// ---------- Modal: nuevo / editar producto ----------

function abrirModalProducto(producto = null) {
  const esEdicion = Boolean(producto);
  const opcionesAmbiente = ambientesCache.map((a) => `<option value="${a.id}" ${producto?.ambiente_id === a.id ? 'selected' : ''}>${a.nombre}</option>`).join('');
  const opcionesDistribuidor = distribuidoresCache.map((d) => `<option value="${d.id}" ${producto?.distribuidor_id === d.id ? 'selected' : ''}>${d.nombre}</option>`).join('');

  const overlay = abrirModal(esEdicion ? 'Editar producto' : 'Nuevo producto', `
    <form id="formProducto">
      <label class="campo">Nombre
        <input name="nombre" required value="${producto?.nombre ?? ''}" />
      </label>
      <div class="fila-campos">
        <label class="campo">Categoría
          <input name="categoria" value="${producto?.categoria ?? ''}" />
        </label>
        <label class="campo">SKU
          <input name="sku" value="${producto?.sku ?? ''}" />
        </label>
      </div>
      <div class="fila-campos">
        <label class="campo">Costo unitario
          <input name="costo_unitario" type="number" min="0" step="1" required value="${producto?.costo_unitario ?? ''}" />
        </label>
        <label class="campo">Precio de venta
          <input name="precio_venta" type="number" min="0" step="1" required value="${producto?.precio_venta ?? ''}" />
        </label>
      </div>
      <div class="fila-campos">
        <label class="campo">Stock ${esEdicion ? 'actual' : 'inicial'}
          <input name="stock_actual" type="number" min="0" step="1" value="${producto?.stock_actual ?? 0}" ${esEdicion ? 'title="Para ajustar el stock usa Registrar movimiento" readonly' : ''} />
        </label>
        <label class="campo">Stock mínimo
          <input name="stock_minimo" type="number" min="0" step="1" value="${producto?.stock_minimo ?? 0}" />
        </label>
      </div>
      <div class="fila-campos">
        <label class="campo">Ambiente
          <select name="ambiente_id"><option value="">— Ninguno —</option>${opcionesAmbiente}</select>
        </label>
        <label class="campo">Distribuidor
          <select name="distribuidor_id"><option value="">— Ninguno —</option>${opcionesDistribuidor}</select>
        </label>
      </div>
      <p class="mensaje error" id="mensajeModal"></p>
      <div class="modal-acciones">
        <button type="button" class="btn btn-secundario" id="btnCancelarModal">Cancelar</button>
        <button type="submit" class="btn btn-primario">${esEdicion ? 'Guardar cambios' : 'Crear producto'}</button>
      </div>
    </form>
  `);

  overlay.querySelector('#btnCancelarModal').addEventListener('click', cerrarModal);
  overlay.querySelector('#formProducto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    const cuerpo = {
      nombre: datos.nombre,
      categoria: datos.categoria || null,
      sku: datos.sku || null,
      costo_unitario: Number(datos.costo_unitario),
      precio_venta: Number(datos.precio_venta),
      stock_minimo: Number(datos.stock_minimo || 0),
      ambiente_id: datos.ambiente_id ? Number(datos.ambiente_id) : null,
      distribuidor_id: datos.distribuidor_id ? Number(datos.distribuidor_id) : null,
    };
    if (!esEdicion) cuerpo.stock_actual = Number(datos.stock_actual || 0);

    try {
      if (esEdicion) {
        await apiPut(`/productos/${producto.id}`, cuerpo);
      } else {
        await apiPost('/productos', cuerpo);
      }
      cerrarModal();
      mostrarMensaje(esEdicion ? 'Producto actualizado.' : 'Producto creado.', 'exito');
      await cargarTodo();
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
}

async function eliminarProducto(id) {
  const producto = productosCache.find((p) => p.id === id);
  if (!producto) return;
  if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

  try {
    await apiDelete(`/productos/${id}`);
    mostrarMensaje('Producto eliminado.', 'exito');
    await cargarTodo();
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
}

// ---------- Query params (accesos rápidos desde el Dashboard) ----------

async function manejarQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('nuevo')) {
    abrirModalProducto();
  } else if (params.has('editar')) {
    const id = Number(params.get('editar'));
    const producto = productosCache.find((p) => p.id === id);
    if (producto) abrirModalProducto(producto);
  } else if (params.has('movimiento')) {
    const tipo = params.get('movimiento');
    const productoId = params.has('producto') ? Number(params.get('producto')) : undefined;
    abrirModalMovimiento({ tipo: tipo === 'salida' ? 'salida' : 'entrada', productoId, onExito: recargar });
  } else if (params.has('venta')) {
    const productoId = params.has('producto') ? Number(params.get('producto')) : undefined;
    abrirModalVenta({ productoId, onExito: recargar });
  }
  if (params.toString()) window.history.replaceState({}, '', window.location.pathname);
}

// ---------- Wiring ----------

document.getElementById('filtroCategoria').addEventListener('change', aplicarFiltros);
document.getElementById('filtroAmbiente').addEventListener('change', aplicarFiltros);
document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; aplicarFiltros(); }, 150);

pintarBotonesCabecera();
cargarTodo().then(manejarQueryParams);
