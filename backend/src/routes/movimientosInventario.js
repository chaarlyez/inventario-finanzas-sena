const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/movimientos-inventario - listar movimientos de stock, con nombre del producto
router.get('/', (req, res) => {
  const movimientos = db.prepare(`
    SELECT mi.*, p.nombre AS producto_nombre
    FROM movimientos_inventario mi
    JOIN productos p ON p.id = mi.producto_id
    ORDER BY mi.fecha DESC, mi.id DESC
  `).all();
  res.json(movimientos);
});

// POST /api/movimientos-inventario - registrar entrada o salida de stock
// Actualiza automáticamente el stock_actual del producto.
router.post('/', (req, res) => {
  const { producto_id, tipo, cantidad, motivo } = req.body;

  if (!producto_id || !tipo || !cantidad) {
    return res.status(400).json({ error: 'producto_id, tipo y cantidad son obligatorios' });
  }
  if (!['entrada', 'salida'].includes(tipo)) {
    return res.status(400).json({ error: "tipo debe ser 'entrada' o 'salida'" });
  }
  if (cantidad <= 0) {
    return res.status(400).json({ error: 'cantidad debe ser mayor que 0' });
  }

  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(producto_id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  if (tipo === 'salida' && producto.stock_actual < cantidad) {
    return res.status(400).json({ error: `Stock insuficiente. Stock actual: ${producto.stock_actual}` });
  }

  const registrar = db.transaction(() => {
    const info = db.prepare(`
      INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo)
      VALUES (?, ?, ?, ?)
    `).run(producto_id, tipo, cantidad, motivo || null);

    const delta = tipo === 'entrada' ? cantidad : -cantidad;
    db.prepare('UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?').run(delta, producto_id);

    return info.lastInsertRowid;
  });

  const id = registrar();
  const movimiento = db.prepare(`
    SELECT mi.*, p.nombre AS producto_nombre
    FROM movimientos_inventario mi
    JOIN productos p ON p.id = mi.producto_id
    WHERE mi.id = ?
  `).get(id);

  res.status(201).json(movimiento);
});

module.exports = router;
