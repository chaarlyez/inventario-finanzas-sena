const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/distribuidores - listar, con cantidad de productos que le compran a cada uno
router.get('/', (req, res) => {
  const distribuidores = db.prepare(`
    SELECT d.*, COUNT(p.id) AS total_productos
    FROM distribuidores d
    LEFT JOIN productos p ON p.distribuidor_id = d.id
    GROUP BY d.id
    ORDER BY d.nombre
  `).all();
  res.json(distribuidores);
});

router.get('/:id', (req, res) => {
  const distribuidor = db.prepare('SELECT * FROM distribuidores WHERE id = ?').get(req.params.id);
  if (!distribuidor) return res.status(404).json({ error: 'Distribuidor no encontrado' });
  res.json(distribuidor);
});

router.post('/', (req, res) => {
  const { nombre, contacto, telefono, email, notas } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });

  const info = db.prepare(`
    INSERT INTO distribuidores (nombre, contacto, telefono, email, notas)
    VALUES (?, ?, ?, ?, ?)
  `).run(nombre, contacto || null, telefono || null, email || null, notas || null);

  res.status(201).json(db.prepare('SELECT * FROM distribuidores WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM distribuidores WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Distribuidor no encontrado' });

  const datos = { ...existente, ...req.body };
  db.prepare(`
    UPDATE distribuidores SET nombre = ?, contacto = ?, telefono = ?, email = ?, notas = ?
    WHERE id = ?
  `).run(datos.nombre, datos.contacto, datos.telefono, datos.email, datos.notas, req.params.id);

  res.json(db.prepare('SELECT * FROM distribuidores WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM distribuidores WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Distribuidor no encontrado' });

  const enUso = db.prepare('SELECT 1 FROM productos WHERE distribuidor_id = ? LIMIT 1').get(req.params.id);
  if (enUso) return res.status(400).json({ error: 'No se puede eliminar: hay productos asociados a este distribuidor.' });

  db.prepare('DELETE FROM distribuidores WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
