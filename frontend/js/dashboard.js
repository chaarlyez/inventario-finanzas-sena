async function cargarDashboard() {
  try {
    const resumen = await apiGet('/reportes/resumen');
    document.getElementById('ingresos').textContent = formatoMoneda(resumen.ingresos_totales);
    document.getElementById('egresos').textContent = formatoMoneda(resumen.egresos_totales);

    const balanceEl = document.getElementById('balance');
    balanceEl.textContent = formatoMoneda(resumen.balance);
    balanceEl.classList.add(resumen.balance >= 0 ? 'positivo' : 'negativo');

    document.getElementById('valorInventario').textContent = formatoMoneda(resumen.valor_inventario_actual);

    const productos = await apiGet('/productos');
    const bajos = productos.filter((p) => p.stock_actual <= p.stock_minimo);
    const tbody = document.getElementById('tablaStockBajo');

    if (bajos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">Ningún producto está por debajo del mínimo.</td></tr>';
    } else {
      tbody.innerHTML = bajos
        .map((p) => `<tr><td>${p.nombre}</td><td>${p.stock_actual}</td><td>${p.stock_minimo}</td></tr>`)
        .join('');
    }
  } catch (err) {
    console.error(err);
  }
}

cargarDashboard();
