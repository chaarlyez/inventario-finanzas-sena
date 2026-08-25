const path = require('path');
const express = require('express');
const cors = require('cors');

const productosRouter = require('./routes/productos');
const movimientosInventarioRouter = require('./routes/movimientosInventario');
const movimientosDineroRouter = require('./routes/movimientosDinero');
const reportesRouter = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API
app.use('/api/productos', productosRouter);
app.use('/api/movimientos-inventario', movimientosInventarioRouter);
app.use('/api/movimientos-dinero', movimientosDineroRouter);
app.use('/api/reportes', reportesRouter);

app.get('/api/salud', (req, res) => res.json({ ok: true }));

// Frontend estático
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Manejador de errores: cualquier error no controlado responde en JSON
// (si no, Express devuelve HTML y el frontend no puede leer el mensaje).
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
