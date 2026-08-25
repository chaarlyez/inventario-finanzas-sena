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
const yaTieneProductos = db.prepare('SELECT COUNT(*) AS n FROM productos').get().n > 0;

if (!yaTieneProductos) {
  const insertarProducto = db.prepare(`
    INSERT INTO productos (nombre, categoria, sku, costo_unitario, precio_venta, stock_actual, stock_minimo, ambiente_id, distribuidor_id)
    VALUES (@nombre, @categoria, @sku, @costo_unitario, @precio_venta, @stock_actual, @stock_minimo, @ambiente_id, @distribuidor_id)
  `);

  const productos = [
    { nombre: 'Camiseta clásica', categoria: 'Camisetas', sku: 'CAM-CLA-001', costo_unitario: 30000, precio_venta: 55000, stock_actual: 20, stock_minimo: 5, ambiente_id: idBodega, distribuidor_id: idDistribuidor },
    { nombre: 'Camiseta oversize', categoria: 'Camisetas', sku: 'CAM-OVE-001', costo_unitario: 40000, precio_venta: 85000, stock_actual: 15, stock_minimo: 5, ambiente_id: idBodega, distribuidor_id: idDistribuidor },
  ];

  const insertarMuchos = db.transaction((filas) => {
    for (const fila of filas) insertarProducto.run(fila);
  });

  insertarMuchos(productos);
  console.log('Productos de ejemplo insertados.');
} else {
  console.log('Ya hay productos, no se insertó nada.');
}
