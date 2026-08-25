# Assets STOKIO

Todos los archivos SVG incluyen transparencia por defecto y pueden usarse directamente en web, Figma o programas vectoriales.

## Logo

- `logo-horizontal.svg`: logotipo completo para sidebar, footer y encabezados amplios.
- `logo-vertical.svg`: composición centrada para login y pantallas de bienvenida.
- `isotipo.svg`: símbolo de caja/S para icono de app y avatares.
- `favicon.svg`: favicon sobre base clara redondeada.

## Iconos

`iconos.svg` es un sprite SVG. Cada icono está aislado en un `symbol` con su propio `viewBox 0 0 24 24`: dashboard, inventario, productos, ambientes, movimientos, prestamos, reportes, usuarios, configuracion, buscar, editar, eliminar, ver, camara, qr, impresora, campana y mas.

Ejemplo de uso HTML:

```html
<svg width="24" height="24" aria-hidden="true"><use href="iconos.svg#inventario" /></svg>
```

El color base de los iconos es `#A855F7`. Para cambiarlo, sustituye el valor de `stroke` en el bloque `<style>` de `iconos.svg`.

## Cómo se usan en Stokio

La app **no** usa `<use>` contra este sprite directamente: los iconos se
inyectan como SVG inline desde `frontend/js/layout.js` (objeto `ICONOS`),
usando exactamente la misma geometría (`d`, `cx/cy/r`, etc.) de estos
archivos pero con `stroke="currentColor"` en vez del `#A855F7` fijo. Así el
mismo icono puede pintarse blanco sobre un círculo morado, gris cuando el
ítem del menú está inactivo, morado cuando está activo, o rojo en un botón
de eliminar — heredando el color según dónde se use, en vez de quedar
siempre en un solo morado. Esta carpeta queda como la fuente de verdad del
diseño (para Figma, impresión, etc.); si cambia un ícono aquí, hay que
actualizar también su entrada en `ICONOS`.

Iconos de este set sin un ítem de navegación propio en la app todavía
(`configuracion`, `impresora`, `camara`) quedan disponibles en `ICONOS` por
si se necesitan más adelante. `prestamos` no se usa: ese módulo se
reemplazó por **Distribuidores**, que no tenía un ícono en el set original,
así que sigue con un ícono propio (camión) hecho a mano.
