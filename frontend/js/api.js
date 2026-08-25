// Envoltorio pequeño para llamar al API del backend.
const API_BASE = '/api';

async function apiGet(ruta) {
  const res = await fetch(`${API_BASE}${ruta}`);
  if (!res.ok) throw new Error((await res.json()).error || 'Error en la petición');
  return res.json();
}

async function apiPost(ruta, datos) {
  const res = await fetch(`${API_BASE}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Error en la petición');
  return res.json();
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor || 0);
}
