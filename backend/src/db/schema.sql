-- Esquema de la base de datos del proyecto
-- Inventario + entradas/salidas de dinero + rentabilidad

-- Ubicaciones físicas donde se guarda el inventario (bodega, tienda, etc.)
CREATE TABLE IF NOT EXISTS ambientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Datos de la tienda/negocio. Una sola fila (id = 1): son los datos de
-- cabecera que salen en reportes y en la aplicación.
CREATE TABLE IF NOT EXISTS negocio (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  nombre TEXT,
  nit TEXT,
  direccion TEXT,
  ciudad TEXT,
  telefono TEXT,
  email TEXT,
  moneda TEXT NOT NULL DEFAULT 'COP',
  notas TEXT,
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Proveedores/fabricantes a los que se les compra el inventario
CREATE TABLE IF NOT EXISTS distribuidores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  notas TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cuentas que pueden entrar a la aplicación
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'administrador' CHECK (rol IN ('administrador', 'colaborador')),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sesiones activas (token de la cookie de sesión)
CREATE TABLE IF NOT EXISTS sesiones (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  expira_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  categoria TEXT,
  sku TEXT UNIQUE,
  costo_unitario REAL NOT NULL DEFAULT 0,
  precio_venta REAL NOT NULL DEFAULT 0,
  stock_actual INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  ambiente_id INTEGER REFERENCES ambientes(id),
  distribuidor_id INTEGER REFERENCES distribuidores(id),
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
