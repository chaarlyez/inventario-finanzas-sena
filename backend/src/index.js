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

const EN_PRODUCCION = process.env.NODE_ENV === 'production';

// Detrás del proxy de la plataforma, para que req.ip sea la IP real del
// visitante y no la del proxy (lo usa el freno de intentos de login).
if (EN_PRODUCCION) app.set('trust proxy', 1);

// En producción el mismo servidor entrega el frontend y el API, así que
// no hay peticiones entre orígenes y CORS no hace falta. Dejarlo abierto
// con `credentials: true` permitiría que cualquier web hiciera peticiones
// autenticadas en nombre de quien tenga la sesión abierta.
if (!EN_PRODUCCION) {
  app.use(cors({ origin: true, credentials: true }));
}
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

// 0.0.0.0 explícito: en un contenedor hay que escuchar en todas las
// interfaces para que la plataforma pueda enrutar el tráfico.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
