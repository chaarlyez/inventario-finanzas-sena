async function cargarProductos() {
  const productos = await apiGet('/productos');

  const tbody = document.getElementById('tablaProductos');
  tbody.innerHTML = productos.length
    ? productos.map((p) => `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.categoria || '—'}</td>
          <td>${p.sku || '—'}</td>
          <td>${formatoMoneda(p.costo_unitario)}</td>
          <td>${formatoMoneda(p.precio_venta)}</td>
          <td>${p.stock_actual}</td>
          <td>${p.stock_minimo}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="7">Todavía no hay productos.</td></tr>';

  const select = document.getElementById('selectProducto');
  select.innerHTML = productos.map((p) => `<option value="${p.id}">${p.nombre} (stock: ${p.stock_actual})</option>`).join('');

  return productos;
}

document.getElementById('formProducto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const datos = Object.fromEntries(new FormData(form));
  const mensaje = document.getElementById('mensajeProducto');

  try {
    await apiPost('/productos', {
      nombre: datos.nombre,
      categoria: datos.categoria || null,
      sku: datos.sku || null,
      costo_unitario: Number(datos.costo_unitario),
      precio_venta: Number(datos.precio_venta),
      stock_actual: Number(datos.stock_actual || 0),
      stock_minimo: Number(datos.stock_minimo || 0),
    });
    mensaje.textContent = 'Producto creado.';
    mensaje.classList.remove('error');
    form.reset();
    cargarProductos();
  } catch (err) {
    mensaje.textContent = err.message;
    mensaje.classList.add('error');
  }
});

document.getElementById('formMovimiento').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const datos = Object.fromEntries(new FormData(form));
  const mensaje = document.getElementById('mensajeMovimiento');

  try {
    await apiPost('/movimientos-inventario', {
      producto_id: Number(datos.producto_id),
      tipo: datos.tipo,
      cantidad: Number(datos.cantidad),
      motivo: datos.motivo || null,
    });
    mensaje.textContent = 'Movimiento registrado.';
    mensaje.classList.remove('error');
    form.reset();
    cargarProductos();
  } catch (err) {
    mensaje.textContent = err.message;
    mensaje.classList.add('error');
  }
});

cargarProductos();
