const {
  icono,
  formatoFechaLarga,
  formatoFechaCorta,
  claveDia,
  renderizarChart,
  renderizarDona,
  renderizarBarrasAmbiente,
  clasificarStock,
  formatoNumero,
  formatoPorcentaje,
  tiempoRelativo,
} = window.Layout;

// Pinta todos los iconos declarados con `data-icono` en el HTML, para no
// repetir svg inline en la plantilla.
function pintarIconos() {
  document.querySelectorAll('[data-icono]').forEach((el) => {
    const tam = el.classList.contains('icono-btn') ? 16 : 20;
    el.innerHTML = icono(el.dataset.icono, tam);
  });
}

function sumarDiasClave(claveIso, delta) {
  const d = new Date(`${claveIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// ---------- Tarjetas de metrica (guia §8) ----------

function pintarMetricas(productos) {
  const total = productos.length;
  const conteo = { en_stock: 0, bajo: 0, agotado: 0 };
  productos.forEach((p) => { conteo[clasificarStock(p)] += 1; });

  const pct = (n) => (total ? formatoPorcentaje((n / total) * 100) : '0,0%');

  // Productos creados dentro de los ultimos 30 dias.
  const haceUnMes = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const nuevos = productos.filter((p) => new Date(p.creado_en).getTime() >= haceUnMes).length;

  const ponerTexto = (id, valor) => { document.getElementById(id).textContent = valor; };

  ponerTexto('statProductos', formatoNumero(total));
  ponerTexto('apoyoProductos', nuevos > 0
    ? `+${formatoNumero(nuevos)} este mes`
    : 'Sin altas este mes');

  ponerTexto('statEnStock', formatoNumero(conteo.en_stock));
  ponerTexto('apoyoEnStock', `${pct(conteo.en_stock)} del total`);

  ponerTexto('statStockBajo', formatoNumero(conteo.bajo));
  ponerTexto('apoyoStockBajo', conteo.bajo > 0
    ? `${formatoNumero(conteo.bajo)} requiere${conteo.bajo === 1 ? '' : 'n'} reposición`
    : 'Nada por reponer');

  ponerTexto('statSinStock', formatoNumero(conteo.agotado));
  ponerTexto('apoyoSinStock', conteo.agotado > 0
    ? `${pct(conteo.agotado)} del total`
    : 'Ningún producto agotado');

  document.getElementById('subEstado').textContent = total
    ? `Distribución actual de ${formatoNumero(total)} producto${total === 1 ? '' : 's'}`
    : 'Distribución actual de tus productos';
}

// ---------- Lista de atencion (guia §8, tercera fila) ----------

function pintarAtencion(productos) {
  const contenedor = document.getElementById('listaAtencion');

  // Primero lo agotado, luego lo que esta bajo minimo; dentro de cada
  // grupo, el que tiene menos stock encabeza la lista.
  const criticos = productos
    .filter((p) => clasificarStock(p) !== 'en_stock')
    .sort((a, b) => {
      const peso = (p) => (p.stock_actual <= 0 ? 0 : 1);
      return peso(a) - peso(b) || a.stock_actual - b.stock_actual;
    })
    .slice(0, 5);

  if (!criticos.length) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="icono-vacio">${icono('check', 26)}</div>
        <div class="titulo">Todo en orden</div>
        <p class="desc">Ningún producto está por debajo de su stock mínimo.</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = criticos.map((p) => {
    const agotado = p.stock_actual <= 0;
    // Guia §3: el estado nunca se comunica solo con color, siempre con texto.
    const badge = agotado
      ? '<span class="badge badge-rojo">Sin stock</span>'
      : '<span class="badge badge-amarillo">Stock bajo</span>';
    return `
      <a class="fila-atencion" href="inventario.html?editar=${p.id}">
        <span class="miniatura">${icono('box', 17)}</span>
        <span>
          <span class="nombre">${p.nombre}</span>
          <span class="meta">${p.sku ? `SKU ${p.sku}` : 'Sin SKU'} · ${p.ambiente_nombre || 'Sin ambiente'}</span>
        </span>
        <span class="cantidad-stock">${formatoNumero(p.stock_actual)} / ${formatoNumero(p.stock_minimo)}</span>
        ${badge}
      </a>`;
  }).join('');
}

// ---------- Actividad reciente (guia §8) ----------

function pintarActividad(movimientos) {
  const contenedor = document.getElementById('actividadReciente');
  const recientes = movimientos.slice(0, 6);

  if (!recientes.length) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="icono-vacio">${icono('arrowLeftRight', 26)}</div>
        <div class="titulo">Sin movimientos todavía</div>
        <p class="desc">Registra una entrada o una salida y aparecerá aquí.</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = `<ul class="linea-actividad">${recientes.map((m) => {
    const esSalida = m.tipo === 'salida';
    const verbo = esSalida ? 'Salieron' : 'Entraron';
    const unidad = m.cantidad === 1 ? 'unidad' : 'unidades';
    return `
      <li class="actividad-item ${esSalida ? 'salida' : 'entrada'}">
        <span class="actividad-punto"></span>
        <span>
          <span class="actividad-texto">${verbo} <strong>${formatoNumero(m.cantidad)}</strong> ${unidad} de <strong>${m.producto_nombre}</strong>${m.motivo ? ` · ${m.motivo}` : ''}</span>
          <span class="actividad-cuando">${tiempoRelativo(m.fecha)}</span>
        </span>
      </li>`;
  }).join('')}</ul>`;
}

// ---------- Carga ----------

async function cargarDashboard() {
  document.getElementById('btnEscanearQr').addEventListener('click', () => window.Layout.abrirEscanerQr());

  try {
    const [productos, movimientos, ambientes] = await Promise.all([
      apiGet('/productos'),
      apiGet('/movimientos-inventario'),
      apiGet('/ambientes'),
    ]);

    pintarMetricas(productos);
    renderizarDona(document.getElementById('donaEstado'), productos);
    renderizarBarrasAmbiente(document.getElementById('barrasAmbientes'), ambientes);
    pintarAtencion(productos);
    pintarActividad(movimientos);

    // Serie de los ultimos 7 dias para el grafico de lineas.
    const hoyClave = new Date().toISOString().slice(0, 10);
    const sumaPorDiaYTipo = (clave, tipo) => movimientos
      .filter((m) => m.tipo === tipo && claveDia(m.fecha) === clave)
      .reduce((acc, m) => acc + m.cantidad, 0);

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
  } catch (err) {
    console.error(err);
  }
}

// Saludo con el nombre real en cuanto la sesion resuelve el usuario.
function personalizarSaludo() {
  const intentar = () => {
    const usuario = window.Layout.usuarioActual;
    if (!usuario) return false;
    const nombre = usuario.nombre.split(' ')[0];
    document.getElementById('saludo').textContent = `¡Hola, ${nombre}! 👋`;
    return true;
  };
  if (intentar()) return;
  const id = setInterval(() => { if (intentar()) clearInterval(id); }, 200);
  setTimeout(() => clearInterval(id), 5000);
}

pintarIconos();
personalizarSaludo();
cargarDashboard();
