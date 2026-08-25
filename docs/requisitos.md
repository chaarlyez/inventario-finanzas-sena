# Requisitos del proyecto

## Objetivo

Construir una aplicación que permita a un pequeño negocio (caso de estudio: la marca de ropa "a lo maldita sea") llevar el control de su inventario de productos y de sus movimientos de dinero, para poder calcular su rentabilidad de forma confiable.

## Requisitos funcionales

1. **Gestión de productos (inventario)**
   - Registrar un producto con: nombre, categoría, SKU, costo unitario, precio de venta, stock actual, stock mínimo, ambiente (ubicación) y distribuidor.
   - Consultar, editar y eliminar productos (no se puede eliminar uno con movimientos ya registrados).
   - Ver alertas de productos con stock por debajo del mínimo o sin stock.
   - Buscar un producto por código (SKU) escaneando un QR con la cámara o escribiéndolo manualmente.

2. **Movimientos de inventario**
   - Registrar entradas de stock (ej. compra a proveedor, producción).
   - Registrar salidas de stock (ej. pérdida, ajuste).
   - **Ventas:** registrar una venta descuenta el stock y registra el ingreso de dinero correspondiente en una sola operación.
   - El stock del producto se actualiza automáticamente con cada movimiento.
   - No permitir salidas ni ventas si no hay stock suficiente.

3. **Movimientos de dinero**
   - Registrar ingresos (ventas, otros ingresos) y egresos (compra de insumos, gastos operativos, pauta publicitaria, otros).
   - Cada movimiento de dinero puede asociarse opcionalmente a un producto y una cantidad (por ejemplo, una venta).

4. **Reportes**
   - Balance general: ingresos totales, egresos totales, balance neto.
   - Valor total del inventario actual (a costo).
   - Rentabilidad por producto: unidades vendidas, ingresos generados, costo de lo vendido, utilidad y margen (%).

5. **Ambientes**
   - Registrar las ubicaciones donde se guarda el inventario (bodega, tienda física, tienda virtual, etc.).
   - Cada producto puede asignarse a un ambiente; no se puede eliminar un ambiente que tenga productos asignados.

6. **Distribuidores**
   - Registrar los proveedores a los que se les compra el inventario (nombre, contacto, teléfono, correo, notas).
   - Cada producto puede asociarse a un distribuidor; no se puede eliminar un distribuidor con productos asociados.

7. **Usuarios y autenticación**
   - Inicio de sesión con correo y contraseña; sin sesión válida no se puede usar el API ni ver datos.
   - Dos roles: **administrador** (gestiona usuarios y todo lo demás) y **colaborador** (todo excepto gestión de usuarios).
   - Un administrador puede crear, editar y eliminar usuarios. Siempre debe quedar al menos un administrador, y nadie puede eliminar su propia cuenta mientras tiene la sesión iniciada.

## Requisitos no funcionales

- La aplicación debe poder correr localmente sin necesidad de servicios externos de pago.
- El código y la documentación deben estar organizados en un repositorio público de GitHub, para que la profesora pueda revisar el avance en cualquier momento.
- El proyecto debe poder probarse con datos reales (de ejemplo) de un negocio real, no solo con datos ficticios sin sentido.
- Las contraseñas se guardan como hash (bcrypt), nunca en texto plano.

## Fuera de alcance (por ahora)

- Facturación electrónica o integración con pasarelas de pago.
- Reportes contables formales (impuestos, retenciones, etc.).
- Generación/descarga de una imagen de código QR por producto e impresión de etiquetas (se buscaría un producto por SKU escaneándolo o escribiéndolo, pero no se genera un QR imprimible todavía).
- Registro público de nuevos usuarios (las cuentas solo las crea un administrador desde Usuarios).

> Este documento se actualizará a medida que la profesora dé indicaciones adicionales sobre el módulo/entrega.
