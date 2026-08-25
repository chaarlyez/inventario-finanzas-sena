const { icono, abrirModal, cerrarModal, debounce } = window.Layout;

let ambientesCache = [];
let textoBusqueda = '';

function mostrarMensaje(texto, tipo = '') {
  const el = document.getElementById('mensajeGlobal');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  if (texto) setTimeout(() => { if (el.textContent === texto) el.textContent = ''; }, 4000);
}

function aplicarFiltro() {
  const filtrados = textoBusqueda
    ? ambientesCache.filter((a) => `${a.nombre} ${a.descripcion || ''}`.toLowerCase().includes(textoBusqueda))
    : ambientesCache;
  renderTabla(filtrados);
}

function renderTabla(lista) {
  const tbody = document.getElementById('tablaAmbientes');
  tbody.innerHTML = lista.length
    ? lista.map((a) => `
        <tr>
          <td>
            <div class="celda-producto">
              <div class="icono-producto">${icono('mapPin', 17)}</div>
              <div class="nombre">${a.nombre}</div>
            </div>
          </td>
          <td>${a.descripcion || '—'}</td>
          <td>${a.total_productos}</td>
          <td>${a.stock_total}</td>
          <td>
            <div class="acciones-fila">
              <button type="button" class="btn-icono" title="Editar" data-editar="${a.id}">${icono('pencil', 15)}</button>
              <button type="button" class="btn-icono peligro" title="Eliminar" data-eliminar="${a.id}">${icono('trash', 15)}</button>
            </div>
          </td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="5">Todavía no hay ambientes registrados.</td></tr>';

  tbody.querySelectorAll('[data-editar]').forEach((btn) => btn.addEventListener('click', () => {
    abrirModalAmbiente(ambientesCache.find((a) => a.id === Number(btn.dataset.editar)));
  }));
  tbody.querySelectorAll('[data-eliminar]').forEach((btn) => btn.addEventListener('click', () => eliminarAmbiente(Number(btn.dataset.eliminar))));
}

async function cargarAmbientes() {
  ambientesCache = await apiGet('/ambientes');
  aplicarFiltro();
}

function abrirModalAmbiente(ambiente = null) {
  const esEdicion = Boolean(ambiente);
  const overlay = abrirModal(esEdicion ? 'Editar ambiente' : 'Nuevo ambiente', `
    <form id="formAmbiente">
      <label class="campo">Nombre
        <input name="nombre" required value="${ambiente?.nombre ?? ''}" />
      </label>
      <label class="campo">Descripción
        <input name="descripcion" value="${ambiente?.descripcion ?? ''}" />
      </label>
      <p class="mensaje error" id="mensajeModal"></p>
      <div class="modal-acciones">
        <button type="button" class="btn btn-secundario" id="btnCancelarModal">Cancelar</button>
        <button type="submit" class="btn btn-primario">${esEdicion ? 'Guardar cambios' : 'Crear ambiente'}</button>
      </div>
    </form>
  `);

  overlay.querySelector('#btnCancelarModal').addEventListener('click', cerrarModal);
  overlay.querySelector('#formAmbiente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    try {
      if (esEdicion) {
        await apiPut(`/ambientes/${ambiente.id}`, datos);
      } else {
        await apiPost('/ambientes', datos);
      }
      cerrarModal();
      mostrarMensaje(esEdicion ? 'Ambiente actualizado.' : 'Ambiente creado.', 'exito');
      await cargarAmbientes();
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
}

async function eliminarAmbiente(id) {
  const ambiente = ambientesCache.find((a) => a.id === id);
  if (!ambiente) return;
  if (!confirm(`¿Eliminar "${ambiente.nombre}"?`)) return;

  try {
    await apiDelete(`/ambientes/${id}`);
    mostrarMensaje('Ambiente eliminado.', 'exito');
    await cargarAmbientes();
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
}

document.getElementById('btnNuevoAmbiente').innerHTML = `${icono('plus', 17)} Nuevo ambiente`;
document.getElementById('btnNuevoAmbiente').addEventListener('click', () => abrirModalAmbiente());
window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; aplicarFiltro(); }, 150);

cargarAmbientes();
