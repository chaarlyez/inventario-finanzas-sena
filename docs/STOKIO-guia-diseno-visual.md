# STOKIO — Guía maestra de diseño visual y experiencia

> Documento de implementación para reproducir fielmente la interfaz de **STOKIO**, una plataforma web de gestión de inventario.
> Personalidad: SaaS moderno, ordenado, rápido, juvenil y profesional.
> Idioma de la interfaz: español. Color dominante: morado.
>
> **Nota de adaptación (2026-08-24):** esta guía se escribió pensando en un
> inventario de *equipos* (aulas, laboratorios, préstamos) — el otro proyecto
> de Charly, "Sena Stock" — no en este negocio de ropa. Se implementó todo lo
> de esta guía **excepto la sección de Préstamos**, que se reemplazó por
> **Distribuidores** (proveedores), porque tiene más sentido para un negocio
> que vende ropa. Los ejemplos de datos de este documento (aulas, video
> beams, computadores) son solo ilustrativos de la guía original; los datos
> reales de la app son los de "a lo maldita sea". Ver `planeacion.md` y
> `bitacora.md` para el detalle de qué se implementó tal cual y qué se adaptó.

---

## 1. Objetivo visual

STOKIO debe sentirse como un producto digital real —no como una plantilla administrativa genérica ni como un proyecto escolar—. La pantalla debe priorizar la lectura rápida del inventario, con abundante espacio en blanco, jerarquía tipográfica clara y el morado como firma de marca.

La percepción al abrir el producto debe ser:

- **Control:** se entiende qué hay, dónde está y en qué estado está cada elemento.
- **Orden:** las acciones y datos importantes aparecen primero y no compiten entre sí.
- **Rapidez:** los botones principales, filtros y búsqueda son evidentes.
- **Confianza:** tarjetas blancas, estados semánticos claros y datos fáciles de escanear.

No usar degradados intensos, bordes pesados, sombras negras marcadas, iconos multicolor sin propósito ni tarjetas excesivamente redondeadas. El diseño base es claro; el morado se concentra en la marca, navegación activa, acciones primarias, foco y datos destacados.

**Sobre el fondo oscuro.** El tema claro es el predeterminado y es el que define la personalidad del producto. Existe además un tema oscuro que el usuario puede activar desde su perfil (ver §20). No es una variante decorativa ni una inversión automática del tema claro: tiene sus propios pasos de color, verificados uno a uno. Nunca debe convertirse en el aspecto por defecto.

---

## 2. Identidad de marca

### Nombre y mensaje

- **Nombre de marca:** `STOKIO` (siempre en mayúsculas cuando funciona como logotipo).
- **Nombre en texto de interfaz:** `Stokio`.
- **Slogan recomendado:** `Controla. Organiza. Conoce.`
- Alternativa para login o marketing: `Tu inventario, bajo control.`

### Concepto del logo

Crear un isotipo geométrico y minimalista que una estas dos ideas:

1. Una **S** insinuada por dos trazos o bloques redondeados.
2. Una **caja abierta / inventario** sugerida por sus ángulos, sin dibujar una caja literal y detallada.

El isotipo debe ser reconocible a 24 px y funcionar aislado como favicon. Debe parecer construido en vector con esquinas redondeadas, no ilustrado. La opción principal es un cuadrado redondeado morado que contiene una `S` blanca simplificada; la variante secundaria es el símbolo morado sin contenedor sobre fondo claro.

### Construcción y uso del logo

| Uso | Composición | Tamaño recomendado |
|---|---|---:|
| Sidebar expandido | Isotipo + `STOKIO` | alto total 32 px |
| Sidebar colapsado / favicon | Solo isotipo | 32 px; favicon 16/32 px |
| Login | Isotipo + `STOKIO` centrados | isotipo 40 px; marca 28 px |
| Encabezado móvil | Solo isotipo | 32 px |

- Área de seguridad: dejar a cada lado del logo al menos la mitad de la altura del isotipo.
- Wordmark: peso `700` u `800`, tracking aproximado `0.08em`, color `#24143F` o `#FFFFFF` sobre fondo morado.
- No deformar el isotipo, añadir efectos 3D, usar más de dos colores en el logo, ni sustituirlo por un emoji.

---

## 3. Sistema de color

### Paleta principal: morado STOKIO

Usar estos valores como tokens. El tono base es un violeta profundo y energético, no azulado en exceso.

