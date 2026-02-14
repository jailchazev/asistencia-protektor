import { PrismaClient, Rol, Turno } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Reglas:
 * - Producción: NO borrar data. Solo crear si faltan (idempotente).
 * - Dev/Local: si SEED_RESET=true => borra todo y recrea.
 */
const IS_PROD = process.env.NODE_ENV === "production";
const SEED_RESET = process.env.SEED_RESET === "true";

async function main() {
  console.log("🌱 Iniciando seed...");
  console.log(`ENV: NODE_ENV=${process.env.NODE_ENV} | SEED_RESET=${SEED_RESET}`);

  // 🚫 Producción: nunca borres
  if (IS_PROD && SEED_RESET) {
    console.log("🚫 SEED_RESET está activo pero estamos en producción. BLOQUEADO.");
    return;
  }

  // ✅ Dev/Local: opcional reset total
  if (!IS_PROD && SEED_RESET) {
    console.log("🧹 SEED_RESET=true en dev/local -> limpiando datos (orden seguro FK)...");
    await prisma.asistencia.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.puesto.deleteMany();
    await prisma.unidad.deleteMany();
    console.log("✅ Datos anteriores eliminados");
  } else {
    console.log("ℹ️ No se borrarán datos. Seed idempotente (crea solo si falta).");
  }

  // =========================
  // UNIDADES (upsert)
  // =========================
  console.log("🏢 Creando/verificando unidades...");

  const unidadesSeed = [
    {
      key: "Sede Principal Lima|Lima",
      nombre: "Sede Principal Lima",
      ciudad: "Lima",
      direccion: "Av. Javier Prado Este 1234, San Isidro",
    },
    {
      key: "Oficina Arequipa|Arequipa",
      nombre: "Oficina Arequipa",
      ciudad: "Arequipa",
      direccion: "Calle Mercaderes 456, Centro Histórico",
    },
    {
      key: "Sucursal Trujillo|Trujillo",
      nombre: "Sucursal Trujillo",
      ciudad: "Trujillo",
      direccion: "Av. España 789, Centro",
    },
    {
      key: "Oficina Cusco|Cusco",
      nombre: "Oficina Cusco",
      ciudad: "Cusco",
      direccion: "Av. El Sol 321, Centro",
    },
    {
      key: "Sucursal Piura|Piura",
      nombre: "Sucursal Piura",
      ciudad: "Piura",
      direccion: "Av. Sánchez Cerro 654, Centro",
    },
    {
      key: "Oficina Chiclayo|Chiclayo",
      nombre: "Oficina Chiclayo",
      ciudad: "Chiclayo",
      direccion: "Av. Balta 123, Centro",
    },
    {
      key: "Sede Iquitos|Iquitos",
      nombre: "Sede Iquitos",
      ciudad: "Iquitos",
      direccion: "Av. Abelardo Quiñones 789",
    },
  ] as const;

  // Como no sabemos si tienes constraint único en Unidad, hacemos findFirst + create/update
  async function upsertUnidad(data: { nombre: string; ciudad: string; direccion: string }) {
    const existing = await prisma.unidad.findFirst({
      where: { nombre: data.nombre, ciudad: data.ciudad },
    });

    if (existing) {
      return prisma.unidad.update({
        where: { id: existing.id },
        data: { direccion: data.direccion, activo: true },
      });
    }

    return prisma.unidad.create({
      data: { ...data, activo: true },
    });
  }

  const unidadLima = await upsertUnidad({
    nombre: "Sede Principal Lima",
    ciudad: "Lima",
    direccion: "Av. Javier Prado Este 1234, San Isidro",
  });

  const unidadArequipa = await upsertUnidad({
    nombre: "Oficina Arequipa",
    ciudad: "Arequipa",
    direccion: "Calle Mercaderes 456, Centro Histórico",
  });

  const unidadTrujillo = await upsertUnidad({
    nombre: "Sucursal Trujillo",
    ciudad: "Trujillo",
    direccion: "Av. España 789, Centro",
  });

  const unidadCusco = await upsertUnidad({
    nombre: "Oficina Cusco",
    ciudad: "Cusco",
    direccion: "Av. El Sol 321, Centro",
  });

  const unidadPiura = await upsertUnidad({
    nombre: "Sucursal Piura",
    ciudad: "Piura",
    direccion: "Av. Sánchez Cerro 654, Centro",
  });

  const unidadChiclayo = await upsertUnidad({
    nombre: "Oficina Chiclayo",
    ciudad: "Chiclayo",
    direccion: "Av. Balta 123, Centro",
  });

  const unidadIquitos = await upsertUnidad({
    nombre: "Sede Iquitos",
    ciudad: "Iquitos",
    direccion: "Av. Abelardo Quiñones 789",
  });

  console.log("✅ Unidades OK");

  // =========================
  // PUESTOS (create si no existe)
  // =========================
  console.log("📍 Creando/verificando puestos...");

  async function ensurePuesto(unidadId: string, nombre: string) {
    const existing = await prisma.puesto.findFirst({
      where: { unidadId, nombre },
    });
    if (existing) {
      // opcional: reactivar
      await prisma.puesto.update({
        where: { id: existing.id },
        data: { activo: true },
      });
      return existing;
    }
    return prisma.puesto.create({
      data: { unidadId, nombre, activo: true },
    });
  }

  const puestoLima1 = await ensurePuesto(unidadLima.id, "Recepción Principal");
  await ensurePuesto(unidadLima.id, "Vigilancia Externa");
  await ensurePuesto(unidadLima.id, "Control de Acceso");
  await ensurePuesto(unidadLima.id, "CCTV Centro de Control");
  await ensurePuesto(unidadLima.id, "Rondas Internas");

  await ensurePuesto(unidadArequipa.id, "Recepción");
  await ensurePuesto(unidadArequipa.id, "Vigilancia Perimetral");
  await ensurePuesto(unidadArequipa.id, "Rondas Internas");

  await ensurePuesto(unidadTrujillo.id, "Portería Principal");
  await ensurePuesto(unidadTrujillo.id, "Vigilancia Nocturna");

  await ensurePuesto(unidadCusco.id, "Recepción");
  await ensurePuesto(unidadCusco.id, "Seguridad Interna");

  await ensurePuesto(unidadPiura.id, "Control de Acceso");
  await ensurePuesto(unidadPiura.id, "Vigilancia");

  await ensurePuesto(unidadChiclayo.id, "Recepción");
  await ensurePuesto(unidadChiclayo.id, "Vigilancia");

  await ensurePuesto(unidadIquitos.id, "Control Principal");
  await ensurePuesto(unidadIquitos.id, "Vigilancia Fluvial");

  console.log("✅ Puestos OK");

  // =========================
  // USUARIOS (upsert por username)
  // =========================
  console.log("👤 Creando/verificando usuarios...");

  async function upsertUsuario(params: {
    username: string;
    password: string;
    nombres: string;
    apellidos: string;
    rol: Rol;
  }) {
    const passwordHash = await bcrypt.hash(params.password, 10);

    return prisma.usuario.upsert({
      where: { username: params.username },
      update: {
        nombres: params.nombres,
        apellidos: params.apellidos,
        rol: params.rol,
        activo: true,
        // ⚠️ en producción NO cambiamos password si ya existe
        ...(IS_PROD ? {} : { passwordHash }),
      },
      create: {
        username: params.username,
        passwordHash,
        nombres: params.nombres,
        apellidos: params.apellidos,
        rol: params.rol,
        activo: true,
      },
    });
  }

  const admin = await upsertUsuario({
    username: "admin",
    password: "Admin123!",
    nombres: "Administrador",
    apellidos: "Sistema",
    rol: Rol.admin,
  });

  const supervisor = await upsertUsuario({
    username: "supervisor",
    password: "Supervisor123!",
    nombres: "Juan Carlos",
    apellidos: "Rodríguez",
    rol: Rol.supervisor,
  });

  const agente = await upsertUsuario({
    username: "agente",
    password: "Agente123!",
    nombres: "Pedro Antonio",
    apellidos: "García",
    rol: Rol.agente,
  });

  await upsertUsuario({
    username: "jefe",
    password: "Jefe123!",
    nombres: "Miguel Ángel",
    apellidos: "López",
    rol: Rol.jefe,
  });

  await upsertUsuario({
    username: "gerente",
    password: "Gerente123!",
    nombres: "Ana María",
    apellidos: "Fernández",
    rol: Rol.gerente,
  });

  await upsertUsuario({
    username: "coordinador",
    password: "Coordinador123!",
    nombres: "Luis Alberto",
    apellidos: "Torres",
    rol: Rol.coordinador,
  });

  await upsertUsuario({
    username: "asistente",
    password: "Asistente123!",
    nombres: "Carmen Rosa",
    apellidos: "Díaz",
    rol: Rol.asistente,
  });

  await upsertUsuario({
    username: "centrocontrol",
    password: "Centro123!",
    nombres: "Roberto Carlos",
    apellidos: "Vargas",
    rol: Rol.centro_de_control,
  });

  await upsertUsuario({
    username: "oficina",
    password: "Oficina123!",
    nombres: "Diana Patricia",
    apellidos: "Mendoza",
    rol: Rol.oficina,
  });

  console.log("✅ Usuarios OK");

  // =========================
  // ASISTENCIA DEMO (solo si no existe hoy)
  // =========================
  console.log("📝 Creando/verificando asistencia demo...");

  const hoy = new Date();
  const fechaHoy = hoy.toISOString().split("T")[0];
  const hora = hoy.getHours();
  const turnoActual = hora >= 7 && hora < 19 ? Turno.DIA : Turno.NOCHE;

  const existeDemo = await prisma.asistencia.findFirst({
    where: {
      userId: agente.id,
      fechaTurno: fechaHoy,
      turno: turnoActual,
    },
  });

  if (!existeDemo) {
    await prisma.asistencia.create({
      data: {
        userId: agente.id,
        unidadId: unidadLima.id,
        puestoId: puestoLima1.id,
        turno: turnoActual,
        fechaTurno: fechaHoy,
        checkInAt: new Date(hoy.getTime() - 2 * 60 * 60 * 1000),
        lat: -12.0464,
        lng: -77.0428,
        ciudadDetectada: "Lima",
        deviceInfo: "seed",
      },
    });
    console.log("✅ Asistencia demo creada");
  } else {
    console.log("ℹ️ Asistencia demo ya existe, no se duplica");
  }

  console.log("🎉 SEED COMPLETADO EXITOSAMENTE");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
