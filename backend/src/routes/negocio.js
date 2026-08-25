const express = require('express');
const db = require('../db/db');
const { requiereAdministrador } = require('../middleware/auth');

const router = express.Router();

// La tabla `negocio` guarda una sola fila (id = 1) con los datos de la
// tienda. Se crea vacía la primera vez que alguien la consulta, para que el
// frontend siempre reciba un objeto con la misma forma.
const CAMPOS = ['nombre', 'nit', 'direccion', 'ciudad', 'telefono', 'email', 'moneda', 'notas'];

function obtenerNegocio() {
  let fila = db.prepare('SELECT * FROM negocio WHERE id = 1').get();
  if (!fila) {
    db.prepare("INSERT INTO negocio (id, moneda) VALUES (1, 'COP')").run();
    fila = db.prepare('SELECT * FROM negocio WHERE id = 1').get();
  }
  return fila;
}

// GET /api/negocio - cualquier usuario con sesión puede leer los datos:
// aparecen en reportes y en el encabezado de la aplicación.
router.get('/', (req, res) => {
  res.json(obtenerNegocio());
});

// PUT /api/negocio - solo un administrador puede cambiarlos.
router.put('/', requiereAdministrador, (req, res) => {
  const actual = obtenerNegocio();

  const nombre = req.body.nombre !== undefined ? String(req.body.nombre).trim() : actual.nombre;
  if (nombre !== null && nombre !== undefined && nombre.length > 120) {
    return res.status(400).json({ error: 'El nombre no puede superar los 120 caracteres' });
  }

  const email = req.body.email !== undefined ? String(req.body.email).trim() : actual.email;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'El correo no tiene un formato válido' });
  }

  // Se toma el valor nuevo cuando viene en el cuerpo y el actual cuando no,
  // para que un formulario parcial no borre campos que no tocó.
  const datos = {};
  CAMPOS.forEach((campo) => {
    const valor = req.body[campo] !== undefined ? req.body[campo] : actual[campo];
    datos[campo] = valor === '' || valor === null || valor === undefined ? null : String(valor).trim();
  });
  datos.nombre = nombre || null;
  datos.email = email || null;

  db.prepare(`
    UPDATE negocio
    SET nombre = ?, nit = ?, direccion = ?, ciudad = ?, telefono = ?, email = ?,
        moneda = ?, notas = ?, actualizado_en = datetime('now')
    WHERE id = 1
  `).run(
    datos.nombre, datos.nit, datos.direccion, datos.ciudad,
    datos.telefono, datos.email, datos.moneda || 'COP', datos.notas,
  );

  res.json(db.prepare('SELECT * FROM negocio WHERE id = 1').get());
});

module.exports = router;