| Token | Hex | Uso exacto |
|---|---|---|
| `--purple-950` | `#24143F` | Texto de marca oscuro, sidebar oscura opcional, títulos sobre fondos claros |
| `--purple-900` | `#3B1D6E` | Hover oscuro, elementos de gran contraste |
| `--purple-800` | `#51258C` | Acentos fuertes, iconos destacados |
| `--purple-700` | `#6D28D9` | Color de marca principal; CTA, navegación activa, enlaces, foco |
| `--purple-600` | `#7C3AED` | Hover de CTA y gráficos principales |
| `--purple-500` | `#8B5CF6` | Resaltados, datos secundarios de gráficos |
| `--purple-400` | `#A78BFA` | Anillos, ilustraciones y series auxiliares |
| `--purple-300` | `#C4B5FD` | Bordes morados suaves |
| `--purple-200` | `#DDD6FE` | Fondos de icono y hover suave |
| `--purple-100` | `#EDE9FE` | Fondo de estado seleccionado / chips suaves |
| `--purple-50` | `#F5F3FF` | Fondo de secciones moradas muy sutiles |

### Neutros

| Token | Hex | Uso |
|---|---|---|
| `--ink-950` | `#111827` | Titulares y cifras principales |
| `--ink-800` | `#1F2937` | Texto fuerte |
| `--ink-700` | `#374151` | Texto normal |
| `--ink-500` | `#6B7280` | Etiquetas, texto auxiliar |
| `--ink-400` | `#9CA3AF` | Placeholder y texto desactivado |
| `--line` | `#E5E7EB` | Bordes de cards, tablas e inputs |
| `--surface-muted` | `#F8FAFC` | Fondo de app y tablas |
| `--white` | `#FFFFFF` | Superficies de tarjetas |

### Colores de estado (no reemplazan el morado de marca)

| Estado | Base | Fondo de badge | Texto / icono | Significado |
|---|---|---|---|---|
| Disponible / buen estado | `#16A34A` | `#DCFCE7` | `#166534` | Operativo y disponible |
| En préstamo | `#2563EB` | `#DBEAFE` | `#1D4ED8` | Asignado temporalmente |
| Mantenimiento | `#D97706` | `#FEF3C7` | `#92400E` | Requiere revisión |
| Baja / pérdida | `#DC2626` | `#FEE2E2` | `#B91C1C` | No disponible / crítico |
| Pendiente | `#7C3AED` | `#EDE9FE` | `#5B21B6` | Acción pendiente |

Regla: los colores de estado siempre van acompañados de texto; nunca comunicar el estado solamente por color.

### Serie secundaria de datos

| Token | Hex | Uso |
|---|---|---|
| `--dato-teal` | `#0891B2` | Segunda serie en gráficos de dos variables (por ejemplo, salidas frente a entradas) |

El morado de marca es siempre la serie principal. Cuando un gráfico necesita una segunda serie, esta es la única acompañante aprobada: el par morado/azul no es válido porque queda en ΔE 13,2 de separación en visión normal, por debajo del piso de 15, y dos lectores con visión plena no lograrían distinguir las líneas.

No usar rosa, magenta ni ningún tono fuera de esta guía para representar datos.

---

## 4. Tipografía y jerarquía

Usar **Inter** desde Google Fonts o una fuente sans-serif equivalente. Alternativa: `Manrope` para un aspecto ligeramente más amable. No mezclar ambas dentro de una misma interfaz.

```css
font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
```

| Elemento | Tamaño / interlineado | Peso | Color |
|---|---|---:|---|
| Título de página | 28 px / 36 px | 700 | `--ink-950` |
| Saludo del dashboard | 28 px / 36 px | 700 | `--ink-950` |
| Título de sección | 18 px / 28 px | 700 | `--ink-950` |
| Título de tarjeta | 14 px / 20 px | 500 o 600 | `--ink-500` |
| Métrica de tarjeta | 28–32 px / 36 px | 700 | `--ink-950` |
| Texto de cuerpo | 14 px / 22 px | 400 | `--ink-700` |
| Tabla | 14 px / 20 px | 400; dato clave 500–600 | `--ink-700` |
| Etiqueta / caption | 12 px / 16 px | 500–600 | `--ink-500` |
| Botón | 14 px / 20 px | 600 | según fondo |

Mantener el cuerpo mínimo en 14 px en escritorio y 14–16 px en móvil. Evitar texto en mayúsculas sostenidas salvo el wordmark, códigos como `STK-00128` y encabezados muy cortos de tabla.

---

## 5. Tokens espaciales, bordes y profundidad

### Escala de espaciado

