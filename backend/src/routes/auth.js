const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db/db');
const { NOMBRE_COOKIE } = require('../middleware/auth');

const router = express.Router();

const DURACION_SESION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function crearSesion(usuarioId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiraEn = new Date(Date.now() + DURACION_SESION_MS).toISOString();
  db.prepare('INSERT INTO sesiones (token, usuario_id, expira_en) VALUES (?, ?, ?)').run(token, usuarioId, expiraEn);
  return { token, expiraEn };
}

const EN_PRODUCCION = process.env.NODE_ENV === 'production';

function setCookieSesion(res, token) {
  res.cookie(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    // En producción la aplicación va por HTTPS: sin esta marca el
    // navegador enviaría la cookie también por HTTP plano, donde
    // cualquiera en la misma red podría leerla. En local se deja en
    // false porque ahí no hay certificado.
    secure: EN_PRODUCCION,
    maxAge: DURACION_SESION_MS,
  });
}

// Freno sencillo a la fuerza bruta: cinco intentos fallidos por correo e
// IP, y quince minutos de espera. Se guarda en memoria porque la
// aplicación corre en un solo servidor.
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const intentos = new Map();

function claveIntento(req, email) {
  return `${req.ip}|${String(email || '').toLowerCase().trim()}`;
}

function estaBloqueado(clave) {
  const registro = intentos.get(clave);
  if (!registro) return 0;
  if (Date.now() > registro.hasta) {
    intentos.delete(clave);
    return 0;
  }
  return registro.fallos >= MAX_INTENTOS ? Math.ceil((registro.hasta - Date.now()) / 60000) : 0;
}

function anotarFallo(clave) {
  const registro = intentos.get(clave) || { fallos: 0, hasta: 0 };
  registro.fallos += 1;
  registro.hasta = Date.now() + BLOQUEO_MS;
  intentos.set(clave, registro);
}

function limpiarIntentos(clave) {
  intentos.delete(clave);
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const clave = claveIntento(req, email);
  const minutosRestantes = estaBloqueado(clave);
  if (minutosRestantes) {
    return res.status(429).json({
      error: `Demasiados intentos fallidos. Vuelve a intentarlo en ${minutosRestantes} minuto(s).`,
    });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(String(email).toLowerCase().trim());
  if (!usuario || !bcrypt.compareSync(password, usuario.password_hash)) {
    anotarFallo(clave);
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  // Un acierto borra el historial de fallos: si no, alguien que se
  // equivoca cuatro veces y luego entra seguiría a un fallo del bloqueo.
  limpiarIntentos(clave);

  const { token } = crearSesion(usuario.id);
  setCookieSesion(res, token);
  res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.cookies?.[NOMBRE_COOKIE];
  if (token) db.prepare('DELETE FROM sesiones WHERE token = ?').run(token);
  res.clearCookie(NOMBRE_COOKIE);
  res.status(204).send();
});

// GET /api/auth/yo - usuario de la sesión actual
router.get('/yo', (req, res) => {
  if (!req.usuario) return res.status(401).json({ error: 'No hay sesión activa' });
  const { id, nombre, email, rol } = req.usuario;
  res.json({ id, nombre, email, rol });
});

module.exports = router;
