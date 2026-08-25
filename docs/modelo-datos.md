# Modelo de datos

## Diagrama entidad-relación (simplificado)

```
productos                    movimientos_inventario         movimientos_dinero
----------                   -----------------------        -------------------
id (PK)                <---- producto_id (FK)          <---- producto_id (FK, opcional)
nombre                        tipo (entrada/salida)           tipo (ingreso/egreso)
categoria                     cantidad                        categoria
sku                            motivo                          monto
costo_unitario                 fecha                            descripcion
precio_venta                                                    cantidad (opcional)
stock_actual                                                    fecha
stock_minimo
creado_en
```

Un producto puede tener muchos movimientos de inventario y muchos movimientos de dinero asociados. Los movimientos de dinero **no dependen** de un producto (por ejemplo, un gasto operativo no tiene producto asociado).

## Tablas

### `productos`

| Campo            | Tipo    | Notas                                  |
|------------------|---------|------------------------------------------|
| id               | INTEGER | Llave primaria, autoincremental         |
| nombre           | TEXT    | Obligatorio                              |
| categoria        | TEXT    | Opcional                                 |
| sku              | TEXT    | Único, opcional                          |
| costo_unitario   | REAL    | Costo de producir/comprar una unidad     |
| precio_venta     | REAL    | Precio al que se vende                   |
| stock_actual     | INTEGER | Se actualiza con cada movimiento         |
| stock_minimo     | INTEGER | Para alertas de reabastecimiento         |
| creado_en        | TEXT    | Fecha de creación                        |

### `movimientos_inventario`

| Campo         | Tipo    | Notas                                 |
|---------------|---------|----------------------------------------|
| id            | INTEGER | Llave primaria                         |
| producto_id   | INTEGER | FK a `productos`                       |
| tipo          | TEXT    | `entrada` o `salida`                   |
| cantidad      | INTEGER | Mayor a 0                              |
| motivo        | TEXT    | Ej: compra, venta, ajuste              |
| fecha         | TEXT    | Fecha del movimiento                   |

### `movimientos_dinero`

| Campo         | Tipo    | Notas                                              |
|---------------|---------|------------------------------------------------------|
| id            | INTEGER | Llave primaria                                       |
| tipo          | TEXT    | `ingreso` o `egreso`                                 |
| categoria     | TEXT    | Ej: venta, compra_insumo, gasto_operativo            |
| monto         | REAL    | Mayor a 0                                            |
| descripcion   | TEXT    | Opcional                                             |
| producto_id   | INTEGER | FK a `productos`, opcional                           |
| cantidad      | INTEGER | Opcional, unidades relacionadas (ej. unidades vendidas) |
| fecha         | TEXT    | Fecha del movimiento                                 |

## Registrar una venta

Vender un producto implica dos cosas a la vez: sacar stock **y** registrar el
ingreso de dinero. Hacerlo como dos pasos sueltos (una salida de inventario
por un lado, un ingreso de dinero por otro) es fácil de olvidar y deja los
datos desincronizados. Por eso existe `POST /api/ventas`, que hace ambas
inserciones en una sola transacción:

1. Inserta un `movimientos_inventario` de tipo `salida` (motivo `venta`) y descuenta `stock_actual` del producto.
2. Inserta un `movimientos_dinero` de tipo `ingreso`, categoría `venta`, con `producto_id` y `cantidad` asociados.

Si el stock no alcanza, no se inserta nada (falla antes de la transacción).
El frontend usa este endpoint desde el botón "Registrar venta" (Dashboard y
tabla de Productos); la salida "manual" de stock (`POST /movimientos-inventario`)
se deja para casos que no son venta: pérdidas, ajustes de inventario, etc.

## Cómo se calcula la rentabilidad

Para cada producto:

- **Unidades vendidas** = suma de `cantidad` en `movimientos_dinero` donde `tipo = 'ingreso'` y `categoria = 'venta'`.
- **Ingresos** = suma de `monto` en esos mismos movimientos.
- **Costo de lo vendido** = unidades vendidas × `costo_unitario` del producto.
- **Utilidad** = ingresos − costo de lo vendido.
- **Margen (%)** = utilidad / ingresos × 100.
