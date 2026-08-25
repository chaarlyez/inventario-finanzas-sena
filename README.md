# Inventario y Finanzas (Stokio)

Proyecto individual — **SENA** (aprendiz: *Charly*).

Aplicación web para llevar el inventario de productos y el registro de entradas y salidas de dinero de un negocio, calculando automáticamente la rentabilidad por producto y el balance general. La interfaz está marcada como **Stokio**. Se está desarrollando y probando con datos reales (de ejemplo) de la marca de ropa **[a lo maldita sea](https://instagram.com/alomalditasea.co)**, para dejarla lista como herramienta real del negocio al terminar el curso.

## Estado del proyecto

🚧 En desarrollo. Ver [docs/bitacora.md](docs/bitacora.md) para el avance semana a semana y [docs/planeacion.md](docs/planeacion.md) para lo que falta.

## Tecnologías

- **Backend:** Node.js + Express
- **Base de datos:** SQLite (vía `better-sqlite3`)
- **Autenticación:** sesiones por cookie + `bcryptjs` para las contraseñas
- **Frontend:** HTML + CSS + JavaScript (sin frameworks)

## Estructura del repositorio

```
.
├── backend/           API REST (Express) + base de datos SQLite
│   └── src/
│       ├── db/          esquema, conexión y datos de ejemplo
│       ├── middleware/  autenticación (sesión / rol de administrador)
│       ├── routes/       endpoints del API
│       └── index.js      servidor
├── frontend/          páginas web que consumen el API
└── docs/              documentación del proyecto (planeación, requisitos, modelo de datos, bitácora)
```

## Cómo correr el proyecto localmente

```bash
cd backend
npm install
npm run start
```

Esto levanta el servidor en `http://localhost:3000`, que sirve tanto el API (`/api/...`) como el frontend. La primera vez que corre, crea la base de datos SQLite automáticamente (`backend/data/inventario.db`).

Para cargar datos de ejemplo (productos, ambiente, distribuidor y un usuario administrador):

```bash
node src/db/seed.js
```

El seed imprime en la consola el correo y la contraseña del usuario administrador de ejemplo con el que se puede iniciar sesión. **Cámbiala** antes de usar la app con datos reales del negocio.

## Módulos de la aplicación

- **Resumen (Dashboard):** stock total, entradas/salidas del día, alertas, gráfico de movimientos y accesos rápidos.
- **Productos:** catálogo — alta, edición y eliminación, con ambiente y distribuidor asignados.
- **Inventario:** historial de entradas, salidas y ventas de stock.
- **Ambientes:** ubicaciones donde se guarda el inventario (bodega, tienda, etc.).
- **Distribuidores:** proveedores a los que se les compra el inventario.
- **Movimientos de dinero:** registro de ingresos (ventas, otros) y egresos (compra de insumos, gastos operativos, pauta publicitaria, etc.).
- **Reportes:** rentabilidad por producto (unidades vendidas, ingresos, costo de lo vendido, utilidad, margen) y balance general.
- **Alertas:** listado de productos sin stock o con stock por debajo del mínimo.
- **Usuarios** (solo administrador): quién puede entrar y con qué rol.
- **Escáner de código:** busca un producto por su SKU con la cámara (si el navegador lo soporta) o escribiéndolo.

La interfaz sigue una guía de marca propia ("Stokio": paleta morada, tipografía Inter) hecha en HTML/CSS/JS plano, sin frameworks ni librerías externas.

## Documentación

- [Planeación / cronograma](docs/planeacion.md)
- [Requisitos funcionales y no funcionales](docs/requisitos.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Bitácora de avance](docs/bitacora.md)
- [Guía de diseño visual "Stokio"](docs/STOKIO-guia-diseno-visual.md)
