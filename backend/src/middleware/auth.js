const db = require('../db/db');

const NOMBRE_COOKIE = 'sesion';

// Se ejecuta en todas las peticiones: si hay una cookie de sesión válida y
// no vencida, cuelga el usuario en req.usuario. Nunca bloquea la petición.
function cargarUsuario(req, res, next) {
  const token = req.cookies?.[NOMBRE_COOKIE];
  if (token) {
    const fila = db.prepare(`
      SELECT u.* FROM sesiones s
      JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.token = ? AND s.expira_en > datetime('now')
    `).get(token);
    if (fila) req.usuario = fila;
  }
  next();
}

// Para rutas protegidas: exige que cargarUsuario ya haya encontrado sesión.
function requiereSesion(req, res, next) {
  if (!req.usuario) return res.status(401).json({ error: 'Debes iniciar sesión' });
  next();
}

// Para rutas que solo el administrador puede usar (gestión de usuarios).
function requiereAdministrador(req, res, next) {
  if (!req.usuario) return res.status(401).json({ error: 'Debes iniciar sesión' });
  if (req.usuario.rol !== 'administrador') return res.status(403).json({ error: 'Solo un administrador puede hacer esto' });
  next();
}

module.exports = { cargarUsuario, requiereSesion, requiereAdministrador, NOMBRE_COOKIE };
