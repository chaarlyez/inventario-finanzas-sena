const { icono, abrirModal, cerrarModal, badgeEstadoStock, badgeCategoria, debounce } = window.Layout;

let productosCache = [];
let movimientosCache = [];
let textoBusqueda = '';

function pintarBotonesCabecera() {
  document.getElementById('btnNuevoProducto').innerHTML = `${icono('plus', 17)} Nuevo producto`;
  document.getElementById('btnRegistrarMovimiento').innerHTML = `${icono('entrada', 17)} Registrar movimiento`;
  document.getElementById('btnNuevoProducto').addEventListener('click', () => abrirModalProducto());
  document.getElementById('btnRegistrarMovimiento').addEventListener('click', () => abrirModalMovimiento());
}

function mostrarMensaje(texto, tipo = '') {
  const el = document.getElementById('mensajeGlobal');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  if (texto) setTimeout(() => { if (el.textContent === texto) el.textContent = ''; }, 4000);
}

// ---------- Carga de datos ----------

async function cargarTodo() {
  const [productos, movimientos] = await Promise.all([
    apiGet('/productos'),
    apiGet('/movimientos-inventario'),
  ]);
  productosCache = productos;
  movimientosCache = movimientos;
  poblarFiltroCategorias();
  aplicarFiltros();
  renderHistorial();
}

function poblarFiltroCategorias() {
  const select = document.getElementById('filtroCategoria');
  const actual = select.value;
  const categorias = [...new Set(productosCache.map((p) => p.categoria).filter(Boolean))].sort();
  select.innerHTML = '<option value="">Todas las categorías</option>' +
    categorias.map((c) => `<option value="${c}">${c}</option>`).join('');
  if (categorias.includes(actual)) select.value = actual;
}

function estadoDe(p) {
  if (p.stock_actual <= 0) return 'sin_stock';
  if (p.stock_actual <= p.stock_minimo) return 'stock_bajo';
  return 'en_stock';
}

function aplicarFiltros() {
  const categoria = document.getElementById('filtroCategoria').value;
  const estado = document.getElementById('filtroEstado').value;

  const filtrados = productosCache.filter((p) => {
    if (categoria && p.categoria !== categoria) return false;
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
          <tr>
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
            <td>${formatoMoneda(p.costo_unitario)}</td>
            <td>${formatoMoneda(p.precio_venta)}</td>
            <td>${p.stock_actual}</td>
            <td>${p.stock_minimo}</td>
            <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
            <td>
              <div class="acciones-fila">
                <button type="button" class="btn-icono" title="Registrar venta" data-vender="${p.id}">${icono('cash', 15)}</button>
                <button type="button" class="btn-icono" title="Registrar entrada" data-entrada="${p.id}">${icono('entrada', 15)}</button>
                <button type="button" class="btn-icono" title="Registrar salida (pérdida, ajuste...)" data-salida="${p.id}">${icono('salida', 15)}</button>
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
  tbody.querySelectorAll('[data-entrada]').forEach((btn) => btn.addEventListener('click', () => abrirModalMovimiento({ productoId: Number(btn.dataset.entrada), tipo: 'entrada' })));
  tbody.querySelectorAll('[data-salida]').forEach((btn) => btn.addEventListener('click', () => abrirModalMovimiento({ productoId: Number(btn.dataset.salida), tipo: 'salida' })));
  tbody.querySelectorAll('[data-vender]').forEach((btn) => btn.addEventListener('click', () => abrirModalVenta({ productoId: Number(btn.dataset.vender) })));
}

function renderHistorial() {
  const tbody = document.getElementById('tablaHistorial');
  const recientes = [...movimientosCache]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id)
    .slice(0, 30);

  tbody.innerHTML = recientes.length
    ? recientes.map((m) => `
        <tr>
          <td>${new Date(m.fecha).toLocaleString('es-CO')}</td>
          <td>${m.producto_nombre}</td>
          <td><span class="badge ${m.tipo === 'entrada' ? 'badge-verde' : 'badge-rojo'}">${m.tipo === 'entrada' ? 'Entrada' : 'Salida'}</span></td>
          <td>${m.cantidad}</td>
          <td>${m.motivo || '—'}</td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="5">Todavía no hay movimientos de stock.</td></tr>';
}

// ---------- Modal: nuevo / editar producto ----------

function abrirModalProducto(producto = null) {
  const esEdicion = Boolean(producto);
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

// ---------- Modal: registrar movimiento de stock ----------

function abrirModalMovimiento({ productoId, tipo } = {}) {
  const opciones = productosCache.map((p) => `<option value="${p.id}" ${p.id === productoId ? 'selected' : ''}>${p.nombre} (stock: ${p.stock_actual})</option>`).join('');

  const overlay = abrirModal('Registrar movimiento de stock', `
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

  overlay.querySelector('#btnCancelarModal').addEventListener('click', cerrarModal);
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
      cerrarModal();
      mostrarMensaje('Movimiento registrado.', 'exito');
      await cargarTodo();
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
}

// ---------- Modal: registrar venta (salida de stock + ingreso de dinero) ----------

function abrirModalVenta({ productoId } = {}) {
  if (productosCache.length === 0) {
    mostrarMensaje('Primero crea un producto para poder registrar una venta.', 'error');
    return;
  }

  const productoInicial = productosCache.find((p) => p.id === productoId) || productosCache[0];
  const opciones = productosCache.map((p) => `<option value="${p.id}" data-precio="${p.precio_venta}" ${p.id === productoInicial.id ? 'selected' : ''}>${p.nombre} (stock: ${p.stock_actual})</option>`).join('');

  const overlay = abrirModal('Registrar venta', `
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

  const actualizarTotal = () => {
    const total = Number(campoCantidad.value || 0) * Number(campoPrecio.value || 0);
    totalEl.textContent = formatoMoneda(total);
  };
  campoCantidad.addEventListener('input', actualizarTotal);
  campoPrecio.addEventListener('input', actualizarTotal);
  overlay.querySelector('#selectProductoVenta').addEventListener('change', (e) => {
    campoPrecio.value = e.target.selectedOptions[0].dataset.precio;
    actualizarTotal();
  });

  overlay.querySelector('#btnCancelarModal').addEventListener('click', cerrarModal);
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
      cerrarModal();
      mostrarMensaje('Venta registrada: se descontó el stock y se registró el ingreso.', 'exito');
      await cargarTodo();
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
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
    abrirModalMovimiento({ tipo: tipo === 'salida' ? 'salida' : 'entrada', productoId });
  } else if (params.has('venta')) {
    const productoId = params.has('producto') ? Number(params.get('producto')) : undefined;
    abrirModalVenta({ productoId });
  }
  if (params.toString()) window.history.replaceState({}, '', window.location.pathname);
}

// ---------- Wiring ----------

document.getElementById('filtroCategoria').addEventListener('change', aplicarFiltros);
document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; aplicarFiltros(); }, 150);

pintarBotonesCabecera();
cargarTodo().then(manejarQueryParams);