Usar una cuadrícula de 4 px. Los valores más frecuentes son:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 px`

### Tokens de superficie

```css
:root {
  --app-bg: #F8FAFC;
  --card-bg: #FFFFFF;
  --card-border: #E5E7EB;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-card: 0 1px 2px rgba(17, 24, 39, .04), 0 4px 12px rgba(17, 24, 39, .04);
  --shadow-float: 0 10px 30px rgba(36, 20, 63, .12);
  --focus-ring: 0 0 0 3px rgba(124, 58, 237, .22);
}
```

- Cards: borde de 1 px `--card-border`, radio 12 px, sombra `--shadow-card` muy sutil.
- Inputs y botones: radio 8 px. Modal grande: 16 px.
- Badges/pills: radio 999 px.
- Evitar sombras en cada elemento pequeño; reservarlas para tarjetas, menús flotantes y modales.

---

## 6. Estructura global de la aplicación

### Arquitectura de componentes

```text
AppShell
├── Sidebar
│   ├── BrandLockup
│   ├── WorkspaceNav
│   └── UserMenu
├── Topbar (solo contenido; visible en móvil)
└── MainContent
    ├── PageHeader
    ├── DashboardPage
    │   ├── MetricCard × 4
    │   ├── InventoryStatusChart
    │   ├── InventoryByEnvironment
    │   └── AttentionList
    ├── InventoryPage
    │   ├── FilterBar
    │   ├── BulkActionBar (condicional)
    │   └── ElementsTable
    ├── ElementDetailPage / DetailDrawer
    ├── QRScannerModal
    ├── LoginPage
    └── Footer
```

### Contenedor de escritorio

- Alto mínimo: 100 vh.
- Sidebar fija a la izquierda: **248 px** de ancho.
- Área principal: `calc(100% - 248px)`, fondo `--app-bg`.
- Contenido interno: ancho máximo 1440 px; padding horizontal 32 px y vertical 28–32 px.
- En pantallas mayores a 1600 px, conservar el max-width y no estirar las tablas/tarjetas indefinidamente.

---

## 7. Sidebar

### Aspecto

Fondo blanco, borde derecho `1px solid #E5E7EB`; no usar fondo morado sólido como estado normal. La identidad morada aparece en el logo y el item activo. La sidebar debe sentirse ligera y ordenada.

| Zona | Medidas y contenido |
|---|---|
| Logo | padding: 28 px superior, 24 px lateral; alto visual 32 px |
| Navegación | margen superior 32 px; separación 4 px entre items |
| Item | 44 px alto, padding 0 12 px, radio 8 px, icono 20 px + texto |
| Separador | margen vertical 20 px, color `--line` |
| Perfil inferior | pegado abajo, padding 16–20 px, avatar 36 px |

### Navegación exacta

1. Resumen
2. Productos
3. Inventario
4. Ambientes
5. Distribuidores
6. Movimientos de dinero
7. Reportes
8. Alertas
9. Usuarios (solo administrador)

Esta lista refleja el dominio real del producto: STOKIO gestiona existencias de una tienda, no préstamo de activos. Por eso hay `Distribuidores` y `Movimientos de dinero`, y no hay `Préstamos`.

El item activo (por ejemplo, `Resumen`) usa fondo `#EDE9FE`, texto `#6D28D9`, icono morado y peso 600. En hover: fondo `#F5F3FF`; el texto se mantiene oscuro/morado. Los items inactivos tienen icono y texto `#6B7280`.

En la parte inferior mostrar: avatar circular con iniciales, nombre, rol y un chevron que abre el menú de perfil. Ese menú contiene `Datos del negocio`, `Apariencia` y `Cerrar sesión`, en ese orden y con la acción de salir separada por un divisor, en rojo. Si el negocio tiene nombre registrado, aparece bajo la marca en la parte superior de la barra.

No recargar con insignias numéricas en todos los ítems; como máximo un punto en `Alertas` cuando haya productos por debajo del mínimo.

---

## 8. Dashboard / Resumen

### Header de la página

Distribución horizontal con saludo a la izquierda y acciones a la derecha.

```text
¡Hola, Charly!                         [⛶ Escanear QR] [+ Registrar producto]
Aquí tienes el resumen de tu inventario.
```

- Botón secundario `Escanear QR`: borde morado suave, fondo blanco, icono antes del texto.
- Botón primario `Registrar producto`: fondo `--purple-700`, texto blanco, icono `+` antes del texto.
- Ambos: alto 40 px, padding horizontal 16 px, separación 12 px.

### Grid de métricas

En desktop mostrar 4 tarjetas en una fila (cada una ocupa 3 de 12 columnas). Altura aproximada 132–144 px, padding 20–24 px, separación 20–24 px.

