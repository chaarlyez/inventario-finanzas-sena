async function cargarRentabilidad() {
  const filas = await apiGet('/reportes/rentabilidad');
  const tbody = document.getElementById('tablaRentabilidad');

  tbody.innerHTML = filas.length
    ? filas.map((f) => `
        <tr>
          <td>${f.nombre}</td>
          <td>${f.unidades_vendidas}</td>
          <td>${formatoMoneda(f.ingresos)}</td>
          <td>${formatoMoneda(f.costo_vendido)}</td>
          <td class="${f.utilidad >= 0 ? 'valor positivo' : 'valor negativo'}">${formatoMoneda(f.utilidad)}</td>
          <td>${f.margen_porcentaje == null ? '—' : f.margen_porcentaje.toFixed(1) + '%'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="6">Todavía no hay productos.</td></tr>';
}

cargarRentabilidad();
