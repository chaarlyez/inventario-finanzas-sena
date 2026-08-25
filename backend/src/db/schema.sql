-- Esquema de la base de datos del proyecto
-- Inventario + entradas/salidas de dinero + rentabilidad

CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  categoria TEXT,
  sku TEXT UNIQUE,
  costo_unitario REAL NOT NULL DEFAULT 0,
  precio_venta REAL NOT NULL DEFAULT 0,
  stock_actual INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cada entrada/salida de STOCK (unidades de producto)
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  motivo TEXT,
  fecha TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cada entrada/salida de DINERO (ventas, compras de insumos, gastos, etc.)
CREATE TABLE IF NOT EXISTS movimientos_dinero (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  categoria TEXT NOT NULL,
  monto REAL NOT NULL CHECK (monto > 0),
  descripcion TEXT,
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER,
  fecha TEXT NOT NULL DEFAULT (datetime('now'))
);
