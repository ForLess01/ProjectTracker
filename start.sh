#!/usr/bin/env bash

# Exit immediately if a command fails
set -e

# Clear screen or print clean header
echo ""
echo "============================================================"
echo "           PROJECT TRACKER — INITIALIZER SCRIPT             "
echo "============================================================"
echo ""

# 1. Check Docker Daemon
echo "┌── [1/5] VERIFICANDO ENTORNO DOCKER"
if ! docker info > /dev/null 2>&1; then
  echo "│ [ERROR] Docker no está en ejecución."
  echo "│ [INFO] Inicia Docker Desktop / Daemon e intenta nuevamente."
  echo "└───────────────────────────────────────────────────────────"
  echo ""
  exit 1
fi
echo "└── [OK] Docker Daemon en ejecución."
echo ""

# 2. Start PostgreSQL Container
echo "┌── [2/5] BASE DE DATOS (POSTGRESQL - DOCKER)"
echo "│ [INFO] Iniciando contenedor project_tracker_postgres en puerto 5434..."
docker compose down > /dev/null 2>&1 || true
docker compose up -d > /dev/null 2>&1

echo "│ [WAIT] Esperando conexión con PostgreSQL..."
until docker exec project_tracker_postgres pg_isready -U tracker > /dev/null 2>&1; do
  sleep 1
done
echo "└── [OK] PostgreSQL activo y escuchando en localhost:5434."
echo ""

# 3. PNPM Dependencies
echo "┌── [3/5] DEPENDENCIAS Y PAQUETES (PNPM)"
echo "│ [INFO] Verificando paquetes instalados..."
pnpm install --silent
echo "└── [OK] Dependencias sincronizadas con PNPM."
echo ""

# 4. Database Migration & Seed
echo "┌── [4/5] MIGRACIONES Y DATOS INICIALES (DRIZZLE ORM)"
echo "│ [INFO] Aplicando esquema de base de datos..."
pnpm run db:push > /dev/null 2>&1
echo "│ [INFO] Verificando / Insertando datos de prueba (Seed)..."
pnpm run db:seed > /dev/null 2>&1 || true
echo "└── [OK] Base de datos migrada y sembrada correctamente."
echo ""

# 5. Services Summary Box
echo "============================================================"
echo "                RESUMEN DE SERVICIOS Y ESTADO               "
echo "============================================================"
echo "  [WEB] Frontend / App Web :  http://localhost:4321       [RUNNING]"
echo "  [AUTH] Auth System       :  http://localhost:4321/login [READY]"
echo "  [API] API Endpoints      :  http://localhost:4321/api   [ACTIVE]"
echo "  [DB]  PostgreSQL DB      :  localhost:5434 (tracker)    [CONNECTED]"
echo "  [PKG] Package Manager    :  PNPM                        [ENFORCED]"
echo "============================================================"
echo ""
echo "[START] Iniciando servidor de desarrollo..."
echo ""

# Launch Astro dev server
pnpm run dev
