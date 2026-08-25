# Poner Stokio en internet

Guía para dejar la aplicación en una URL permanente, accesible desde cualquier lugar y con la base de datos a salvo entre despliegues.

La plataforma elegida es **Fly.io** porque permite montar un disco persistente, que es lo que necesita SQLite. La base es un archivo: si no vive en un disco aparte, cada despliegue la borraría.

---

## Antes de subir nada

### 1. Cambia la contraseña del administrador

`backend/src/db/seed.js` crea el primer usuario con la contraseña `stokio123`, y este repositorio es público. Cualquiera puede leerla.

Entra a la aplicación en local, ve a **Usuarios** y cámbiala. Hazlo antes de desplegar, no después.

### 2. Comprueba que arranca en modo producción

```bash
cd backend
NODE_ENV=production DATA_DIR=/tmp/stokio-prueba PORT=4555 node src/index.js
```

Abre `http://localhost:4555`. Si carga, la configuración de producción está bien.

---

## Qué cambia entre local y producción

El código es el mismo; lo que cambia son tres variables de entorno.

| Variable | Local | Producción |
|---|---|---|
| `NODE_ENV` | sin definir | `production` |
| `DATA_DIR` | sin definir → `backend/data` | `/datos` (el disco montado) |
| `PORT` | `3000` | `8080` |

Con `NODE_ENV=production` la aplicación además:

- Marca la cookie de sesión como `secure`, para que nunca viaje por HTTP plano.
- Apaga CORS. En producción el mismo servidor entrega el frontend y el API, así que no hay peticiones entre orígenes; dejarlo abierto permitiría que otra web hiciera peticiones autenticadas en nombre de quien tenga la sesión abierta.
- Confía en el proxy de la plataforma, para que el freno de intentos de login vea la IP real del visitante.

---

## Despliegue

Todos los comandos de esta sección se escriben en **PowerShell**, desde la carpeta raíz del repositorio:

```powershell
cd "C:\Users\Charly\Desktop\Sena Karol\inventario-finanzas-sena-1"
```

Es importante estar ahí: `fly launch` y `fly deploy` buscan `fly.toml` y `Dockerfile` en la carpeta actual.

### 1. Instala flyctl

```powershell
winget install --id Fly-io.flyctl
```

El identificador lleva guion, no punto: `Fly-io.flyctl`. Tras instalarlo hay que **abrir una terminal nueva**, porque el comando se añade al PATH y las terminales ya abiertas no lo ven.

Si winget falla por permisos, descarga el binario desde [fly.io/docs/flyctl/install](https://fly.io/docs/flyctl/install/).

### 2. Crea tu cuenta e inicia sesión

```bash
fly auth signup
```

Si ya tienes cuenta, `fly auth login`.

**Fly exige una tarjeta antes de crear la aplicación.** No es opcional y no hay plan gratuito de cómputo: toda organizacion necesita un método de pago registrado. Sin ese paso, `fly launch` se detiene y `fly volumes create` falla despues con `app not found`, porque la aplicacion nunca llegó a crearse.

### Cuánto cuesta

Precios consultados en agosto de 2026 en [fly.io/docs/about/pricing](https://fly.io/docs/about/pricing/):

| Concepto | Precio | En esta configuración |
|---|---|---|
| Máquina `shared-cpu-1x`, 512 MB | US$0,0046/hora — US$3,32/mes | Una máquina |
| Disco persistente | US$0,15 por GB/mes | 1 GB → US$0,15 |
| Tráfico de salida (Suramérica) | US$0,04 por GB | Céntimos: la aplicación mueve texto |

**Total aproximado: US$3,50 al mes.**

Dos formas de bajarlo, ambas con contrapartida:

- `auto_stop_machines = true` en `fly.toml` hace que solo se pague por las horas encendida. Con una tienda de ocho horas diarias baja a cerca de un dólar al mes, a cambio de unos segundos de espera en el primer acceso tras un rato de inactividad.
- Bajar la memoria a 256 MB abarata la maquina. La aplicación consume poco.

### 3. Crea la aplicación

Desde la raíz del repositorio:

```bash
fly launch --no-deploy
```

Responde **no** cuando pregunte si quiere sobrescribir la configuración: `fly.toml` ya está escrito. Si el nombre `stokio` está ocupado, elige otro y actualiza el campo `app` del archivo.

### 4. Crea el disco

```bash
fly volumes create datos_stokio --size 1 --region bog
```

Un giga sobra: la base de datos de un catálogo de este tamaño pesa unos pocos megas.

### 5. Despliega

```bash
fly deploy
```

La primera vez tarda varios minutos, porque compila `better-sqlite3`. Las siguientes son rápidas: mientras no cambien las dependencias, Fly reutiliza esa capa.

### 6. Crea el usuario inicial

La base del disco arranca vacía. Una sola vez:

```bash
fly ssh console -C "node /app/backend/src/db/seed.js"
```

Eso crea el administrador, los ambientes, el distribuidor y las dieciséis variantes de camiseta. **Entra y cambia la contraseña inmediatamente.**

### 7. Abre la aplicación

```bash
fly open
```

Tu URL será `https://stokio.fly.dev` o el nombre que hayas elegido.

---

## Uso diario

| Qué quieres | Comando |
|---|---|
| Publicar cambios | `git push` y luego `fly deploy` |
| Ver los registros | `fly logs` |
| Estado de la máquina | `fly status` |
| Entrar por consola | `fly ssh console` |
| Descargar la base | `fly ssh sftp get /datos/inventario.db` |

### Copias de seguridad

El disco de Fly no se respalda solo. Si se pierde, se perdió el inventario.

Descarga la base cada cierto tiempo:

```bash
fly ssh sftp get /datos/inventario.db copia-inventario.db
```

Guárdala fuera del repositorio: contiene datos reales del negocio.

---

## Decisiones que conviene entender

**Una sola máquina, a propósito.** SQLite es un archivo en un disco, y ese disco solo puede montarlo una máquina a la vez. Escalar a dos instancias corrompería la base. Por eso `fly.toml` fija `min_machines_running = 1` y no más.

**La máquina no se apaga sola.** `auto_stop_machines` está en `false`. Apagarla ahorraría algo de dinero, pero el primer acceso tras un rato de inactividad tardaría unos segundos en responder, y eso estorba cuando hay alguien esperando en el mostrador.

**Cuándo dejaría de servir SQLite.** El día que varias personas registren movimientos a la vez desde dispositivos distintos, o quieras la aplicación en más de un servidor. Ese día toca Postgres, y es un cambio real: la capa de datos son 83 consultas síncronas repartidas en trece archivos, y `pg` es asíncrono. Mientras seas tú vendiendo, SQLite sobra.
