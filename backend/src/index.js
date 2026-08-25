const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth');
const usuariosRouter = require('./routes/usuarios');
const ambientesRouter = require('./routes/ambientes');
const distribuidoresRouter = require('./routes/distribuidores');
const productosRouter = require('./routes/productos');
const movimientosInventarioRouter = require('./routes/movimientosInventario');
const movimientosDineroRouter = require('./routes/movimientosDinero');
const reportesRouter = require('./routes/reportes');
const negocioRouter = require('./routes/negocio');
const ventasRouter = require('./routes/ventas');
const { cargarUsuario, requiereSesion } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cargarUsuario);

app.get('/api/salud', (req, res) => res.json({ ok: true }));

// Autenticación: login/logout son públicos, "yo" depende de si hay sesión.
app.use('/api/auth', authRouter);

// El resto del API exige sesión iniciada.
app.use('/api/usuarios', requiereSesion, usuariosRouter);
app.use('/api/ambientes', requiereSesion, ambientesRouter);
app.use('/api/distribuidores', requiereSesion, distribuidoresRouter);
app.use('/api/productos', requiereSesion, productosRouter);
app.use('/api/movimientos-inventario', requiereSesion, movimientosInventarioRouter);
app.use('/api/movimientos-dinero', requiereSesion, movimientosDineroRouter);
app.use('/api/reportes', requiereSesion, reportesRouter);
app.use('/api/negocio', requiereSesion, negocioRouter);
app.use('/api/ventas', requiereSesion, ventasRouter);

// Frontend estático (las páginas se sirven siempre; lo que protege los
// datos es el API. El frontend redirige a login.html si no hay sesión).
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
