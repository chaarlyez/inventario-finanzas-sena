const { icono, abrirModal, cerrarModal, debounce } = window.Layout;

let usuariosCache = [];
let textoBusqueda = '';

function mostrarMensaje(texto, tipo = '') {
  const el = document.getElementById('mensajeGlobal');
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
  if (texto) setTimeout(() => { if (el.textContent === texto) el.textContent = ''; }, 4000);
}

function aplicarFiltro() {
  const filtrados = textoBusqueda
    ? usuariosCache.filter((u) => `${u.nombre} ${u.email}`.toLowerCase().includes(textoBusqueda))
    : usuariosCache;
  renderTabla(filtrados);
}

function renderTabla(lista) {
  const tbody = document.getElementById('tablaUsuarios');
  tbody.innerHTML = lista.length
    ? lista.map((u) => `
        <tr>
          <td>${u.nombre}</td>
          <td>${u.email}</td>
          <td><span class="badge ${u.rol === 'administrador' ? 'badge-morado' : 'badge-azul'}">${u.rol === 'administrador' ? 'Administrador' : 'Colaborador'}</span></td>
          <td>${new Date(u.creado_en).toLocaleDateString('es-CO')}</td>
          <td>
            <div class="acciones-fila">
              <button type="button" class="btn-icono" title="Editar" data-editar="${u.id}">${icono('pencil', 15)}</button>
              <button type="button" class="btn-icono peligro" title="Eliminar" data-eliminar="${u.id}">${icono('trash', 15)}</button>
            </div>
          </td>
        </tr>
      `).join('')
    : '<tr class="tabla-vacio-fila"><td colspan="5">Todavía no hay usuarios.</td></tr>';

  tbody.querySelectorAll('[data-editar]').forEach((btn) => btn.addEventListener('click', () => {
    abrirModalUsuario(usuariosCache.find((u) => u.id === Number(btn.dataset.editar)));
  }));
  tbody.querySelectorAll('[data-eliminar]').forEach((btn) => btn.addEventListener('click', () => eliminarUsuario(Number(btn.dataset.eliminar))));
}

async function cargarUsuarios() {
  try {
    usuariosCache = await apiGet('/usuarios');
    aplicarFiltro();
  } catch (err) {
    document.getElementById('tablaUsuarios').innerHTML = `<tr class="tabla-vacio-fila"><td colspan="5">${err.message}</td></tr>`;
  }
}

function abrirModalUsuario(usuario = null) {
  const esEdicion = Boolean(usuario);
  const overlay = abrirModal(esEdicion ? 'Editar usuario' : 'Nuevo usuario', `
    <form id="formUsuario">
      <label class="campo">Nombre
        <input name="nombre" required value="${usuario?.nombre ?? ''}" />
      </label>
      <label class="campo">Correo
        <input name="email" type="email" required value="${usuario?.email ?? ''}" />
      </label>
      <div class="fila-campos">
        <label class="campo">Rol
          <select name="rol">
            <option value="colaborador" ${usuario?.rol === 'colaborador' ? 'selected' : ''}>Colaborador</option>
            <option value="administrador" ${usuario?.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
          </select>
        </label>
        <label class="campo">${esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          <input name="password" type="password" ${esEdicion ? '' : 'required'} minlength="6" placeholder="${esEdicion ? 'Dejar en blanco para no cambiarla' : 'Mínimo 6 caracteres'}" />
        </label>
      </div>
      <p class="mensaje error" id="mensajeModal"></p>
      <div class="modal-acciones">
        <button type="button" class="btn btn-secundario" id="btnCancelarModal">Cancelar</button>
        <button type="submit" class="btn btn-primario">${esEdicion ? 'Guardar cambios' : 'Crear usuario'}</button>
      </div>
    </form>
  `);

  overlay.querySelector('#btnCancelarModal').addEventListener('click', cerrarModal);
  overlay.querySelector('#formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    if (!datos.password) delete datos.password;

    try {
      if (esEdicion) {
        await apiPut(`/usuarios/${usuario.id}`, datos);
      } else {
        await apiPost('/usuarios', datos);
      }
      cerrarModal();
      mostrarMensaje(esEdicion ? 'Usuario actualizado.' : 'Usuario creado.', 'exito');
      await cargarUsuarios();
    } catch (err) {
      overlay.querySelector('#mensajeModal').textContent = err.message;
    }
  });
}

async function eliminarUsuario(id) {
  const usuario = usuariosCache.find((u) => u.id === id);
  if (!usuario) return;
  if (!confirm(`¿Eliminar a "${usuario.nombre}"? Ya no podrá iniciar sesión.`)) return;

  try {
    await apiDelete(`/usuarios/${id}`);
    mostrarMensaje('Usuario eliminado.', 'exito');
    await cargarUsuarios();
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
}

document.getElementById('btnNuevoUsuario').innerHTML = `${icono('plus', 17)} Nuevo usuario`;
document.getElementById('btnNuevoUsuario').addEventListener('click', () => abrirModalUsuario());
window.onBuscarGlobal = debounce((texto) => { textoBusqueda = texto; aplicarFiltro(); }, 150);

cargarUsuarios();
