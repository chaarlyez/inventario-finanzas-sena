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

function setCookieSesion(res, token) {
  res.cookie(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: DURACION_SESION_MS,
  });
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(String(email).toLowerCase().trim());
  if (!usuario || !bcrypt.compareSync(password, usuario.password_hash)) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

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
