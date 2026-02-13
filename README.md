# Sistema de Control de Asistencia - Seguridad

Aplicación web PWA para gestión de registro de asistencia del personal de seguridad. Desarrollada con Next.js, TypeScript, TailwindCSS, PostgreSQL y Prisma.

## Características

- **Autenticación JWT** con roles y permisos
- **Registro de asistencia** con geolocalización
- **Historial de asistencias** con filtros avanzados
- **Exportación** a Excel y PDF
- **Mapa en tiempo real** con Leaflet
- **PWA instalable** con soporte offline
- **Gestión de usuarios, unidades y puestos**

## Stack Tecnológico

- **Runtime:** Node.js LTS
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS
- **Base de datos:** PostgreSQL
- **ORM:** Prisma
- **Autenticación:** JWT (jose)
- **Mapas:** Leaflet / React-Leaflet
- **Exportación:** ExcelJS, jsPDF

## Requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
cd my-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/seguridad_asistencia?schema=public"
JWT_SECRET="tu-secreto-jwt-super-seguro-minimo-32-caracteres"
JWT_REFRESH_SECRET="tu-secreto-refresh-super-seguro-minimo-32-caracteres"
```

4. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE seguridad_asistencia;
```

5. Ejecutar migraciones:
```bash
npx prisma migrate dev
```

6. Generar cliente Prisma:
```bash
npx prisma generate
```

7. Poblar base de datos con datos de prueba:
```bash
npm run db:seed
```

8. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | Admin123! | Administrador |
| supervisor | Supervisor123! | Supervisor |
| agente | Agente123! | Agente |

## Instalación PWA

### Android (Chrome)
1. Abrir la aplicación en Chrome
2. Tocar el menú (⋮) → "Agregar a pantalla de inicio"
3. Confirmar la instalación

### iOS (Safari)
1. Abrir la aplicación en Safari
2. Tocar el botón Compartir → "Agregar a Inicio"
3. Confirmar la instalación

### Desktop (Chrome/Edge)
1. Abrir la aplicación
2. Click en el icono de instalación en la barra de direcciones
3. Confirmar la instalación

## Estructura del Proyecto

```
my-app/
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   └── seed.ts          # Datos iniciales
├── src/
│   ├── app/             # Rutas de Next.js
│   │   ├── api/         # API Routes
│   │   ├── login/       # Página de login
│   │   ├── mi-asistencia/
│   │   ├── historial/
│   │   ├── mapa/
│   │   └── admin/
│   ├── components/      # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades
│   ├── types/           # Tipos TypeScript
│   └── middleware.ts    # Middleware de autenticación
├── public/              # Archivos estáticos
│   ├── manifest.json    # Configuración PWA
│   └── icons/           # Iconos de la app
└── package.json
```

## Roles y Permisos

| Rol | Mi Asistencia | Historial | Mapa | Usuarios | Unidades | Puestos |
|-----|--------------|-----------|------|----------|----------|---------|
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| supervisor | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| agente | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| jefe | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| gerente | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| coordinador | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| asistente | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| centro_de_control | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| oficina | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/refresh` - Refrescar token

### Usuarios (Admin)
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Desactivar usuario

### Unidades (Admin)
- `GET /api/unidades` - Listar unidades
- `POST /api/unidades` - Crear unidad
- `PUT /api/unidades/:id` - Actualizar unidad
- `DELETE /api/unidades/:id` - Desactivar unidad

### Puestos (Admin)
- `GET /api/puestos` - Listar puestos
- `POST /api/puestos` - Crear puesto
- `PUT /api/puestos/:id` - Actualizar puesto
- `DELETE /api/puestos/:id` - Desactivar puesto

### Asistencias
- `GET /api/asistencias` - Listar asistencias (con filtros)
- `POST /api/asistencias` - Registrar ingreso
- `POST /api/asistencias/checkout` - Registrar salida
- `GET /api/asistencias/actual` - Obtener asistencia del turno actual

### Exportación
- `GET /api/exportar/excel` - Exportar a Excel
- `GET /api/exportar/pdf` - Exportar a PDF

## Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar base de datos
npm run db:studio    # Abrir Prisma Studio
```

## Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | Sí |
| `JWT_SECRET` | Secreto para firmar tokens JWT | Sí |
| `JWT_REFRESH_SECRET` | Secreto para tokens de refresco | Sí |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app | No |
| `NODE_ENV` | Entorno (development/production) | No |

## Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens JWT con expiración (8 horas access, 7 días refresh)
- Cookies httpOnly y secure en producción
- Validación de inputs con Zod
- Protección de rutas por roles
- Prevención de duplicados en asistencias

## Licencia

MIT
