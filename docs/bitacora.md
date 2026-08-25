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
- Se detectó que "Registrar salida" no tenía sentido como la acción rápida
  principal: sacaba stock pero no registraba el ingreso de la venta, así que
  quedaban desincronizados si no se hacía el paso de dinero aparte. Se
  reemplazó por **"Registrar venta"**, respaldado por un endpoint nuevo
  (`POST /api/ventas`, ver `modelo-datos.md`) que descuenta stock y registra
  el ingreso en una sola transacción. La salida de stock "manual" se dejó
  disponible en la tabla de Productos para casos que no son venta (pérdida,
  ajuste).
- Se cambió el nombre de la app en la interfaz de "Inventario SENA" a
  **Stokio** (logo, título de pestañas, tarjeta lateral); `docs/` y el
  README siguen hablando del proyecto SENA porque eso sí es correcto.
- Se reemplazó el menú hamburguesa + panel lateral en móvil por una barra de
  navegación inferior flotante (estilo app), con los accesos principales y un
  botón "Más" para el resto.
- **Rediseño de marca "Stokio" y ampliación grande de alcance** (mismo día,
  sesión larga): Charly trajo una guía de diseño completa de la marca Stokio
  más un mockup con secciones de otro proyecto suyo (inventario de equipos:
  Ambientes, Préstamos, Usuarios). Se acordó implementar todo excepto
  Préstamos, reemplazado por **Distribuidores**. Quedó:
  - Sistema visual reescrito por completo siguiendo la guía: paleta morada
    `#6D28D9`, tipografía Inter (con degradación a fuentes del sistema si no
    hay internet), radios/sombras/espaciado de la guía, foco visible en
    todos los campos.
  - **Autenticación real**: login con correo/contraseña, sesiones por cookie
    (`usuarios` + `sesiones`, contraseñas con bcrypt), roles administrador/
    colaborador. Todo el API (menos login y `/salud`) exige sesión. Esto
    revierte el "fuera de alcance" que tenía `requisitos.md` sobre
    autenticación.
  - Módulos nuevos con CRUD completo: **Ambientes** (ubicaciones del
    inventario), **Distribuidores** (proveedores) y **Usuarios** (solo
    administrador; no se puede eliminar la propia cuenta ni quedarse sin
    ningún administrador).
  - Productos ahora puede asignarse a un ambiente y a un distribuidor;
    ninguno de los dos se puede borrar si tiene productos asociados
    (mismo patrón de protección por llave foránea que ya existía).
  - Nueva página **Inventario** (`movimientos-stock.html`): historial
    completo de entradas/salidas/ventas, separado de **Productos**
    (catálogo), con sus propias tarjetas de resumen y filtros.
  - **Escáner de código**: botón en la barra superior que abre la cámara
    (API `BarcodeDetector`, cuando el navegador la soporta) o permite
    escribir el SKU a mano; encuentra el producto y abre su detalle.
  - **Panel de detalle de producto** (drawer): specs completas, código
    interno, línea de tiempo de sus últimos movimientos, y accesos directos
    para vender/entrada/salida/editar.
  - Quedó pendiente, a propósito: generar una imagen de QR descargable/
    imprimible por producto. Hacerlo bien requiere un encoder QR real, y no
    hubo forma confiable de conseguir uno ya probado sin arriesgar un QR
    que no escanee de verdad — se prefirió no fingir esa función. Ver
    `planeacion.md`.
  - Probado con Playwright de punta a punta: login/logout, bloqueo sin
    sesión, CRUD de ambientes/distribuidores/usuarios (con sus reglas de
    negocio: no borrar en uso, no quedarse sin administrador, no auto-
    eliminarse), producto con ambiente/distribuidor, filtro por ambiente,
    escáner por código manual, y el menú "Más" en móvil.
