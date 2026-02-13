import { PrismaClient, Rol, Turno } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpiar datos existentes
  await prisma.asistencia.deleteMany();
  await prisma.puesto.deleteMany();
  await prisma.unidad.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("✅ Datos anteriores eliminados");

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
  const puestoLima2 = await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "Vigilancia Externa", activo: true },
  });
  const puestoLima3 = await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "Control de Acceso", activo: true },
  });
  const puestoLima4 = await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "CCTV Centro de Control", activo: true },
  });
  const puestoLima5 = await prisma.puesto.create({
    data: { unidadId: unidadLima.id, nombre: "Rondas Internas", activo: true },
  });

  // Puestos Arequipa
  const puestoArequipa1 = await prisma.puesto.create({
    data: { unidadId: unidadArequipa.id, nombre: "Recepción", activo: true },
  });
  const puestoArequipa2 = await prisma.puesto.create({
    data: { unidadId: unidadArequipa.id, nombre: "Vigilancia Perimetral", activo: true },
  });
  const puestoArequipa3 = await prisma.puesto.create({
    data: { unidadId: unidadArequipa.id, nombre: "Rondas Internas", activo: true },
  });

  // Puestos Trujillo
  const puestoTrujillo1 = await prisma.puesto.create({
    data: { unidadId: unidadTrujillo.id, nombre: "Portería Principal", activo: true },
  });
  const puestoTrujillo2 = await prisma.puesto.create({
    data: { unidadId: unidadTrujillo.id, nombre: "Vigilancia Nocturna", activo: true },
  });

  // Puestos Cusco
  const puestoCusco1 = await prisma.puesto.create({
    data: { unidadId: unidadCusco.id, nombre: "Recepción", activo: true },
  });
  const puestoCusco2 = await prisma.puesto.create({
    data: { unidadId: unidadCusco.id, nombre: "Seguridad Interna", activo: true },
  });

  // Puestos Piura
  const puestoPiura1 = await prisma.puesto.create({
    data: { unidadId: unidadPiura.id, nombre: "Control de Acceso", activo: true },
  });
  const puestoPiura2 = await prisma.puesto.create({
    data: { unidadId: unidadPiura.id, nombre: "Vigilancia", activo: true },
  });

  // Puestos Chiclayo
  const puestoChiclayo1 = await prisma.puesto.create({
    data: { unidadId: unidadChiclayo.id, nombre: "Recepción", activo: true },
  });
  const puestoChiclayo2 = await prisma.puesto.create({
    data: { unidadId: unidadChiclayo.id, nombre: "Vigilancia", activo: true },
  });

  // Puestos Iquitos
  const puestoIquitos1 = await prisma.puesto.create({
    data: { unidadId: unidadIquitos.id, nombre: "Control Principal", activo: true },
  });
  const puestoIquitos2 = await prisma.puesto.create({
    data: { unidadId: unidadIquitos.id, nombre: "Vigilancia Fluvial", activo: true },
  });

  console.log("✅ 18 puestos creados");

  // ========== ASISTENCIAS DE EJEMPLO ==========
  console.log("📝 Creando asistencias de ejemplo...");

  const hoy = new Date();
  const fechaHoy = hoy.toISOString().split("T")[0];
  const hora = hoy.getHours();
  const turnoActual = hora >= 7 && hora < 19 ? Turno.DIA : Turno.NOCHE;

  // Asistencia de hoy para el agente (con ingreso)
  await prisma.asistencia.create({
    data: {
      userId: agente.id,
      unidadId: unidadLima.id,
      puestoId: puestoLima1.id,
      turno: turnoActual,
      fechaTurno: fechaHoy,
      checkInAt: new Date(hoy.getTime() - 2 * 60 * 60 * 1000), // 2 horas atrás
      lat: -12.0464,
      lng: -77.0428,
      ciudadDetectada: "Lima",
      deviceInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  // Asistencias de días anteriores (para mostrar en historial y mapa)
  const fechasAnteriores = [
    new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000),
    new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000),
    new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000),
  ];

  // Coordenadas de ejemplo para diferentes ciudades
  const coordenadas = [
    { lat: -12.0464, lng: -77.0428, ciudad: "Lima" },
    { lat: -16.3989, lng: -71.535, ciudad: "Arequipa" },
    { lat: -8.1159, lng: -79.03, ciudad: "Trujillo" },
    { lat: -13.1631, lng: -72.545, ciudad: "Cusco" },
    { lat: -5.1945, lng: -80.6328, ciudad: "Piura" },
    { lat: -6.7714, lng: -79.8409, ciudad: "Chiclayo" },
    { lat: -3.7491, lng: -73.2538, ciudad: "Iquitos" },
  ];

  // Crear asistencias para diferentes usuarios y fechas
  const usuariosParaAsistencias = [agente, supervisor, jefe, coordinador];
  const unidadesParaAsistencias = [
    unidadLima, unidadArequipa, unidadTrujillo, unidadCusco,
    unidadPiura, unidadChiclayo, unidadIquitos
  ];

  for (const fecha of fechasAnteriores) {
    const fechaStr = fecha.toISOString().split("T")[0];
    
    for (let i = 0; i < 5; i++) {
      const usuario = usuariosParaAsistencias[i % usuariosParaAsistencias.length];
      const unidad = unidadesParaAsistencias[i % unidadesParaAsistencias.length];
      const coord = coordenadas[i % coordenadas.length];
      const turno = i % 2 === 0 ? Turno.DIA : Turno.NOCHE;
      
      // Buscar un puesto de la unidad
      const puesto = await prisma.puesto.findFirst({
        where: { unidadId: unidad.id },
      });

      if (puesto) {
        const checkIn = new Date(fecha);
        checkIn.setHours(turno === Turno.DIA ? 7 : 19, 0, 0, 0);
        
        const checkOut = new Date(checkIn);
        checkOut.setHours(turno === Turno.DIA ? 19 : 7, 0, 0, 0);
        if (turno === Turno.NOCHE) {
          checkOut.setDate(checkOut.getDate() + 1);
        }

        const horasTrabajadas = 12;

        await prisma.asistencia.create({
          data: {
            userId: usuario.id,
            unidadId: unidad.id,
            puestoId: puesto.id,
            turno,
            fechaTurno: fechaStr,
            checkInAt: checkIn,
            checkOutAt: checkOut,
            horasTrabajadas,
            lat: coord.lat + (Math.random() - 0.5) * 0.01,
            lng: coord.lng + (Math.random() - 0.5) * 0.01,
            ciudadDetectada: coord.ciudad,
            deviceInfo: "Mozilla/5.0",
          },
        });
      }
    }
  }

  // Asistencia incompleta (solo ingreso, sin salida) para ayer
  const ayer = new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000);
  const puestoArequipa = await prisma.puesto.findFirst({
    where: { unidadId: unidadArequipa.id },
  });

  if (puestoArequipa) {
    await prisma.asistencia.create({
      data: {
        userId: supervisor.id,
        unidadId: unidadArequipa.id,
        puestoId: puestoArequipa.id,
        turno: Turno.NOCHE,
        fechaTurno: ayer.toISOString().split("T")[0],
        checkInAt: new Date(ayer.setHours(19, 0, 0, 0)),
        lat: -16.3989,
        lng: -71.535,
        ciudadDetectada: "Arequipa",
      },
    });
  }

  console.log("✅ Asistencias de ejemplo creadas");

  // ========== RESUMEN ==========
  console.log("\n" + "=".repeat(50));
  console.log("🎉 SEED COMPLETADO EXITOSAMENTE!");
  console.log("=".repeat(50));
  console.log("\n📋 RESUMEN:");
  console.log(`   • 9 usuarios creados`);
  console.log(`   • 7 unidades creadas`);
  console.log(`   • 18 puestos creados`);
  console.log(`   • Múltiples asistencias de ejemplo`);
  console.log("\n🔑 CREDENCIALES DE PRUEBA:");
  console.log("   ┌─────────────────┬───────────────────┬──────────────────┐");
  console.log("   │ Usuario         │ Contraseña        │ Rol              │");
  console.log("   ├─────────────────┼───────────────────┼──────────────────┤");
  console.log("   │ admin           │ Admin123!         │ Administrador    │");
  console.log("   │ supervisor      │ Supervisor123!    │ Supervisor       │");
  console.log("   │ agente          │ Agente123!        │ Agente           │");
  console.log("   │ jefe            │ Jefe123!          │ Jefe             │");
  console.log("   │ gerente         │ Gerente123!       │ Gerente          │");
  console.log("   │ coordinador     │ Coordinador123!   │ Coordinador      │");
  console.log("   │ asistente       │ Asistente123!     │ Asistente        │");
  console.log("   │ centrocontrol   │ Centro123!        │ Centro de Control│");
  console.log("   │ oficina         │ Oficina123!       │ Oficina          │");
  console.log("   └─────────────────┴───────────────────┴──────────────────┘");
  console.log("\n🚀 Para iniciar la aplicación:");
  console.log("   npm run dev");
  console.log("\n📱 La aplicación estará disponible en:");
  console.log("   http://localhost:3000");
  console.log("\n" + "=".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