| Tarjeta | Valor | Apoyo | Icono |
|---|---:|---|---|
| Total de elementos | `1.248` | `+8 este mes` | capas/cajas en fondo `#EDE9FE` |
| En buen estado | `1.102` | `88,3% del total` | círculo check verde suave |
| En mantenimiento | `86` | `7 requieren revisión` | herramienta ámbar suave |
| Baja / pérdida | `60` | `4 reportados este mes` | alerta roja suave |

Composición: etiqueta arriba; cifra grande debajo; microtexto al pie. El icono se coloca dentro de un contenedor 40 × 40 px alineado arriba a la derecha. La tarjeta de total puede tener una franja morada de 3–4 px en el borde superior o icono morado; no teñir toda la tarjeta.

### Segunda fila: gráficos

Usar una grilla de 12 columnas con separación 24 px:

- **Estado del inventario:** 7 columnas. Card de 360–400 px de alto.
- **Inventario por ambiente:** 5 columnas. Card de 360–400 px de alto.

#### Estado del inventario

Título `Estado del inventario`, subtítulo `Distribución actual de 1.248 elementos` y selector compacto `Últimos 30 días` en la esquina superior derecha. Visual principal recomendado: gráfico de dona de 176–200 px. Centro de la dona: `1.248` y `elementos`.

Leyenda en lista, con punto de color, nombre, cantidad y porcentaje:

- En stock — verde
- Stock bajo — ámbar
- Sin stock — rojo

Los tres estados salen del modelo de datos: un producto está **en stock** cuando supera su mínimo, en **stock bajo** cuando lo iguala o está por debajo, y **sin stock** cuando llega a cero. No existen los estados de préstamo o mantenimiento que tendría un inventario de activos.

La leyenda lleva siempre nombre y cantidad junto al punto de color. No es decorativa: el par ámbar/verde queda en la banda 6–8 de separación para daltonismo, que solo es admisible acompañada de etiqueta directa.

El morado puede aparecer como selección, anillo decorativo o serie secundaria; no usarlo para simular el estado verde.

#### Inventario por ambiente

Título `Inventario por ambiente`, acción textual `Ver todos`. Usar barras horizontales moradas con fondo de riel `#EDE9FE`:

- Laboratorio de sistemas — 128
- Aula 101 — 95
- Sala de sistemas — 86
- Aula 102 — 73
- Bodega principal — 64

Etiqueta a la izquierda, número a la derecha; barra debajo o entre ambos. La más larga usa `--purple-700`, las restantes `--purple-400`/`--purple-500` para crear jerarquía.

### Tercera fila: atención e historial

- Izquierda (7 columnas): card `Elementos que requieren atención`, tabla/lista de 4–5 filas.
- Derecha (5 columnas): `Actividad reciente`, línea temporal compacta.

Cada fila de atención incluye miniatura/ícono, nombre, código, ambiente, badge de estado y acción de tres puntos. Ejemplo: `Video Beam Epson EB-X49`, `STK-00342`, `Aula 102`, badge `Mantenimiento`.

La actividad reciente usa punto morado, línea gris claro y mensajes como: `Laura Gómez trasladó 3 elementos a Aula 204` · `Hace 18 min`.

---

## 9. Inventario: búsqueda, filtros y tabla

### Cabecera de Inventario

```text
Inventario                                      [+ Registrar producto]
Gestiona y consulta todos los elementos registrados.
```

Debajo: una barra de herramientas única, dentro de una card o sin card según el ancho.

- Input de búsqueda flexible: icono de lupa; placeholder `Buscar por nombre, código o serial...`; altura 40 px; mínimo 280 px.
- Botones filtro: `Estado`, `Ambiente`, `Categoría`; icono chevron, borde gris y fondo blanco.
- Acción adicional: `Exportar` con icono de descarga, estilo secundario.
- En escritorio, búsqueda a la izquierda y filtros/acciones a la derecha; en tablet, permitir que bajen a una segunda línea.

### Tabla de elementos

Card blanca con borde sutil y `overflow-x` en pantallas pequeñas. Altura de fila: 64–72 px. Cabecera de tabla: fondo `#F8FAFC`, texto 12 px, 600, color `#6B7280`.

| Columna | Ancho orientativo | Ejemplo |
|---|---:|---|
| Checkbox | 44 px | Seleccionar fila |
| Elemento | flexible, mínimo 250 px | Miniatura + `Computador Lenovo ThinkCentre` + `STK-00128` |
| Categoría | 150 px | Equipos de cómputo |
| Ambiente | 140 px | Aula 204 |
| Estado | 130 px | badge `Disponible` |
| Último movimiento | 150 px | 24 ago. 2026 |
| Acciones | 48 px | botón de tres puntos |

