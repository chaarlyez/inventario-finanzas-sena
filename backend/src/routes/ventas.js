const express = require('express');
const db = require('../db/db');

const router = express.Router();

// POST /api/ventas - registrar una venta: saca stock del producto Y registra
// el ingreso de dinero correspondiente, en una sola operación atómica.
// (Antes esto requería dos pasos separados —salida de stock + ingreso de
// dinero— que podían quedar desincronizados si el segundo paso se olvidaba).
router.post('/', (req, res) => {
  const { producto_id, cantidad, precio_unitario, descripcion } = req.body;

  if (!producto_id || !cantidad) {
    return res.status(400).json({ error: 'producto_id y cantidad son obligatorios' });
  }
  if (cantidad <= 0) {
    return res.status(400).json({ error: 'cantidad debe ser mayor que 0' });
  }

  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(producto_id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  if (producto.stock_actual < cantidad) {
    return res.status(400).json({ error: `Stock insuficiente. Stock actual: ${producto.stock_actual}` });
  }

  const precio = precio_unitario != null ? Number(precio_unitario) : producto.precio_venta;
  if (Number.isNaN(precio) || precio < 0) {
    return res.status(400).json({ error: 'precio_unitario inválido' });
  }
  const monto = precio * cantidad;

  const registrar = db.transaction(() => {
    const movInv = db.prepare(`
      INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo)
      VALUES (?, 'salida', ?, 'venta')
    `).run(producto_id, cantidad);

    db.prepare('UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?').run(cantidad, producto_id);

    const movDin = db.prepare(`
      INSERT INTO movimientos_dinero (tipo, categoria, monto, descripcion, producto_id, cantidad)
      VALUES ('ingreso', 'venta', ?, ?, ?, ?)
    `).run(monto, descripcion || null, producto_id, cantidad);

    return { movInvId: movInv.lastInsertRowid, movDinId: movDin.lastInsertRowid };
  });

  const { movInvId, movDinId } = registrar();

  const movimientoInventario = db.prepare(`
    SELECT mi.*, p.nombre AS producto_nombre
    FROM movimientos_inventario mi JOIN productos p ON p.id = mi.producto_id
    WHERE mi.id = ?
  `).get(movInvId);

  const movimientoDinero = db.prepare(`
    SELECT md.*, p.nombre AS producto_nombre
    FROM movimientos_dinero md LEFT JOIN productos p ON p.id = md.producto_id
    WHERE md.id = ?
  `).get(movDinId);

  res.status(201).json({ movimiento_inventario: movimientoInventario, movimiento_dinero: movimientoDinero });
});

module.exports = router;
