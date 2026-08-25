// Datos de ejemplo para poder probar la app de una vez.
// Basados (con valores de ejemplo) en el catálogo real de la marca "a lo maldita sea".
const db = require('./db');

const yaTieneDatos = db.prepare('SELECT COUNT(*) AS n FROM productos').get().n > 0;

if (!yaTieneDatos) {
  const insertarProducto = db.prepare(`
    INSERT INTO productos (nombre, categoria, sku, costo_unitario, precio_venta, stock_actual, stock_minimo)
    VALUES (@nombre, @categoria, @sku, @costo_unitario, @precio_venta, @stock_actual, @stock_minimo)
  `);

  const productos = [
    { nombre: 'Camiseta clásica', categoria: 'Camisetas', sku: 'CAM-CLA-001', costo_unitario: 30000, precio_venta: 55000, stock_actual: 20, stock_minimo: 5 },
    { nombre: 'Camiseta oversize', categoria: 'Camisetas', sku: 'CAM-OVE-001', costo_unitario: 40000, precio_venta: 85000, stock_actual: 15, stock_minimo: 5 },
  ];

  const insertarMuchos = db.transaction((filas) => {
    for (const fila of filas) insertarProducto.run(fila);
  });

  insertarMuchos(productos);
  console.log('Datos de ejemplo insertados.');
} else {
  console.log('Ya hay datos, no se insertó nada.');
}
