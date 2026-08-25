// Si ya hay sesión activa, no tiene sentido mostrar el login otra vez.
apiGet('/auth/yo').then(() => { window.location.href = 'index.html'; }).catch(() => {});

document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const datos = Object.fromEntries(new FormData(form));
  const mensaje = document.getElementById('mensajeLogin');
  const boton = form.querySelector('button[type=submit]');

  mensaje.textContent = '';
  boton.disabled = true;
  boton.textContent = 'Entrando…';

  try {
    await apiPost('/auth/login', datos);
    window.location.href = 'index.html';
  } catch (err) {
    mensaje.textContent = err.message;
    boton.disabled = false;
    boton.textContent = 'Iniciar sesión';
  }
});
