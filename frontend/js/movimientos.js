const CATEGORIAS = {
  ingreso: ['venta', 'otro ingreso'],
  egreso: ['compra_insumo', 'gasto_operativo', 'pauta_publicitaria', 'otro egreso'],
};

function actualizarCategorias() {
  const tipo = document.getElementById('tipoDinero').value;
  const select = document.getElementById('categoriaDinero');
  select.innerHTML = CATEGORIAS[tipo].map((c) => `<option value="${c}">${c.replace('_', ' ')}</option>`).join('');
}

document.getElementById('tipoDinero').addEventListener('change', actualizarCategorias);
actualizarCategorias();

async function cargarSelectProductos() {
  const productos = await apiGet('/productos');
  const select = document.getElementById('selectProductoDinero');
  select.innerHTML =
    '<option value="">— Ninguno —</option>' +
    productos.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('');
}

async function cargarMovimientosDinero() {
  const movimientos = await apiGet('/movimientos-dinero');
  const tbody = document.getElementById('tablaMovimientosDinero');

  tbody.innerHTML = movimientos.length
    ? movimientos.map((m) => `
        <tr>
          <td>${new Date(m.fecha).toLocaleString('es-CO')}</td>
          <td>${m.tipo}</td>
          <td>${m.categoria}</td>
          <td class="${m.tipo === 'ingreso' ? 'valor positivo' : 'valor negativo'}">${formatoMoneda(m.monto)}</td>
          <td>${m.producto_nombre || '—'}</td>
          <td>${m.descripcion || '—'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="6">Todavía no hay movimientos.</td></tr>';
}

document.getElementById('formDinero').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const datos = Object.fromEntries(new FormData(form));
  const mensaje = document.getElementById('mensajeDinero');

  try {
    await apiPost('/movimientos-dinero', {
      tipo: datos.tipo,
      categoria: datos.categoria,
      monto: Number(datos.monto),
      descripcion: datos.descripcion || null,
      producto_id: datos.producto_id ? Number(datos.producto_id) : null,
      cantidad: datos.cantidad ? Number(datos.cantidad) : null,
    });
    mensaje.textContent = 'Movimiento registrado.';
    mensaje.classList.remove('error');
    form.reset();
    actualizarCategorias();
    cargarMovimientosDinero();
  } catch (err) {
    mensaje.textContent = err.message;
    mensaje.classList.add('error');
  }
});

cargarSelectProductos();
cargarMovimientosDinero();