La miniatura es 36 × 36 px, radio 8 px, fondo morado 50 o foto del elemento si existe. El nombre pesa 600; el código aparece debajo en 12 px y gris. Filas: fondo blanco; hover `#FAF7FF` y cursor clicable. No usar líneas oscuras; solo separadores `#F0F1F3`.

Al seleccionar filas aparece una barra contextual: `3 elementos seleccionados` + `Trasladar`, `Cambiar estado`, `Exportar`, `Eliminar`. La acción destructiva siempre roja y pide confirmación.

### Paginación

Pie de tabla con `Mostrando 1–10 de 1.248 elementos` a la izquierda y controles `Anterior`, páginas, `Siguiente` a la derecha. Los botones son compactos (32–36 px) y el número activo tiene fondo morado claro / texto morado.

---

## 10. Detalle de elemento

El detalle se abre como página completa en desktop o drawer desde la derecha para una consulta rápida. Usar página completa para edición profunda.

### Encabezado

```text
‹ Volver a inventario
Computador Lenovo ThinkCentre                 [Editar] [⋮]
STK-00128 · Equipos de cómputo · [Disponible]
```

En el cuerpo, layout 8/4 columnas:

- **Izquierda (8):** foto/ilustración del elemento (card 16:9 o 4:3), datos generales, especificaciones y línea de tiempo de movimientos.
- **Derecha (4):** card de estado, ubicación actual, responsable y acciones rápidas.

Datos de ejemplo:

| Campo | Contenido |
|---|---|
| Código interno | `STK-00128` |
| Serial | `PF3GZ2A9` |
| Categoría | Equipos de cómputo |
| Ambiente | Aula 204 |
| Responsable | Juan Pérez |
| Fecha de ingreso | 12 feb. 2025 |
| Último movimiento | 24 ago. 2026, 10:32 a. m. |

Acciones rápidas: `Trasladar`, `Registrar préstamo`, `Enviar a mantenimiento`, `Dar de baja`. Las tres primeras son neutras/moradas; `Dar de baja` es texto rojo, separada visualmente y abre confirmación.

### Código QR

Mostrar el QR dentro de una card pequeña con título `Código de identificación`. Debajo: `STK-00128`; botones `Descargar QR` e `Imprimir etiqueta`. El QR debe tener borde blanco/espacio de seguridad suficiente, no llevar un logo grande que impida el escaneo.

---

## 11. Escáner QR

### Activación y modal

Se abre desde el botón `Escanear QR` de header, dashboard o móvil. Usar modal centrado de 560–640 px de ancho máximo en escritorio; pantalla completa en móvil.

```text
Escanear código QR                                           [✕]
Ubica el código del elemento dentro del recuadro.

              [ previsualización de cámara 4:3 ]
                    ╭───────────────╮
                    │ marco QR     │
                    ╰───────────────╯

[icono] También puedes ingresar un código manualmente
[ STK-___________ ] [Buscar]
```

- Fondo de cámara oscuro/desenfocado solo dentro del área 4:3, radio 12 px.
- Overlay con esquinas de marco morado brillante; animación de línea de escaneo discreta (1.5 s, sin parpadeos molestos).
- Si se deniega cámara: icono neutro, texto claro y botón `Ingresar código manualmente`.
- Tras lectura exitosa: cerrar el scanner y abrir una tarjeta de resultado o navegar al detalle; no mostrar una alerta genérica.

---

## 12. Login

### Composición escritorio

Pantalla a dos columnas 45/55 o 50/50. Fondo global blanco o `--surface-muted`.

- **Panel izquierdo (marca):** fondo `#3B1D6E` o una composición morada muy sobria; isotipo/wordmark blanco; slogan; ilustración abstracta de cajas, etiquetas, gráficos o nodos en morado claro. No sobrecargar.
- **Panel derecho (formulario):** ancho máximo de formulario 400 px, centrado vertical y horizontal.

```text
[isotipo] STOKIO

Bienvenido de nuevo
Ingresa tus datos para acceder a tu inventario.

Correo institucional
[ ejemplo@sena.edu.co                         ]

Contraseña                              ¿Olvidaste tu contraseña?
[ ••••••••••••••••                       (ojo) ]

[ ] Recordarme

[ Iniciar sesión ]

¿No tienes acceso? Contacta al administrador.
```

