# Bitácora de avance

> Registro corto de qué se hizo en cada sesión de trabajo, para que sea fácil seguir el progreso.

## 2026-08-25

- Se creó la estructura inicial del repositorio: `backend/`, `frontend/`, `docs/`.
- Se definió el modelo de datos: `productos`, `movimientos_inventario`, `movimientos_dinero`.
- Se construyó el backend (Node.js + Express + SQLite) con endpoints para productos, movimientos de inventario, movimientos de dinero y reportes.
- Se construyó un frontend básico (HTML/CSS/JS) con 4 páginas: dashboard, inventario, movimientos de dinero y reportes de rentabilidad.
- Se agregaron datos de ejemplo basados en el catálogo real de la marca "a lo maldita sea" (camiseta clásica y oversize, con sus costos y precios).
- Se documentó el proyecto: README, requisitos, modelo de datos y planeación.

## 2026-08-24

- Se arregló la instalación del backend: `better-sqlite3` quedó fijado en
  `^13.0.3` (la `^11.3.0` original no tenía binario precompilado para Node 24
  en Windows y no había Visual Studio Build Tools para compilarlo).
- Se rediseñó todo el frontend con un estilo de panel de administración
  (sidebar, tarjetas de estadísticas, gráfico de entradas/salidas, badges de
  estado) a partir de un mockup de referencia. Nuevo layout compartido
  (`js/layout.js`) con sidebar, barra superior con buscador y notificaciones,
  y un sistema de modales reutilizable.
- Se completó la gestión de productos desde la interfaz: crear, **editar y
  eliminar** (antes solo existía por API), con badges de categoría y de
  estado de stock (En stock / Stock bajo / Sin stock).
- Se agregó el historial de movimientos de stock a la vista de Productos
  (antes solo se podían registrar, no consultar desde el frontend).
- Se agregó una página de **Alertas** con el listado completo de productos
  sin stock y con stock bajo.
- Se agregaron filtros (categoría, estado) y buscador en Productos, Movimientos
  de dinero y Reportes.
- Se corrigió un bug real de backend encontrado al probar el borrado de
  productos: `DELETE /api/productos/:id` fallaba con error 500 si el producto
  tenía movimientos de inventario o de dinero asociados (violación de llave
  foránea). Ahora responde 400 con un mensaje claro en vez de romperse, y se
  agregó un manejador de errores genérico en Express para que cualquier
  fallo del servidor responda en JSON.
- Se dejaron fuera del rediseño los módulos de Categorías, Ubicaciones,
  Proveedores, Usuarios y Configuración que traía el mockup de referencia,
  por estar fuera del alcance definido en `requisitos.md`. Detalle en
  `planeacion.md`.
