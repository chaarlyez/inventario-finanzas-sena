const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', '..', 'data');
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

module.exports = db;