- Botón de inicio: ancho completo, alto 44 px, fondo morado 700.
- Campos: 44 px de alto, label encima con 12–14 px/600, separación label-campo 8 px.
- Mensajes de error debajo del input, rojo, con icono pequeño; input con borde rojo solo tras validación.
- En móvil, ocultar el panel de ilustración: mantener un header morado compacto de 120–160 px con logo, y formulario debajo.

---

## 13. Responsive behavior

### Puntos de ruptura

| Rango | Comportamiento |
|---|---|
| ≥ 1280 px | Sidebar 248 px; dashboard 4 métricas; grilla 7/5; tabla completa |
| 1024–1279 px | Sidebar puede bajar a 224 px; métricas aún 4 si caben, si no 2 × 2; reducir padding a 24 px |
| 768–1023 px | Sidebar colapsada a 72 px o drawer; contenido 24 px; métricas 2 × 2; gráficos apilados o 6/6 |
| 480–767 px | Sidebar se vuelve drawer; topbar fija; una columna; padding 16 px; acciones se apilan |
| < 480 px | Priorizar una sola acción primaria visible; modal/QR y detalle a pantalla completa |

### Reglas móviles exactas

- Topbar de 64 px: botón menú, isotipo, y avatar/notifications a la derecha.
- El menú lateral se abre como drawer de 280 px con overlay oscuro de 30%.
- Header de dashboard: título y subtítulo arriba; CTA primario debajo a ancho completo; botón QR como icono o secundario debajo.
- Métricas: una columna en móviles pequeños; card de 112–124 px de alto.
- Gráficos: una columna, altura mínima 300 px. La dona puede pasar a 156 px.
- Tabla: convertir cada fila en card de información **o** conservar scroll horizontal, pero no comprimir columnas hasta volverlas ilegibles. Para la vista general móvil se recomienda card: nombre/código, badge, ambiente, fecha y menú.
- Filtros: botón `Filtrar` único que abre bottom sheet con Estado, Ambiente y Categoría.
- Acciones flotantes: si se usa FAB `+`, debe abrir las dos opciones `Registrar producto` y `Escanear QR`; no ocultar ambas acciones críticas sin señalización.

---

## 14. Iconografía y microinteracciones

### Iconos

Usar un único set de iconos lineales: **Lucide**, **Heroicons Outline** o equivalente. Tamaño estándar 20 px; 16 px dentro de inputs/badges; 24 px para acciones móviles. Trazo 1.8–2 px, extremos redondeados.

Iconos recomendados: `LayoutDashboard`, `Boxes`, `Package`, `MapPin`, `ArrowLeftRight`, `HandHelping`, `BarChart3`, `Users`, `QrCode`, `Plus`, `Search`, `SlidersHorizontal`, `MoreHorizontal`, `Bell`, `ChevronDown`, `Camera`, `Download`.

### Estados de interacción

- Hover botón primario: `--purple-600`; transición 150–180 ms ease-out.
- Active: oscurecer a `--purple-800` y reducir imperceptiblemente (`scale(.98)`) solo en botones.
- Focus visible: `--focus-ring`, nunca eliminar el foco de teclado.
- Carga: skeleton gris muy claro con brillo lento; no bloquear toda la pantalla si solo carga una tabla.
- Toast: esquina inferior derecha en desktop, inferior centrado en móvil; radio 12 px, icono de estado, duración 4–5 s.

Las animaciones deben durar 150–250 ms y respetar `prefers-reduced-motion`.

---

## 15. Modales, formularios y estados vacíos

### Formulario de registro/edición

Modal de 720–840 px (o página en móvil), cabecera con título y botón cerrar; cuerpo dividido en grupos:

1. Información básica: nombre, categoría, código, serial.
2. Ubicación y responsable: ambiente, responsable, fecha de ingreso.
3. Estado: selector segmentado o select con ayuda textual.
4. Imagen y QR: carga de imagen; QR generado tras guardar.

Footer fijo del modal: `Cancelar` (secundario) y `Guardar elemento` (primario). Campos de ancho completo salvo pares que tengan sentido, como `Código` + `Serial` en escritorio.

### Estados vacíos

Usar tarjetas o áreas de contenido limpias con icono/ilustración monolineal morada 80–120 px, un título y una acción. Ejemplo:

```text
[ilustración de cajas]
Aún no hay elementos registrados
Comienza agregando el primer elemento de tu inventario.
[ Registrar producto ]
```

No usar mensajes fríos como "No data".

### Confirmación destructiva

Para baja/eliminación, modal de 420–480 px con icono rojo suave, consecuencia expresada claramente y acciones `Cancelar` / `Dar de baja`. El botón destructivo es rojo; nunca morado.

---

## 16. Footer

