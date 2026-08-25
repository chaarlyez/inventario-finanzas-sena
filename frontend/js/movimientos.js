const { icono, abrirModal, cerrarModal, debounce } = window.Layout;

const CATEGORIAS = {
  ingreso: ['venta', 'otro ingreso'],
  egreso: ['compra_insumo', 'gasto_operativo', 'pauta_publicitaria', 'otro egreso'],
};

let movimientosCache = [];
let textoBusqueda = '';

function mostrarMensaje(texto, tipo = '') {
  const el = document.getElementById('mensajeGlobal');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  if (texto) setTimeout(() => { if (el.textContent === texto) el.textContent = ''; }, 4000);
}

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

function aplicarFiltro() {
  const filtrados = textoBusqueda
    ? movimientosCache.filter((m) => `${m.categoria} ${m.descripcion || ''} ${m.producto_nombre || ''}`.toLowerCase().includes(textoBusqueda))
    : movimientosCache;
  renderTabla(filtrados);
}

function renderTabla(lista) {
  const tbody = document.getElementById('tablaMovimientosDinero');
  tbody.innerHTML = lista.length
    ? lista.map((m) => `
        <tr>
          <td>${new Date(m.fecha).toLocaleString('es-CO')}</td>
          <td><span class="badge ${m.tipo === 'ingreso' ? 'badge-verde' : 'badge-rojo'}">${m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}</span></td>
          <td>${m.categoria.replace('_', ' ')}</td>
          <td class="${m.tipo === 'ingreso' ? 'valor-positivo' : 'valor-negativo'}">${formatoMoneda(m.monto)}</td>
          <td>${m.producto_nombre || '—'}</td>
          <td>${m.descripcion || '—'}</td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="6">Todavía no hay movimientos.</td></tr>';
}

async function cargarMovimientosDinero() {
  const movimientos = await apiGet('/movimientos-dinero');
  movimientosCache = [...movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.id - a.id);
  aplicarFiltro();
}

function abrirModalDinero() {
  const overlay = abrirModal('Registrar movimiento de dinero', `
    <form id="formDinero">
      <div class="fila-campos">
        <label class="campo">Tipo
          <select name="tipo" id="tipoDinero" required>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </label>
        <label class="campo">Categoría
          <select name="categoria" id="categoriaDinero" required></select>
        </label>
      </div>
      <label class="campo">Monto
        <input name="monto" type="number" min="0" step="1" required />
      </label>
      <div class="fila-campos">
        <label class="campo">Producto (opcional)
          <select name="producto_id" id="selectProductoDinero">
            <option value="">— Ninguno —</option>
          </select>
        </label>
        <label class="campo">Cantidad (si aplica)
          <input name="cantidad" type="number" min="1" step="1" />
        </label>
      </div>
      <label class="campo">Descripción
        <input name="descripcion" />
      </label>
      <p class="mensaje error" id="mensajeModal"></p>
      <div class="modal-acciones">
        <button type="button" class="btn btn-secundario" id="btnCancelarModal">Cancelar</button>
        <button type="submit" class="btn btn-primario">Registrar</button>
      </div>
    </form>
  `);

  const actualizarCategorias = () => {
    const tipo = overlay.querySelector('#tipoDinero').value;
    const select = overlay.querySelector('#categoriaDinero');
    select.innerHTML = CATEGORIAS[tipo].map((c) => `<option value="${c}">${c.replace('_', ' ')}</option>`).join('');
  };
  overlay.querySelector('#tipoDinero').addEventListener('change', actualizarCategorias);
  actualizarCategorias();

  apiGet('/productos').then((productos) => {
    overlay.querySelector('#selectProductoDinero').innerHTML =
      '<option value="">— Ninguno —</option>' +
      productos.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('');
  });

  overlay.querySelector('#btnCancelarModal').addEventListener('click', cerrarModal);
  overlay.querySelector('#formDinero').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));

    try {
      await apiPost('/movimientos-dinero', {
        tipo: datos.tipo,
        categoria: datos.categoria,
        monto: Number(datos.monto),
        descripcion: datos.descripcion || null,
        producto_id: datos.producto_id ? Number(datos.producto_id) : null,
        cantidad: datos.cantidad ? Number(datos.cantidad) : null,
      });
      cerrarModal();
      mostrarMensaje('Movimiento registrado.', 'exito');
      await Promise.all([cargarResumen(), cargarMovimientosDinero()]);
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
}

document.querySelector('.icono-circulo.verde').innerHTML = icono('cash', 20);
document.querySelector('.icono-circulo.rojo').innerHTML = icono('cash', 20);
document.querySelector('.icono-circulo.morado').innerHTML = icono('chart', 20);
document.querySelector('.icono-circulo.azul').innerHTML = icono('box', 20);

document.getElementById('btnRegistrarDinero').innerHTML = `${icono('plus', 17)} Registrar movimiento`;
document.getElementById('btnRegistrarDinero').addEventListener('click', abrirModalDinero);
window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; aplicarFiltro(); }, 150);

cargarResumen();
cargarMovimientosDinero();
