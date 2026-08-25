const express = require('express');
const db = require('../db/db');

const router = express.Router();

const SELECT_CON_RELACIONES = `
  SELECT p.*, a.nombre AS ambiente_nombre, d.nombre AS distribuidor_nombre
  FROM productos p
  LEFT JOIN ambientes a ON a.id = p.ambiente_id
  LEFT JOIN distribuidores d ON d.id = p.distribuidor_id
`;

// GET /api/productos - listar todos los productos
router.get('/', (req, res) => {
  // `orden` manda; el nombre solo desempata entre productos sin posición.
  const productos = db.prepare(`${SELECT_CON_RELACIONES} ORDER BY p.orden, p.nombre`).all();
  res.json(productos);
});

// GET /api/productos/:id - un producto puntual
router.get('/:id', (req, res) => {
  const producto = db.prepare(`${SELECT_CON_RELACIONES} WHERE p.id = ?`).get(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

// POST /api/productos - crear producto
router.post('/', (req, res) => {
  const { nombre, categoria, sku, costo_unitario, precio_venta, stock_actual, stock_minimo, ambiente_id, distribuidor_id } = req.body;

  if (!nombre || costo_unitario == null || precio_venta == null) {
    return res.status(400).json({ error: 'nombre, costo_unitario y precio_venta son obligatorios' });
  }

  // Sin posición explícita, un producto nuevo se coloca al final del
  // catálogo. Con el valor por defecto 0 se colaría antes de todo.
  const siguienteOrden = (db.prepare('SELECT MAX(orden) AS m FROM productos').get().m || 0) + 1;

  const info = db.prepare(`
    INSERT INTO productos (nombre, categoria, sku, costo_unitario, precio_venta, stock_actual, stock_minimo, ambiente_id, distribuidor_id, orden)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(nombre, categoria || null, sku || null, costo_unitario, precio_venta, stock_actual || 0, stock_minimo || 0, ambiente_id || null, distribuidor_id || null, siguienteOrden);

  const nuevo = db.prepare(`${SELECT_CON_RELACIONES} WHERE p.id = ?`).get(info.lastInsertRowid);
  res.status(201).json(nuevo);
});

// PUT /api/productos/:id - editar producto
router.put('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Producto no encontrado' });

  const datos = { ...existente, ...req.body };

  db.prepare(`
    UPDATE productos
    SET nombre = ?, categoria = ?, sku = ?, costo_unitario = ?, precio_venta = ?, stock_actual = ?, stock_minimo = ?,
        ambiente_id = ?, distribuidor_id = ?
    WHERE id = ?
  `).run(
    datos.nombre, datos.categoria, datos.sku, datos.costo_unitario, datos.precio_venta, datos.stock_actual, datos.stock_minimo,
    datos.ambiente_id || null, datos.distribuidor_id || null, req.params.id,
  );

  const actualizado = db.prepare(`${SELECT_CON_RELACIONES} WHERE p.id = ?`).get(req.params.id);
  res.json(actualizado);
});

// DELETE /api/productos/:id
router.delete('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Producto no encontrado' });

  const tieneMovInventario = db.prepare('SELECT 1 FROM movimientos_inventario WHERE producto_id = ? LIMIT 1').get(req.params.id);
  const tieneMovDinero = db.prepare('SELECT 1 FROM movimientos_dinero WHERE producto_id = ? LIMIT 1').get(req.params.id);
  if (tieneMovInventario || tieneMovDinero) {
    return res.status(400).json({ error: 'No se puede eliminar: el producto tiene movimientos de inventario o de dinero registrados.' });
  }

  db.prepare('DELETE FROM productos WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