El footer debe ser discreto y aparecer al final del contenido, no fijo. Alto aproximado 56–72 px, texto 12–13 px `--ink-500`, borde superior suave.

```text
© 2026 STOKIO · Gestión de inventario               Ayuda · Privacidad · Versión 1.0.0
```

En móvil, centrar y apilar en dos líneas. No añadir ilustraciones ni una banda morada grande.

---

## 17. Accesibilidad y consistencia

- Contraste mínimo AA: texto normal 4.5:1; texto grande 3:1. Verificar especialmente morado sobre blanco y badges de estado.
- Cada input debe tener label visible; placeholder no sustituye el label.
- Todas las acciones con icono deben incluir tooltip en escritorio y etiqueta accesible.
- Los badges de estado llevan texto y, si llevan punto, este es decorativo.
- Mantener alturas consistentes: inputs/botones estándar 40–44 px; fila de navegación 44 px.
- Un botón primario por zona visual. Acciones menos importantes usan secundario, enlace o menú de tres puntos.
- Repetir exactamente los mismos colores, radios, iconos y nombres de estado en todas las vistas.
- Fechas en formato natural en español: `24 ago. 2026`; horas: `10:32 a. m.`.
- Números de inventario con separador de miles: `1.248`.

---

## 18. Criterios de fidelidad antes de dar por terminado

La implementación se considera fiel cuando cumple todos estos puntos:

1. El morado `#6D28D9` es reconocible como el color de marca, pero el fondo de trabajo sigue siendo claro y respirable.
2. La sidebar blanca contiene logo, las ocho secciones y perfil; el activo se identifica con lavanda suave, icono y texto morados.
3. El dashboard abre con saludo, dos CTAs y cuatro tarjetas exactamente con la jerarquía etiqueta → cifra → apoyo → icono.
4. Las cards tienen borde gris suave, radio 12 px y sombras apenas perceptibles; no parecen botones gigantes ni bloques flotantes pesados.
5. La información de inventario se puede escanear rápido: nombre/código, ubicación, estado y fecha tienen jerarquía visible.
6. Los estados nunca dependen solo del color y conservan los mismos nombres en dashboard, tabla y detalle.
7. El QR es una función protagonista pero secundaria frente al CTA de registro: es accesible desde header, móvil y detalle.
8. En móvil no se pierde funcionalidad: sidebar como drawer, acciones claras, filtros en bottom sheet y datos de tabla legibles.
9. La tipografía, espaciado de 4 px, iconos lineales y tono de textos son uniformes en toda la app.
10. No hay degradados llamativos, exceso de morado, esquinas exageradamente redondas, sombras fuertes ni estilos visuales mezclados.

---

## 19. Prompt operativo breve para Claude

> Implementa STOKIO como una aplicación web de inventario de tienda en español. Debe ser un SaaS claro, juvenil y profesional, con Inter como tipografía y morado `#6D28D9` como color de marca. Construye un AppShell con sidebar blanca fija (248 px), logo isotipo de S/caja y navegación: Resumen, Productos, Inventario, Ambientes, Distribuidores, Movimientos de dinero, Reportes, Alertas y Usuarios. En el Dashboard crea saludo, botones "Escanear QR" y "Registrar producto", cuatro tarjetas de métricas, gráfico de dona con el estado del stock, inventario por ambiente en barras, lista de productos que requieren atención y actividad reciente. Usa fondo `#F8FAFC`, cards blancas con borde `#E5E7EB`, radio 12 px, sombra muy sutil, grid de 4 px y layout responsive. Incluye tabla de inventario, detalle de producto, escáner QR, login, estados semánticos y comportamiento móvil exactamente según esta guía. Añade el tema oscuro de §20 como preferencia del usuario, nunca como aspecto por defecto. No improvises otra estética ni uses degradados intensos.

---

## 20. Tema oscuro

El tema oscuro es una preferencia del usuario, no el aspecto por defecto. Se elige desde `Apariencia`, en el menú de perfil, y se guarda por dispositivo.

### Tres estados, no dos

| Opción | Comportamiento |
|---|---|
| `Claro` | Fuerza el tema claro aunque el sistema esté en oscuro |
| `Oscuro` | Fuerza el tema oscuro aunque el sistema esté en claro |
| `Automático` | No marca nada y sigue a `prefers-color-scheme` |

Implementación: `:root` define la paleta clara completa; una media query redefine solo los tokens para quien tiene el sistema en oscuro y no ha elegido nada, protegida con `:root:not([data-tema="claro"])`; y `:root[data-tema="oscuro"]` los redefine de nuevo para que la elección explícita gane en el otro sentido.

