const { icono, formatoNumero } = window.Layout;

let productos = [];
const seleccionados = new Set();

function pintarIconos() {
  document.querySelectorAll('[data-icono]').forEach((el) => {
    el.innerHTML = icono(el.dataset.icono, el.classList.contains('icono-btn') ? 16 : 20);
  });
}

// El QR lleva únicamente el SKU. Es lo más corto que identifica al producto,
// se puede teclear si la cámara falla, y no caduca: si mañana cambia el
// precio o el nombre, la etiqueta impresa sigue sirviendo.
function etiqueta(p) {
  const marcado = seleccionados.has(p.id);
  const mostrarPrecio = document.getElementById('mostrarPrecio').checked;
  return `
    <label class="etiqueta-qr ${marcado ? '' : 'no-impresa'}" data-id="${p.id}">
      <input type="checkbox" class="etiqueta-marca sin-imprimir" ${marcado ? 'checked' : ''} />
      <div class="etiqueta-qr-imagen">${QR.dibujarSvg(p.sku, { lado: 300 })}</div>
      <div class="etiqueta-qr-texto">
        <span class="etiqueta-nombre">${p.nombre}</span>
        <span class="etiqueta-sku">${p.sku}</span>
        ${mostrarPrecio ? `<span class="etiqueta-precio">${formatoMoneda(p.precio_venta)}</span>` : ''}
      </div>
    </label>`;
}

function pintarHoja() {
  const filtro = document.getElementById('filtroCategoria').value;
  const visibles = productos.filter((p) => p.sku && (!filtro || p.categoria === filtro));
  const hoja = document.getElementById('hojaEtiquetas');

  if (!visibles.length) {
    hoja.innerHTML = `
      <div class="estado-vacio">
        <div class="icono-vacio">${icono('qrCode', 26)}</div>
        <div class="titulo">No hay productos con código</div>
        <p class="desc">Una etiqueta necesita un SKU. Asigna uno desde Productos y volverá a aparecer aquí.</p>
      </div>`;
  } else {
    hoja.innerHTML = visibles.map(etiqueta).join('');
    hoja.querySelectorAll('.etiqueta-qr').forEach((el) => {
      el.querySelector('.etiqueta-marca').addEventListener('change', (e) => {
        const id = Number(el.dataset.id);
        if (e.target.checked) seleccionados.add(id); else seleccionados.delete(id);
        el.classList.toggle('no-impresa', !e.target.checked);
        pintarResumen();
      });
    });
  }
  pintarResumen();
}

function pintarResumen() {
  const n = seleccionados.size;
  document.getElementById('resumenSeleccion').textContent = n
    ? `${formatoNumero(n)} etiqueta${n === 1 ? '' : 's'} seleccionada${n === 1 ? '' : 's'} para imprimir.`
    : 'Marca al menos una etiqueta para poder imprimir.';
  document.getElementById('btnImprimir').disabled = n === 0;
}

async function cargar() {
  try {
    productos = await apiGet('/productos');
    productos.filter((p) => p.sku).forEach((p) => seleccionados.add(p.id));

    const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort();
    const select = document.getElementById('filtroCategoria');
    categorias.forEach((c) => {
      const o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      select.appendChild(o);
    });

    pintarHoja();
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('filtroCategoria').addEventListener('change', pintarHoja);
document.getElementById('mostrarPrecio').addEventListener('change', pintarHoja);

document.getElementById('tamanoEtiqueta').addEventListener('change', (e) => {
  document.getElementById('hojaEtiquetas').dataset.tamano = e.target.value;
});

document.getElementById('btnSeleccionarTodo').addEventListener('click', () => {
  const visibles = [...document.querySelectorAll('.etiqueta-qr')].map((el) => Number(el.dataset.id));
  const todasMarcadas = visibles.every((id) => seleccionados.has(id));
  // Un solo botón que alterna: si ya está todo marcado, desmarca.
  visibles.forEach((id) => (todasMarcadas ? seleccionados.delete(id) : seleccionados.add(id)));
  pintarHoja();
});

document.getElementById('btnImprimir').addEventListener('click', () => window.print());

pintarIconos();
document.getElementById('hojaEtiquetas').dataset.tamano = 'mediana';
cargar();
