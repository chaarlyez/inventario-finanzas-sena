// Envoltorio pequeño para llamar al API del backend.
const API_BASE = '/api';

// Si el API responde 401 (sesión vencida o inexistente) mandamos al login,
// excepto si ya estamos ahí o si es el propio intento de login.
function manejarNoAutorizado(ruta) {
  const enLogin = window.location.pathname.endsWith('login.html');
  if (!enLogin && ruta !== '/auth/login') {
    window.location.href = 'login.html';
  }
}

async function leerError(res) {
  try {
    return (await res.json()).error || 'Error en la petición';
  } catch {
    return 'Error en la petición';
  }
}

async function apiGet(ruta) {
  const res = await fetch(`${API_BASE}${ruta}`, { credentials: 'same-origin' });
  if (res.status === 401) manejarNoAutorizado(ruta);
  if (!res.ok) throw new Error(await leerError(res));
  if (res.status === 204) return null;
  return res.json();
}

async function apiPost(ruta, datos) {
  const res = await fetch(`${API_BASE}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(datos),
  });
  if (res.status === 401) manejarNoAutorizado(ruta);
  if (!res.ok) throw new Error(await leerError(res));
  if (res.status === 204) return null;
  return res.json();
}

async function apiPut(ruta, datos) {
  const res = await fetch(`${API_BASE}${ruta}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(datos),
  });
  if (res.status === 401) manejarNoAutorizado(ruta);
  if (!res.ok) throw new Error(await leerError(res));
  if (res.status === 204) return null;
  return res.json();
}

async function apiDelete(ruta) {
  const res = await fetch(`${API_BASE}${ruta}`, { method: 'DELETE', credentials: 'same-origin' });
  if (res.status === 401) manejarNoAutorizado(ruta);
  if (!res.ok) throw new Error(await leerError(res));
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor || 0);
}
