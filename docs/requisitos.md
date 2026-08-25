# Requisitos del proyecto

## Objetivo

Construir una aplicación que permita a un pequeño negocio (caso de estudio: la marca de ropa "a lo maldita sea") llevar el control de su inventario de productos y de sus movimientos de dinero, para poder calcular su rentabilidad de forma confiable.

## Requisitos funcionales

1. **Gestión de productos (inventario)**
   - Registrar un producto con: nombre, categoría, SKU, costo unitario, precio de venta, stock actual y stock mínimo.
   - Consultar, editar y eliminar productos.
   - Ver alertas de productos con stock por debajo del mínimo.

2. **Movimientos de inventario**
   - Registrar entradas de stock (ej. compra a proveedor, producción).
   - Registrar salidas de stock (ej. venta, pérdida, ajuste).
   - El stock del producto se actualiza automáticamente con cada movimiento.
   - No permitir salidas si no hay stock suficiente.

3. **Movimientos de dinero**
   - Registrar ingresos (ventas, otros ingresos) y egresos (compra de insumos, gastos operativos, pauta publicitaria, otros).
   - Cada movimiento de dinero puede asociarse opcionalmente a un producto y una cantidad (por ejemplo, una venta).

4. **Reportes**
   - Balance general: ingresos totales, egresos totales, balance neto.
   - Valor total del inventario actual (a costo).
   - Rentabilidad por producto: unidades vendidas, ingresos generados, costo de lo vendido, utilidad y margen (%).

## Requisitos no funcionales

- La aplicación debe poder correr localmente sin necesidad de servicios externos de pago.
- El código y la documentación deben estar organizados en un repositorio público de GitHub, para que la profesora pueda revisar el avance en cualquier momento.
- El proyecto debe poder probarse con datos reales (de ejemplo) de un negocio real, no solo con datos ficticios sin sentido.

## Fuera de alcance (por ahora)

- Autenticación / múltiples usuarios.
- Facturación electrónica o integración con pasarelas de pago.
- Reportes contables formales (impuestos, retenciones, etc.).

> Este documento se actualizará a medida que la profesora dé indicaciones adicionales sobre el módulo/entrega.
