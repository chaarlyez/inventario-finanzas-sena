# Imagen de Stokio.
#
# Dos etapas: la primera compila las dependencias, la segunda solo lleva
# lo necesario para ejecutar. `better-sqlite3` es un módulo nativo y hay
# que compilarlo, pero el compilador no tiene por qué viajar al servidor.

# ---------- Etapa 1: dependencias ----------
FROM node:22-slim AS dependencias

# Herramientas que necesita node-gyp para compilar better-sqlite3.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Solo los manifiestos primero: mientras no cambien, Docker reutiliza la
# capa de dependencias y el despliegue es mucho más rápido.
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev


# ---------- Etapa 2: imagen final ----------
FROM node:22-slim AS final

# tini se encarga de reenviar las señales de apagado a Node, para que la
# base de datos se cierre bien cuando la plataforma detiene el servidor.
RUN apt-get update && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080
# La base vive en el disco montado, no junto al código: si estuviera
# dentro de la imagen, cada despliegue la borraría.
ENV DATA_DIR=/datos

WORKDIR /app

COPY --from=dependencias /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY frontend ./frontend

# El proceso no corre como root.
RUN mkdir -p /datos && chown -R node:node /app /datos
USER node

EXPOSE 8080

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "backend/src/index.js"]
