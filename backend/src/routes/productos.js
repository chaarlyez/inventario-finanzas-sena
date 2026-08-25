const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/productos - listar todos los productos
router.get('/', (req, res) => {
  const productos = db.prepare('SELECT * FROM productos ORDER BY nombre').all();
  res.json(productos);
});

// GET /api/productos/:id - un producto puntual
router.get('/:id', (req, res) => {
  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

// POST /api/productos - crear producto
router.post('/', (req, res) => {
  const { nombre, categoria, sku, costo_unitario, precio_venta, stock_actual, stock_minimo } = req.body;

  if (!nombre || costo_unitario == null || precio_venta == null) {
    return res.status(400).json({ error: 'nombre, costo_unitario y precio_venta son obligatorios' });
  }

  const info = db.prepare(`
    INSERT INTO productos (nombre, categoria, sku, costo_unitario, precio_venta, stock_actual, stock_minimo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(nombre, categoria || null, sku || null, costo_unitario, precio_venta, stock_actual || 0, stock_minimo || 0);

  const nuevo = db.prepare('SELECT * FROM productos WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(nuevo);
});

// PUT /api/productos/:id - editar producto
router.put('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Producto no encontrado' });

  const datos = { ...existente, ...req.body };

  db.prepare(`
    UPDATE productos
    SET nombre = ?, categoria = ?, sku = ?, costo_unitario = ?, precio_venta = ?, stock_actual = ?, stock_minimo = ?
    WHERE id = ?
  `).run(datos.nombre, datos.categoria, datos.sku, datos.costo_unitario, datos.precio_venta, datos.stock_actual, datos.stock_minimo, req.params.id);

  const actualizado = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  res.json(actualizado);
});

// DELETE /api/productos/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM productos WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.status(204).send();
});

module.exports = router;
