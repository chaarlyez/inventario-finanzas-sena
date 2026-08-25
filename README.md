# Inventario y Finanzas

Proyecto individual — **SENA** (aprendiz: *Charly*).

Aplicación web para llevar el inventario de productos y el registro de entradas y salidas de dinero de un negocio, calculando automáticamente la rentabilidad por producto y el balance general. Se está desarrollando y probando con datos reales (de ejemplo) de la marca de ropa **[a lo maldita sea](https://instagram.com/alomalditasea.co)**, para dejarla lista como herramienta real del negocio al terminar el curso.

## Estado del proyecto

🚧 En desarrollo. Ver [docs/bitacora.md](docs/bitacora.md) para el avance semana a semana y [docs/planeacion.md](docs/planeacion.md) para lo que falta.

## Tecnologías

- **Backend:** Node.js + Express
- **Base de datos:** SQLite (vía `better-sqlite3`)
- **Frontend:** HTML + CSS + JavaScript (sin frameworks, por ahora)

## Estructura del repositorio

```
.
├── backend/           API REST (Express) + base de datos SQLite
│   └── src/
│       ├── db/        esquema, conexión y datos de ejemplo
│       ├── routes/     endpoints del API
│       └── index.js    servidor
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

Para cargar datos de ejemplo (productos de la marca, con costos y precios reales):

```bash
node src/db/seed.js
```

## Módulos de la aplicación

- **Dashboard:** resumen general — stock total, entradas/salidas del día, alertas, gráfico de movimientos y accesos rápidos.
- **Productos:** alta, edición y eliminación de productos (costo, precio de venta, stock mínimo), registro de entradas/salidas de stock y su historial.
- **Movimientos de dinero:** registro de ingresos (ventas, otros) y egresos (compra de insumos, gastos operativos, pauta publicitaria, etc.).
- **Reportes:** rentabilidad por producto (unidades vendidas, ingresos, costo de lo vendido, utilidad, margen) y balance general.
- **Alertas:** listado de productos sin stock o con stock por debajo del mínimo.

La interfaz es un panel de administración (sidebar + tarjetas) hecho en HTML/CSS/JS plano, sin librerías externas.

## Documentación

- [Planeación / cronograma](docs/planeacion.md)
- [Requisitos funcionales y no funcionales](docs/requisitos.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Bitácora de avance](docs/bitacora.md)
