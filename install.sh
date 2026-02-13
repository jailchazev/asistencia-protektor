#!/bin/bash

# Script de instalación para el Sistema de Asistencia

echo "🚀 Instalando Sistema de Control de Asistencia..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instale Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️ PostgreSQL no está instalado o no está en el PATH"
    echo "Por favor instale PostgreSQL 14+ y cree la base de datos 'seguridad_asistencia'"
fi

# Entrar al directorio del proyecto
cd my-app

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"

# Configurar variables de entorno
if [ ! -f .env ]; then
    echo "📝 Configurando variables de entorno..."
    cp .env.example .env
    echo "⚠️ Por favor edite el archivo .env con sus credenciales de PostgreSQL"
fi

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Error al generar cliente Prisma"
    exit 1
fi

echo "✅ Cliente Prisma generado"

echo ""
echo "🎉 Instalación completada!"
echo ""
echo "Próximos pasos:"
echo "1. Configure su base de datos PostgreSQL en el archivo .env"
echo "2. Ejecute: npx prisma migrate dev"
echo "3. Ejecute: npm run db:seed"
echo "4. Inicie el servidor: npm run dev"
echo ""
echo "La aplicación estará disponible en http://localhost:3000"
echo ""
echo "Credenciales de prueba:"
echo "  - admin / Admin123!"
echo "  - supervisor / Supervisor123!"
echo "  - agente / Agente123!"
