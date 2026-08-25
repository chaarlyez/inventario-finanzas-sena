# Planeación

## Enfoque

El proyecto se construye en módulos pequeños y funcionales, para poder mostrar avance real desde la primera entrega en lugar de dejar todo para el final.

## Módulos

| # | Módulo                              | Incluye                                                                 | Estado        |
|---|--------------------------------------|--------------------------------------------------------------------------|---------------|
| 1 | Base del proyecto                    | Estructura del repo, documentación inicial, backend + base de datos, frontend básico | ✅ Hecho |
| 2 | Inventario                           | CRUD de productos, entradas/salidas de stock, alertas de stock mínimo   | ✅ Hecho (MVP) |
| 3 | Movimientos de dinero                | Registro de ingresos/egresos, categorías, historial                     | ✅ Hecho (MVP) |
| 4 | Reportes y rentabilidad              | Balance general, rentabilidad por producto, margen                      | ✅ Hecho (MVP) |
| 5 | Pulido y validaciones                | Rediseño visual (sidebar + dashboard), edición/eliminación de productos desde la interfaz, historial de movimientos de stock visible, página de alertas, filtros y buscador | 🔄 En progreso |
| 6 | Datos reales del negocio             | Cargar catálogo completo y movimientos reales de "a lo maldita sea"     | ⏳ Pendiente |
| 7 | Entrega final / mejoras según feedback de la profesora | Ajustes según retroalimentación del módulo evaluado en Figma/SENA | ⏳ Pendiente |

## Próximos pasos concretos

- [ ] Revisar la rúbrica/cuestionario específico que pida la profesora para esta entrega y ajustar este documento.
- [x] Agregar edición y eliminación de productos desde la interfaz (antes solo existía en el API).
- [ ] Agregar edición y eliminación de movimientos (de inventario y de dinero) desde la interfaz — hoy solo se pueden registrar y consultar, no corregir ni borrar.
- [ ] Agregar filtros por fecha en los reportes.
- [ ] Cargar el catálogo real completo de la marca (no solo los 2 productos de ejemplo).
- [ ] Definir si se necesita autenticación antes de la entrega final.

## Nota sobre el rediseño visual (2026-08-24)

Se rehizo el frontend con un estilo tipo panel de administración (sidebar +
tarjetas + gráfico), inspirado en un mockup que trajo Charly. Se mantuvieron
únicamente las secciones que el backend ya soporta de verdad: Dashboard,
Productos, Movimientos de dinero, Reportes y Alertas. El mockup original
incluía módulos de Categorías, Ubicaciones, Proveedores, Usuarios y
Configuración como entidades separadas; se dejaron fuera porque
`requisitos.md` los marca fuera de alcance (no hay autenticación/multiusuario
en este proyecto) y agregarlos habría implicado tablas y CRUDs nuevos sin
un requisito real detrás. Si la profesora pide alguno de esos módulos,
agregarlo implica: nueva tabla en `schema.sql`, rutas en `backend/src/routes/`
y una página más en el frontend siguiendo el mismo patrón que las actuales.

## Notas

Este proyecto es independiente del proyecto "Sena Stock" (inventario de equipos de cómputo) trabajado antes; no comparten código ni base de datos.
