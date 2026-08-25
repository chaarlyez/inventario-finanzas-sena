const { icono, abrirModal, cerrarModal, debounce } = window.Layout;

let distribuidoresCache = [];
let textoBusqueda = '';

function mostrarMensaje(texto, tipo = '') {
  const el = document.getElementById('mensajeGlobal');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  if (texto) setTimeout(() => { if (el.textContent === texto) el.textContent = ''; }, 4000);
}

function aplicarFiltro() {
  const filtrados = textoBusqueda
    ? distribuidoresCache.filter((d) => `${d.nombre} ${d.contacto || ''} ${d.email || ''}`.toLowerCase().includes(textoBusqueda))
    : distribuidoresCache;
  renderTabla(filtrados);
}

function renderTabla(lista) {
  const tbody = document.getElementById('tablaDistribuidores');
  tbody.innerHTML = lista.length
    ? lista.map((d) => `
        <tr>
          <td>
            <div class="celda-producto">
              <div class="icono-producto">${icono('truck', 17)}</div>
              <div class="nombre">${d.nombre}</div>
            </div>
          </td>
          <td>${d.contacto || '—'}</td>
          <td>${d.telefono || '—'}</td>
          <td>${d.email || '—'}</td>
          <td>${d.total_productos}</td>
          <td>
            <div class="acciones-fila">
              <button type="button" class="btn-icono" title="Editar" data-editar="${d.id}">${icono('pencil', 15)}</button>
              <button type="button" class="btn-icono peligro" title="Eliminar" data-eliminar="${d.id}">${icono('trash', 15)}</button>
            </div>
          </td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="6">Todavía no hay distribuidores registrados.</td></tr>';

  tbody.querySelectorAll('[data-editar]').forEach((btn) => btn.addEventListener('click', () => {
    abrirModalDistribuidor(distribuidoresCache.find((d) => d.id === Number(btn.dataset.editar)));
  }));
  tbody.querySelectorAll('[data-eliminar]').forEach((btn) => btn.addEventListener('click', () => eliminarDistribuidor(Number(btn.dataset.eliminar))));
}

async function cargarDistribuidores() {
  distribuidoresCache = await apiGet('/distribuidores');
  aplicarFiltro();
}

function abrirModalDistribuidor(distribuidor = null) {
  const esEdicion = Boolean(distribuidor);
  const overlay = abrirModal(esEdicion ? 'Editar distribuidor' : 'Nuevo distribuidor', `
    <form id="formDistribuidor">
      <label class="campo">Nombre
        <input name="nombre" required value="${distribuidor?.nombre ?? ''}" />
      </label>
      <div class="fila-campos">
        <label class="campo">Persona de contacto
          <input name="contacto" value="${distribuidor?.contacto ?? ''}" />
        </label>
        <label class="campo">Teléfono
          <input name="telefono" value="${distribuidor?.telefono ?? ''}" />
        </label>
      </div>
      <label class="campo">Correo
        <input name="email" type="email" value="${distribuidor?.email ?? ''}" />
      </label>
      <label class="campo">Notas
        <input name="notas" value="${distribuidor?.notas ?? ''}" />
      </label>
      <p class="mensaje error" id="mensajeModal"></p>
      <div class="modal-acciones">
        <button type="button" class="btn btn-secundario" id="btnCancelarModal">Cancelar</button>
        <button type="submit" class="btn btn-primario">${esEdicion ? 'Guardar cambios' : 'Crear distribuidor'}</button>
      </div>
    </form>
  `);

  overlay.querySelector('#btnCancelarModal').addEventListener('click', cerrarModal);
  overlay.querySelector('#formDistribuidor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    try {
      if (esEdicion) {
        await apiPut(`/distribuidores/${distribuidor.id}`, datos);
      } else {
        await apiPost('/distribuidores', datos);
      }
      cerrarModal();
      mostrarMensaje(esEdicion ? 'Distribuidor actualizado.' : 'Distribuidor creado.', 'exito');
      await cargarDistribuidores();
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
}

async function eliminarDistribuidor(id) {
  const distribuidor = distribuidoresCache.find((d) => d.id === id);
  if (!distribuidor) return;
  if (!confirm(`¿Eliminar "${distribuidor.nombre}"?`)) return;

  try {
    await apiDelete(`/distribuidores/${id}`);
    mostrarMensaje('Distribuidor eliminado.', 'exito');
    await cargarDistribuidores();
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
}

document.getElementById('btnNuevoDistribuidor').innerHTML = `${icono('plus', 17)} Nuevo distribuidor`;
document.getElementById('btnNuevoDistribuidor').addEventListener('click', () => abrirModalDistribuidor());
window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; aplicarFiltro(); }, 150);

cargarDistribuidores();
