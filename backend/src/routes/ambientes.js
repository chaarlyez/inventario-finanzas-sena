const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/ambientes - listar, con cantidad de productos y stock por ambiente
router.get('/', (req, res) => {
  const ambientes = db.prepare(`
    SELECT a.*,
      COUNT(p.id) AS total_productos,
      COALESCE(SUM(p.stock_actual), 0) AS stock_total
    FROM ambientes a
    LEFT JOIN productos p ON p.ambiente_id = a.id
    GROUP BY a.id
    ORDER BY a.nombre
  `).all();
  res.json(ambientes);
});

router.get('/:id', (req, res) => {
  const ambiente = db.prepare('SELECT * FROM ambientes WHERE id = ?').get(req.params.id);
  if (!ambiente) return res.status(404).json({ error: 'Ambiente no encontrado' });
  res.json(ambiente);
});

router.post('/', (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });

  try {
    const info = db.prepare('INSERT INTO ambientes (nombre, descripcion) VALUES (?, ?)').run(nombre, descripcion || null);
    res.status(201).json(db.prepare('SELECT * FROM ambientes WHERE id = ?').get(info.lastInsertRowid));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ error: 'Ya existe un ambiente con ese nombre' });
    throw err;
  }
});

router.put('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM ambientes WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Ambiente no encontrado' });

  const nombre = req.body.nombre ?? existente.nombre;
  const descripcion = req.body.descripcion !== undefined ? req.body.descripcion : existente.descripcion;

  try {
    db.prepare('UPDATE ambientes SET nombre = ?, descripcion = ? WHERE id = ?').run(nombre, descripcion, req.params.id);
    res.json(db.prepare('SELECT * FROM ambientes WHERE id = ?').get(req.params.id));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(400).json({ error: 'Ya existe un ambiente con ese nombre' });
    throw err;
  }
});

router.delete('/:id', (req, res) => {
  const existente = db.prepare('SELECT * FROM ambientes WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ error: 'Ambiente no encontrado' });

  const enUso = db.prepare('SELECT 1 FROM productos WHERE ambiente_id = ? LIMIT 1').get(req.params.id);
  if (enUso) return res.status(400).json({ error: 'No se puede eliminar: hay productos asignados a este ambiente.' });

  db.prepare('DELETE FROM ambientes WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