Ningún color puede definirse únicamente dentro de la media query o del selector `[data-tema]`. Un color cuya única definición vive ahí no se aplica en el estado sin marcar, y la página termina pintando el texto de un tema sobre el fondo del otro.

### Superficies

| Token | Claro | Oscuro |
|---|---|---|
| `--bg` | `#F8FAFC` | `#131022` |
| `--surface` | `#FFFFFF` | `#1C1830` |
| `--line` | `#E5E7EB` | `#302A4A` |
| `--ink-950` | `#111827` | `#F4F2FB` |
| `--purple` (acento) | `#6D28D9` | `#A78BFA` |
| `--sobre-acento` | `#FFFFFF` | `#17122B` |

Los neutros oscuros llevan sesgo morado a propósito: un gris puro junto al acento se ve sucio. Sobre fondo oscuro el morado 700 se hunde, así que el acento sube al 400 y el texto que va encima pasa a ser oscuro, nunca blanco.

### Gráficos: pasos propios, no una inversión

La banda de luminosidad legible es más estrecha sobre fondo oscuro (OKLCH L 0,48–0,67 frente a 0,43–0,77), así que los colores del tema claro no sirven tal cual.

| Uso | Claro | Oscuro |
|---|---|---|
| En stock | `#16A34A` | `#16A34A` |
| Stock bajo | `#D97706` | `#D97706` |
| Sin stock | `#DC2626` | `#E11D48` |
| Serie principal | `#6D28D9` | `#8B5CF6` |
| Serie secundaria | `#0891B2` | `#0891B2` |

El rojo se desplaza a rosa en oscuro porque junto al ámbar quedaba en ΔE 14,4 en visión normal, por debajo del piso de 15.

Los gráficos son SVG generado y llevan el color escrito en el atributo, así que no se actualizan solos al cambiar de tema: cada vista debe registrar cómo repintarse.

### Reglas que no se negocian

- El texto de una leyenda va en tinta neutra. El color de la serie lo lleva el punto, nunca el texto.
- Todo texto cumple AA en **los dos** temas: 4,5:1 normal, 3:1 para texto grande.
- El visor de la cámara del escáner se mantiene oscuro en ambos temas: es una previsualización de vídeo, no una superficie de la interfaz.
- El panel de marca del login es morado oscuro en ambos temas, así que su texto usa claros fijos y no tokens que se invierten.

---

---

## 21. Etiquetas QR y entrada por escaneo

### Qué lleva el código

El QR contiene **únicamente el SKU** del producto, nada más. No una URL, no un JSON con los datos.

El motivo es que la etiqueta se imprime una vez y se queda pegada meses: si el código llevara el precio o el nombre, quedaría desactualizado en cuanto cambie cualquiera de los dos. Con el SKU dentro, la aplicación busca los datos frescos en el momento de escanear, y además el código se puede teclear a mano si la cámara falla.

Formato del SKU por variante: `CAM-<CORTE>-<COLOR>-<TALLA>`, por ejemplo `CAM-OVE-NEG-L`. Todo en mayúsculas, sin acentos y sin espacios.

### Generación

El generador vive en `js/qr.js` y no depende de ninguna librería externa: la aplicación funciona sin conexión. Codifica en modo byte con corrección de errores nivel M y elige la versión más pequeña que quepa.

- Margen obligatorio de 4 módulos alrededor. Sin él muchos lectores no encuentran el código.
- Se dibuja como un único `path` de SVG, no un `rect` por módulo.
- **El QR siempre es negro sobre blanco, también en tema oscuro.** Un código claro sobre fondo oscuro no lo lee ningún lector.

### La etiqueta

Cada etiqueta lleva, en este orden: QR, nombre del producto, SKU y precio (este último se puede ocultar). Tres tamaños: 24, 12 o 6 por hoja.

Al imprimir desaparecen barra lateral, topbar, encabezado y filtros. Las etiquetas no seleccionadas no se imprimen, y ninguna se parte entre dos páginas.

### Entrada por escaneo

Escanear una etiqueta **no** abre el detalle del producto: abre `Entrada de inventario`, que es lo que se necesita al recibir mercancía.

- Todos los datos del producto se muestran en solo lectura: nombre, código, categoría, distribuidor, ambiente, precio, costo, stock mínimo y stock actual.
- El único dato editable es **las unidades que entran**, más un motivo opcional. No se pueden tocar precios ni nombres desde aquí.
- Tras guardar, el modal no se cierra: actualiza el stock a la vista, confirma y deja el campo en 1. Recibir mercancía son varias cajas seguidas, no una.
