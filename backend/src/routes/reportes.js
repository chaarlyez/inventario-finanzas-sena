const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/reportes/resumen - totales generales de dinero
router.get('/resumen', (req, res) => {
  const ingresos = db.prepare("SELECT COALESCE(SUM(monto), 0) AS total FROM movimientos_dinero WHERE tipo = 'ingreso'").get().total;
  const egresos = db.prepare("SELECT COALESCE(SUM(monto), 0) AS total FROM movimientos_dinero WHERE tipo = 'egreso'").get().total;
  const valorInventario = db.prepare('SELECT COALESCE(SUM(costo_unitario * stock_actual), 0) AS total FROM productos').get().total;

  res.json({
    ingresos_totales: ingresos,
    egresos_totales: egresos,
    balance: ingresos - egresos,
    valor_inventario_actual: valorInventario,
  });
});

// GET /api/reportes/rentabilidad - rentabilidad por producto, a partir de lo vendido
// (ventas = movimientos_dinero de tipo ingreso, categoria 'venta', asociadas a un producto)
router.get('/rentabilidad', (req, res) => {
  const productos = db.prepare('SELECT * FROM productos').all();

  const ventasPorProducto = db.prepare(`
    SELECT producto_id, COALESCE(SUM(cantidad), 0) AS unidades_vendidas, COALESCE(SUM(monto), 0) AS ingresos
    FROM movimientos_dinero
    WHERE tipo = 'ingreso' AND categoria = 'venta' AND producto_id IS NOT NULL
    GROUP BY producto_id
  `).all();

  const ventasMap = Object.fromEntries(ventasPorProducto.map((v) => [v.producto_id, v]));

  const rentabilidad = productos.map((p) => {
    const ventas = ventasMap[p.id] || { unidades_vendidas: 0, ingresos: 0 };
    const costoVendido = ventas.unidades_vendidas * p.costo_unitario;
    const utilidad = ventas.ingresos - costoVendido;
    const margenPct = ventas.ingresos > 0 ? (utilidad / ventas.ingresos) * 100 : null;

    return {
      producto_id: p.id,
      nombre: p.nombre,
      unidades_vendidas: ventas.unidades_vendidas,
      ingresos: ventas.ingresos,
      costo_vendido: costoVendido,
      utilidad,
      margen_porcentaje: margenPct,
    };
  });

  res.json(rentabilidad);
});

module.exports = router;
