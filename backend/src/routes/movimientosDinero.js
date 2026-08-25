const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/movimientos-dinero - listar entradas y salidas de dinero
router.get('/', (req, res) => {
  const movimientos = db.prepare(`
    SELECT md.*, p.nombre AS producto_nombre
    FROM movimientos_dinero md
    LEFT JOIN productos p ON p.id = md.producto_id
    ORDER BY md.fecha DESC, md.id DESC
  `).all();
  res.json(movimientos);
});

// POST /api/movimientos-dinero - registrar ingreso o egreso de dinero
router.post('/', (req, res) => {
  const { tipo, categoria, monto, descripcion, producto_id, cantidad } = req.body;

  if (!tipo || !categoria || !monto) {
    return res.status(400).json({ error: 'tipo, categoria y monto son obligatorios' });
  }
  if (!['ingreso', 'egreso'].includes(tipo)) {
    return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
  }
  if (monto <= 0) {
    return res.status(400).json({ error: 'monto debe ser mayor que 0' });
  }

  const info = db.prepare(`
    INSERT INTO movimientos_dinero (tipo, categoria, monto, descripcion, producto_id, cantidad)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(tipo, categoria, monto, descripcion || null, producto_id || null, cantidad || null);

  const movimiento = db.prepare(`
    SELECT md.*, p.nombre AS producto_nombre
    FROM movimientos_dinero md
    LEFT JOIN productos p ON p.id = md.producto_id
    WHERE md.id = ?
  `).get(info.lastInsertRowid);

  res.status(201).json(movimiento);
});

module.exports = router;
