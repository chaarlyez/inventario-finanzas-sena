const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/db');
const { requiereAdministrador } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de usuarios son solo para administradores.
router.use(requiereAdministrador);

function sinPassword(usuario) {
  const { password_hash, ...resto } = usuario;
  return resto;
}

router.get('/', (req, res) => {
  const usuarios = db.prepare('SELECT * FROM usuarios ORDER BY nombre').all();
  res.json(usuarios.map(sinPassword));
});

router.post('/', (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  if (rol && !['administrador', 'colaborador'].includes(rol)) {
    return res.status(400).json({ error: "rol debe ser 'administrador' o 'colaborador'" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare(`
      INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)
    `).run(nombre, String(email).toLowerCase().trim(), passwordHash, rol || 'colaborador');
    res.status(201).json(sinPassword(db.prepare('SELECT * FROM usuarios WHERE id = ?').get(info.lastInsertRowid)));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ error: 'Ya existe un usuario con ese correo' });
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { nombre, email, password, rol } = req.body;

  if (rol && !['administrador', 'colaborador'].includes(rol)) {
    return res.status(400).json({ error: "rol debe ser 'administrador' o 'colaborador'" });
  }
  if (rol === 'colaborador' && existente.rol === 'administrador') {
    const otrosAdmins = db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'administrador' AND id != ?").get(req.params.id).n;
    if (otrosAdmins === 0) return res.status(400).json({ error: 'Debe quedar al menos un administrador' });
  }

  const passwordHash = password ? bcrypt.hashSync(password, 10) : existente.password_hash;
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    db.prepare(`
      UPDATE usuarios SET nombre = ?, email = ?, password_hash = ?, rol = ? WHERE id = ?
    `).run(
      nombre ?? existente.nombre,
      email ? String(email).toLowerCase().trim() : existente.email,
      passwordHash,
      rol || existente.rol,
      req.params.id,
    );
    res.json(sinPassword(db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id)));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ error: 'Ya existe un usuario con ese correo' });
    throw err;
  }
});

router.delete('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (req.usuario.id === existente.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada.' });
  }
  if (existente.rol === 'administrador') {
    const otrosAdmins = db.prepare("SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'administrador' AND id != ?").get(req.params.id).n;
    if (otrosAdmins === 0) return res.status(400).json({ error: 'Debe quedar al menos un administrador' });
  }

  db.prepare('DELETE FROM sesiones WHERE usuario_id = ?').run(req.params.id);
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
