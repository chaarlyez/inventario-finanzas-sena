const { icono, badgeEstadoStock, badgeCategoria, formatoFechaLarga, formatoFechaCorta, claveDia, renderizarChart } = window.Layout;

function pintarIconosStats() {
  document.querySelector('.tarjeta-stat .icono-circulo.morado').innerHTML = icono('box', 20);
  document.querySelector('.tarjeta-stat .icono-circulo.rosado').innerHTML = icono('package', 20);
  document.querySelector('.tarjeta-stat .icono-circulo.azul').innerHTML = icono('entrada', 20);
  document.querySelector('.tarjeta-stat .icono-circulo.naranja').innerHTML = icono('salida', 20);

  document.querySelector('.accion-rapida .icono-circulo.morado').innerHTML = icono('plus', 20);
  document.querySelector('.accion-rapida .icono-circulo.azul').innerHTML = icono('entrada', 20);
  document.querySelector('.accion-rapida .icono-circulo.verde').innerHTML = icono('cash', 20);
  document.querySelector('.accion-rapida .icono-circulo.rosado').innerHTML = icono('chart', 20);
}

function calcularTendencia(hoy, ayer) {
  if (hoy === 0 && ayer === 0) return { texto: 'Sin movimientos', clase: 'neutra' };
  if (ayer === 0) return { texto: '+100% vs ayer', clase: 'positiva' };
  const pct = Math.round(((hoy - ayer) / ayer) * 100);
  return { texto: `${pct >= 0 ? '+' : ''}${pct}% vs ayer`, clase: pct >= 0 ? 'positiva' : 'negativa' };
}

function sumarDiasClave(claveIso, delta) {
  const d = new Date(`${claveIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

async function cargarDashboard() {
  document.getElementById('fechaHoy').innerHTML = `📅 Hoy, ${formatoFechaLarga(new Date())}`;

  try {
    const [productos, movimientos] = await Promise.all([
      apiGet('/productos'),
      apiGet('/movimientos-inventario'),
    ]);

    // ---- Tarjetas de stock ----
    document.getElementById('statProductos').textContent = productos.length;
    document.getElementById('statStock').textContent = productos.reduce((acc, p) => acc + p.stock_actual, 0);

    const hoyClave = new Date().toISOString().slice(0, 10);
    const ayerClave = sumarDiasClave(hoyClave, -1);

    const sumaPorDiaYTipo = (clave, tipo) => movimientos
      .filter((m) => m.tipo === tipo && claveDia(m.fecha) === clave)
      .reduce((acc, m) => acc + m.cantidad, 0);

    const entradasHoy = sumaPorDiaYTipo(hoyClave, 'entrada');
    const salidasHoy = sumaPorDiaYTipo(hoyClave, 'salida');
    const entradasAyer = sumaPorDiaYTipo(ayerClave, 'entrada');
    const salidasAyer = sumaPorDiaYTipo(ayerClave, 'salida');

    document.getElementById('statEntradas').textContent = entradasHoy;
    document.getElementById('statSalidas').textContent = salidasHoy;

    const tendEntradas = calcularTendencia(entradasHoy, entradasAyer);
    const tendSalidas = calcularTendencia(salidasHoy, salidasAyer);
    document.getElementById('tendenciaEntradas').textContent = tendEntradas.texto;
    document.getElementById('tendenciaEntradas').classList.add(tendEntradas.clase);
    document.getElementById('tendenciaSalidas').textContent = tendSalidas.texto;
    document.getElementById('tendenciaSalidas').classList.add(tendSalidas.clase);

    // ---- Alertas ----
    const sinStock = productos.filter((p) => p.stock_actual <= 0);
    const stockBajo = productos.filter((p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo);
    const contenedorAlertas = document.getElementById('listaAlertas');
    const itemsAlerta = [];

    if (stockBajo.length > 0) {
      itemsAlerta.push(`
        <a class="item-alerta" href="alertas.html">
          <div class="icono-circulo naranja">${icono('alert', 18)}</div>
          <div class="texto">
            <div class="titulo">Stock bajo</div>
            <div class="desc">${stockBajo.length} producto${stockBajo.length === 1 ? '' : 's'} con stock bajo</div>
          </div>
          <span class="chevron">${icono('chevronRight', 16)}</span>
        </a>
      `);
    }
    if (sinStock.length > 0) {
      itemsAlerta.push(`
        <a class="item-alerta" href="alertas.html">
          <div class="icono-circulo rojo">${icono('box', 18)}</div>
          <div class="texto">
            <div class="titulo">Sin stock</div>
            <div class="desc">${sinStock.length} producto${sinStock.length === 1 ? '' : 's'} sin stock</div>
          </div>
          <span class="chevron">${icono('chevronRight', 16)}</span>
        </a>
      `);
    }

    contenedorAlertas.innerHTML = itemsAlerta.length
      ? itemsAlerta.join('')
      : '<p class="sin-alertas">✅ Todo en orden, ningún producto necesita atención.</p>';

    // ---- Gráfico últimos 7 días ----
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const clave = sumarDiasClave(hoyClave, -i);
      dias.push({
        clave,
        etiqueta: formatoFechaCorta(clave),
        entradas: sumaPorDiaYTipo(clave, 'entrada'),
        salidas: sumaPorDiaYTipo(clave, 'salida'),
      });
    }
    renderizarChart(document.getElementById('chartMovimientos'), dias);

    // ---- Productos recientes ----
    const recientes = [...productos]
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
      .slice(0, 5);

    const tbody = document.getElementById('tablaProductosRecientes');
    tbody.innerHTML = recientes.length
      ? recientes.map((p) => {
          const estado = badgeEstadoStock(p);
          return `
            <tr>
              <td>
                <div class="celda-producto">
                  <div class="icono-producto">${icono('box', 17)}</div>
                  <div>
                    <div class="nombre">${p.nombre}</div>
                    <div class="sku">SKU: ${p.sku || '—'}</div>
                  </div>
                </div>
              </td>
              <td>${badgeCategoria(p.categoria)}</td>
              <td>${p.stock_actual}</td>
              <td>${formatoMoneda(p.precio_venta)}</td>
              <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
              <td>
                <div class="acciones-fila">
                  <a class="btn-icono" href="inventario.html?editar=${p.id}" title="Editar">${icono('pencil', 15)}</a>
                </div>
              </td>
            </tr>
          `;
        }).join('')
      : '<tr class="tabla-vacio-fila"><td colspan="6">Todavía no hay productos.</td></tr>';
  } catch (err) {
    console.error(err);
  }
}

pintarIconosStats();
cargarDashboard();
