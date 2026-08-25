const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// En producción la base vive en un disco montado aparte del código, y su
// ruta llega por DATA_DIR. Sin esa variable se usa backend/data, que es
// donde ha estado siempre en local.
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'inventario.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Migraciones simples: agregan columnas nuevas a bases de datos que ya
// existían antes de que existiera esa columna. `CREATE TABLE IF NOT EXISTS`
// no altera tablas ya creadas, así que hace falta este paso aparte.
function tieneColumna(tabla, columna) {
  return db.prepare(`PRAGMA table_info(${tabla})`).all().some((c) => c.name === columna);
}

if (!tieneColumna('productos', 'ambiente_id')) {
  db.exec('ALTER TABLE productos ADD COLUMN ambiente_id INTEGER REFERENCES ambientes(id)');
}
if (!tieneColumna('productos', 'distribuidor_id')) {
  db.exec('ALTER TABLE productos ADD COLUMN distribuidor_id INTEGER REFERENCES distribuidores(id)');
}
if (!tieneColumna('productos', 'orden')) {
  db.exec('ALTER TABLE productos ADD COLUMN orden INTEGER NOT NULL DEFAULT 0');
}

module.exports = db;
