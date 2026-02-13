import { PrismaClient, Rol, Turno } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ✅ Limpiar datos existentes (orden seguro por FK)
  await prisma.asistencia.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.puesto.deleteMany();
  await prisma.unidad.deleteMany();

  console.log("✅ Datos anteriores eliminados");

  // ========== UNIDADES ==========
  console.log("🏢 Creando unidades...");

  const unidadLima = await prisma.unidad.create({
    data: {
      nombre: "Sede Principal Lima",
      ciudad: "Lima",
      direccion: "Av. Javier Prado Este 1234, San Isidro",
      activo: true,
    },
  });

  const unidadArequipa = await prisma.unidad.create({
    data: {
      nombre: "Oficina Arequipa",
      ciudad: "Arequipa",
      direccion: "Calle Mercaderes 456, Centro Histórico",
      activo: true,
    },
  });

  const unidadTrujillo = await prisma.unidad.create({
    data: {
      nombre: "Sucursal Trujillo",
      ciudad: "Trujillo",
      direccion: "Av. España 789, Centro",
      activo: true,
    },
  });

  const unidadCusco = await prisma.unidad.create({
    data: {
      nombre: "Oficina Cusco",
      ciudad: "Cusco",
      direccion: "Av. El Sol 321, Centro",
      activo: true,
    },
  });

  const unidadPiura = await prisma.unidad.create({
    data: {
      nombre: "Sucursal Piura",
      ciudad: "Piura",
      direccion: "Av. Sánchez Cerro 654, Centro",
      activo: true,
    },
  });

  const unidadChiclayo = await prisma.unidad.create({
    data: {
      nombre: "Oficina Chiclayo",
      ciudad: "Chiclayo",
      direccion: "Av. Balta 123, Centro",
      activo: true,
    },
  });

  const unidadIquitos = await prisma.unidad.create({
    data: {
      nombre: "Sede Iquitos",
      ciudad: "Iquitos",
      direccion: "Av. Abelardo Quiñones 789",
      activo: true,
    },
  });

  console.log("✅ 7 unidades creadas");

  // ========== PUESTOS ==========
  console.log("📍 Creando puestos...");

  // Puestos Lima
  const puestoLima1 = await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "Recepción Principal", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "Vigilancia Externa", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "Control de Acceso", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "CCTV Centro de Control", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "Rondas Internas", activo: true },
  });

  // Puestos Arequipa
  const puestoArequipa1 = await prisma.puesto.create({
    data: { unidadId: unidadArequipa.id, nombre: "Recepción", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadArequipa.id, nombre: "Vigilancia Perimetral", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadArequipa.id, nombre: "Rondas Internas", activo: true },
  });

  // Puestos Trujillo
  const puestoTrujillo1 = await prisma.puesto.create({
    data: { unidadId: unidadTrujillo.id, nombre: "Portería Principal", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadTrujillo.id, nombre: "Vigilancia Nocturna", activo: true },
  });

  // Puestos Cusco
  const puestoCusco1 = await prisma.puesto.create({
    data: { unidadId: unidadCusco.id, nombre: "Recepción", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadCusco.id, nombre: "Seguridad Interna", activo: true },
  });

  // Puestos Piura
  const puestoPiura1 = await prisma.puesto.create({
    data: { unidadId: unidadPiura.id, nombre: "Control de Acceso", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadPiura.id, nombre: "Vigilancia", activo: true },
  });

  // Puestos Chiclayo
  const puestoChiclayo1 = await prisma.puesto.create({
    data: { unidadId: unidadChiclayo.id, nombre: "Recepción", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadChiclayo.id, nombre: "Vigilancia", activo: true },
  });

  // Puestos Iquitos
  const puestoIquitos1 = await prisma.puesto.create({
    data: { unidadId: unidadIquitos.id, nombre: "Control Principal", activo: true },
  });
  await prisma.puesto.create({
    data: { unidadId: unidadIquitos.id, nombre: "Vigilancia Fluvial", activo: true },
  });

  console.log("✅ Puestos creados");

  // ========== USUARIOS ==========
  console.log("👤 Creando usuarios...");

  const admin = await prisma.usuario.create({
    data: {
      username: "admin",
      passwordHash: await bcrypt.hash("Admin123!", 10),
      nombres: "Administrador",
      apellidos: "Sistema",
      rol: Rol.admin,
      activo: true,
    },
  });

  const supervisor = await prisma.usuario.create({
    data: {
      username: "supervisor",
      passwordHash: await bcrypt.hash("Supervisor123!", 10),
      nombres: "Juan Carlos",
      apellidos: "Rodríguez",
      rol: Rol.supervisor,
      activo: true,
    },
  });

  const agente = await prisma.usuario.create({
    data: {
      username: "agente",
      passwordHash: await bcrypt.hash("Agente123!", 10),
      nombres: "Pedro Antonio",
      apellidos: "García",
      rol: Rol.agente,
      activo: true,
    },
  });

  const jefe = await prisma.usuario.create({
    data: {
      username: "jefe",
      passwordHash: await bcrypt.hash("Jefe123!", 10),
      nombres: "Miguel Ángel",
      apellidos: "López",
      rol: Rol.jefe,
      activo: true,
    },
  });

  const gerente = await prisma.usuario.create({
    data: {
      username: "gerente",
      passwordHash: await bcrypt.hash("Gerente123!", 10),
      nombres: "Ana María",
      apellidos: "Fernández",
      rol: Rol.gerente,
      activo: true,
    },
  });

  const coordinador = await prisma.usuario.create({
    data: {
      username: "coordinador",
      passwordHash: await bcrypt.hash("Coordinador123!", 10),
      nombres: "Luis Alberto",
      apellidos: "Torres",
      rol: Rol.coordinador,
      activo: true,
    },
  });

  const asistente = await prisma.usuario.create({
    data: {
      username: "asistente",
      passwordHash: await bcrypt.hash("Asistente123!", 10),
      nombres: "Carmen Rosa",
      apellidos: "Díaz",
      rol: Rol.asistente,
      activo: true,
    },
  });

  const centroControl = await prisma.usuario.create({
    data: {
      username: "centrocontrol",
      passwordHash: await bcrypt.hash("Centro123!", 10),
      nombres: "Roberto Carlos",
      apellidos: "Vargas",
      rol: Rol.centro_de_control,
      activo: true,
    },
  });

  const oficina = await prisma.usuario.create({
    data: {
      username: "oficina",
      passwordHash: await bcrypt.hash("Oficina123!", 10),
      nombres: "Diana Patricia",
      apellidos: "Mendoza",
      rol: Rol.oficina,
      activo: true,
    },
  });

  console.log("✅ 9 usuarios creados");

  // ========== ASISTENCIAS DE EJEMPLO ==========
  console.log("📝 Creando asistencias de ejemplo...");

  const hoy = new Date();
  const fechaHoy = hoy.toISOString().split("T")[0];
  const hora = hoy.getHours();
  const turnoActual = hora >= 7 && hora < 19 ? Turno.DIA : Turno.NOCHE;

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
      deviceInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  console.log("✅ Asistencia demo creada");
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
