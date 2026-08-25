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

## Cómo se calcula la rentabilidad

Para cada producto:

- **Unidades vendidas** = suma de `cantidad` en `movimientos_dinero` donde `tipo = 'ingreso'` y `categoria = 'venta'`.
- **Ingresos** = suma de `monto` en esos mismos movimientos.
- **Costo de lo vendido** = unidades vendidas × `costo_unitario` del producto.
- **Utilidad** = ingresos − costo de lo vendido.
- **Margen (%)** = utilidad / ingresos × 100.
