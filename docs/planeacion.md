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
| 5 | Pulido y validaciones                | Rediseño visual (sidebar + dashboard), edición/eliminación de productos desde la interfaz, historial de movimientos de stock visible, página de alertas, filtros y buscador | ✅ Hecho |
| 6 | Rediseño de marca "Stokio"            | Sistema visual completo (paleta morada, tipografía Inter, componentes) siguiendo una guía de diseño; login y autenticación con roles; módulos de Ambientes, Distribuidores y Usuarios; búsqueda de producto por código (cámara o manual) | ✅ Hecho |
| 7 | Datos reales del negocio             | Cargar catálogo completo y movimientos reales de "a lo maldita sea"     | ⏳ Pendiente |
| 8 | Entrega final / mejoras según feedback de la profesora | Ajustes según retroalimentación del módulo evaluado en Figma/SENA | ⏳ Pendiente |

## Próximos pasos concretos

- [ ] Revisar la rúbrica/cuestionario específico que pida la profesora para esta entrega y ajustar este documento.
- [x] Agregar edición y eliminación de productos desde la interfaz (antes solo existía en el API).
- [ ] Agregar edición y eliminación de movimientos (de inventario y de dinero) desde la interfaz — hoy solo se pueden registrar y consultar, no corregir ni borrar.
- [ ] Agregar filtros por fecha en los reportes.
- [ ] Cargar el catálogo real completo de la marca (no solo los 2-3 productos de ejemplo).
- [x] Definir si se necesita autenticación antes de la entrega final → sí, se agregó (ver nota del 2026-08-24 más abajo).
- [ ] Cambiar la contraseña del usuario administrador de ejemplo (`charly@alomalditasea.co` / `stokio123`) por una real antes de usar la app con datos de verdad.
- [ ] Evaluar si vale la pena generar una imagen de código QR descargable/imprimible por producto (hoy el escáner solo *busca* un producto por su código, no genera uno).

## Nota sobre el rediseño visual (2026-08-24)

Se rehizo el frontend con un estilo tipo panel de administración (sidebar +
tarjetas + gráfico), inspirado en un mockup que trajo Charly. En ese momento
se mantuvieron únicamente las secciones que el backend ya soportaba de
verdad: Dashboard, Productos, Movimientos de dinero, Reportes y Alertas. El
mockup incluía módulos de Categorías, Ubicaciones, Proveedores, Usuarios y
Configuración como entidades separadas; se dejaron fuera en ese momento
porque `requisitos.md` los marcaba fuera de alcance.

## Nota sobre el rediseño de marca "Stokio" (2026-08-24, más tarde el mismo día)

Charly trajo una guía de diseño completa para la marca **Stokio** (paleta
morada `#6D28D9`, tipografía Inter, sidebar, dashboard, login, etc.) más un
mockup de referencia con secciones de un inventario de *equipos* (Ambientes,
Préstamos, Usuarios) que en realidad correspondían a su otro proyecto "Sena
Stock", no a este. Se acordó con Charly: implementar todo lo de la guía
**excepto Préstamos**, que se reemplazó por **Distribuidores** (proveedores),
porque tiene más sentido para un negocio de ropa que vende, no que presta.

Esto cambió el alcance de fondo respecto a la nota anterior:

- Se rehizo el sistema visual completo siguiendo la guía ([`STOKIO-guia-diseno-visual.md`](STOKIO-guia-diseno-visual.md)).
- **Se agregó autenticación** (login, sesiones por cookie, roles administrador/colaborador) — esto revierte el punto de "fuera de alcance" que tenía `requisitos.md` antes.
- Se agregaron los módulos de **Ambientes** (ubicaciones del inventario), **Distribuidores** (proveedores) y **Usuarios** (gestión de cuentas, solo administrador).
- Se agregó una nueva página **Inventario** (historial/ledger de movimientos de stock) separada de **Productos** (catálogo), porque la guía las trata como cosas distintas y en este negocio también tiene sentido separarlas.
- Se agregó un escáner de código (cámara vía `BarcodeDetector`, con entrada manual siempre disponible como alternativa — la cámara no funciona en todos los navegadores) y un panel de detalle de producto con línea de tiempo de movimientos.
- **No** se implementó la generación de una imagen de QR descargable/imprimible por producto (sección de "Descargar QR / Imprimir etiqueta" de la guía): hacerlo bien requiere un encoder QR real (no solo decodificarlo) y no había forma confiable de conseguir uno ya probado sin arriesgar un QR que no escanee. Queda como pendiente explícito arriba.

## Notas

Este proyecto es independiente del proyecto "Sena Stock" (inventario de equipos de cómputo) trabajado antes; no comparten código ni base de datos.
