// Datos de ejemplo para poder probar la app de una vez.
// Basados (con valores de ejemplo) en el catálogo real de la marca "a lo maldita sea".
const bcrypt = require('bcryptjs');
const db = require('./db');

// ---------- Usuario administrador ----------
const yaTieneUsuarios = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n > 0;

if (!yaTieneUsuarios) {
  const emailAdmin = 'charly@alomalditasea.co';
  const passwordAdmin = 'stokio123';
  const hash = bcrypt.hashSync(passwordAdmin, 10);

  db.prepare(`
    INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'administrador')
  `).run('Charly', emailAdmin, hash);

  console.log('Usuario administrador creado:');
  console.log(`  Correo:     ${emailAdmin}`);
  console.log(`  Contraseña: ${passwordAdmin}  (cámbiala después de entrar)`);
} else {
  console.log('Ya hay usuarios, no se creó ninguno.');
}

// ---------- Ambientes ----------
const yaTieneAmbientes = db.prepare('SELECT COUNT(*) AS n FROM ambientes').get().n > 0;
let idBodega = null;

if (!yaTieneAmbientes) {
  const insertarAmbiente = db.prepare('INSERT INTO ambientes (nombre, descripcion) VALUES (?, ?)');
  idBodega = insertarAmbiente.run('Bodega principal', 'Bodega donde se guarda el inventario físico').lastInsertRowid;
  insertarAmbiente.run('Tienda virtual', 'Stock disponible para venta por Instagram/WhatsApp');
  console.log('Ambientes de ejemplo insertados.');
} else {
  idBodega = db.prepare('SELECT id FROM ambientes ORDER BY id LIMIT 1').get()?.id;
  console.log('Ya hay ambientes, no se insertó nada.');
}

// ---------- Distribuidores ----------
const yaTieneDistribuidores = db.prepare('SELECT COUNT(*) AS n FROM distribuidores').get().n > 0;
let idDistribuidor = null;

if (!yaTieneDistribuidores) {
  idDistribuidor = db.prepare(`
    INSERT INTO distribuidores (nombre, contacto, telefono, email, notas)
    VALUES (?, ?, ?, ?, ?)
  `).run('Textiles del Valle', 'Andrea Ruiz', '3001234567', 'ventas@textilesdelvalle.co', 'Proveedor de camisetas base').lastInsertRowid;
  console.log('Distribuidores de ejemplo insertados.');
} else {
  idDistribuidor = db.prepare('SELECT id FROM distribuidores ORDER BY id LIMIT 1').get()?.id;
  console.log('Ya hay distribuidores, no se insertó nada.');
}

// ---------- Productos ----------
// A diferencia del resto, esto no es todo-o-nada: inserta las variantes
// que falten y respeta las que ya existan, para poder ampliar el catálogo
// sin borrar la base ni tocar el stock que ya está registrado.
{
  const insertarProducto = db.prepare(`
    INSERT INTO productos (nombre, categoria, sku, costo_unitario, precio_venta, stock_actual, stock_minimo, ambiente_id, distribuidor_id)
    VALUES (@nombre, @categoria, @sku, @costo_unitario, @precio_venta, @stock_actual, @stock_minimo, @ambiente_id, @distribuidor_id)
  `);

  // Catálogo por variante: cada combinación de corte, color y talla es un
  // producto propio, porque cada una tiene su propio stock y su propio QR.
  const CORTES = [
    { clave: 'CLA', nombre: 'clásica', costo: 30000, precio: 55000 },
    { clave: 'OVE', nombre: 'oversize', costo: 40000, precio: 85000 },
  ];
  const COLORES = [
    { clave: 'NEG', nombre: 'negra' },
    { clave: 'BLA', nombre: 'blanca' },
  ];
  const TALLAS = ['S', 'M', 'L', 'XL'];

  const productos = [];
  for (const corte of CORTES) {
    for (const color of COLORES) {
      for (const talla of TALLAS) {
        productos.push({
          nombre: `Camiseta ${corte.nombre} ${color.nombre} · talla ${talla}`,
          categoria: 'Camisetas',
          // El SKU es lo que va dentro del QR: corto, legible y sin
          // acentos, para poder teclearlo si la cámara falla.
          sku: `CAM-${corte.clave}-${color.clave}-${talla}`,
          costo_unitario: corte.costo,
          precio_venta: corte.precio,
          stock_actual: 0,
          stock_minimo: 3,
          ambiente_id: idBodega,
          distribuidor_id: idDistribuidor,
        });
      }
    }
  }

  const existentes = new Set(
    db.prepare('SELECT sku FROM productos WHERE sku IS NOT NULL').all().map((f) => f.sku),
  );
  const faltantes = productos.filter((p) => !existentes.has(p.sku));

  if (faltantes.length > 0) {
    const insertarMuchos = db.transaction((filas) => {
      for (const fila of filas) insertarProducto.run(fila);
    });
    insertarMuchos(faltantes);
    console.log(`Productos insertados: ${faltantes.length} variante(s) de camiseta.`);
  } else {
    console.log('Las variantes de camiseta ya estaban registradas.');
  }
}
