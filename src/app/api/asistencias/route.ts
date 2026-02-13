export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkInSchema, filtroAsistenciaSchema } from "@/lib/validations";
import { Turno, tieneAccesoHistorial } from "@/types";

function getTurnoActual(): Turno {
  const hora = new Date().getHours();
  return hora >= 7 && hora < 19 ? Turno.DIA : Turno.NOCHE;
}

function getFechaTurno(): string {
  const ahora = new Date();
  const hora = ahora.getHours();

  // Si es turno noche después de medianoche, la fecha del turno es el día anterior
  if (hora < 7) {
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    return ayer.toISOString().split("T")[0];
  }

  return ahora.toISOString().split("T")[0];
}

// GET - Listar asistencias
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);

    const { searchParams } = new URL(request.url);

    const filtros = {
      fechaDesde: searchParams.get("fechaDesde") || undefined,
      fechaHasta: searchParams.get("fechaHasta") || undefined,
      unidadId: searchParams.get("unidadId") || undefined,
      puestoId: searchParams.get("puestoId") || undefined,
      userId: searchParams.get("userId") || undefined,
      rol: searchParams.get("rol") || undefined,
      turno: searchParams.get("turno") || undefined,
      estado: searchParams.get("estado") || undefined,
      ciudad: searchParams.get("ciudad") || undefined,
      busqueda: searchParams.get("busqueda") || undefined,
      pagina: searchParams.get("pagina") || "1",
      porPagina: searchParams.get("porPagina") || "20",
    };

    const result = filtroAsistenciaSchema.safeParse(filtros);
    if (!result.success) {
      return NextResponse.json(
        { error: "Filtros inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      fechaDesde,
      fechaHasta,
      unidadId,
      puestoId,
      userId,
      rol: rolFiltro,
      turno,
      estado,
      ciudad,
      busqueda,
      pagina,
      porPagina,
    } = result.data;

    // Si no tiene acceso al historial, solo puede ver sus propias asistencias
    if (!tieneAccesoHistorial(user.rol)) {
      filtros.userId = user.id;
    }

    const where: any = {};

    if (fechaDesde && fechaHasta) {
      where.fechaTurno = {
        gte: fechaDesde,
        lte: fechaHasta,
      };
    } else if (fechaDesde) {
      where.fechaTurno = { gte: fechaDesde };
    } else if (fechaHasta) {
      where.fechaTurno = { lte: fechaHasta };
    }

    if (unidadId) where.unidadId = unidadId;
    if (puestoId) where.puestoId = puestoId;
    if (userId) where.userId = userId;
    if (turno) where.turno = turno;
    if (ciudad) where.ciudadDetectada = { contains: ciudad, mode: "insensitive" };

    if (estado === "solo_ingreso") {
      where.checkInAt = { not: null };
      where.checkOutAt = null;
    } else if (estado === "completo") {
      where.checkOutAt = { not: null };
    }

    if (busqueda) {
      where.OR = [
        { usuario: { nombres: { contains: busqueda, mode: "insensitive" } } },
        { usuario: { apellidos: { contains: busqueda, mode: "insensitive" } } },
        { unidad: { nombre: { contains: busqueda, mode: "insensitive" } } },
        { puesto: { nombre: { contains: busqueda, mode: "insensitive" } } },
      ];
    }

    if (rolFiltro) {
      where.usuario = { ...where.usuario, rol: rolFiltro };
    }

    const page = parseInt(pagina);
    const limit = parseInt(porPagina);
    const skip = (page - 1) * limit;

    const [asistencias, total] = await Promise.all([
      prisma.asistencia.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              username: true,
              nombres: true,
              apellidos: true,
              rol: true,
            },
          },
          unidad: {
            select: {
              id: true,
              nombre: true,
              ciudad: true,
            },
          },
          puesto: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.asistencia.count({ where }),
    ]);

    return NextResponse.json({
      asistencias,
      paginacion: {
        pagina: page,
        porPagina: limit,
        total,
        totalPaginas: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al listar asistencias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Check-in
export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);

    const body = await request.json();

    const result = checkInSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { unidadId, puestoId, lat, lng, ciudadDetectada, deviceInfo } =
      result.data;

    // Verificar que unidad y puesto coincidan con la sesión
    if (unidadId !== user.unidadId || puestoId !== user.puestoId) {
      return NextResponse.json(
        { error: "La unidad o puesto no coinciden con su sesión" },
        { status: 403 }
      );
    }

    const turno = getTurnoActual();
    const fechaTurno = getFechaTurno();

    // Verificar si ya existe un registro para este turno
    const existente = await prisma.asistencia.findUnique({
      where: {
        userId_unidadId_puestoId_fechaTurno_turno: {
          userId: user.id,
          unidadId,
          puestoId,
          fechaTurno,
          turno,
        },
      },
    });

    if (existente?.checkInAt) {
      return NextResponse.json(
        { error: "Ya ha registrado su ingreso para este turno" },
        { status: 400 }
      );
    }

    // Obtener IP
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    let asistencia;

    if (existente) {
      asistencia = await prisma.asistencia.update({
        where: { id: existente.id },
        data: {
          checkInAt: new Date(),
          lat,
          lng,
          ciudadDetectada,
          ip: ip.toString(),
          deviceInfo,
        },
        include: {
          usuario: {
            select: {
              id: true,
              username: true,
              nombres: true,
              apellidos: true,
              rol: true,
            },
          },
          unidad: {
            select: {
              id: true,
              nombre: true,
              ciudad: true,
            },
          },
          puesto: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });
    } else {
      asistencia = await prisma.asistencia.create({
        data: {
          userId: user.id,
          unidadId,
          puestoId,
          turno,
          fechaTurno,
          checkInAt: new Date(),
          lat,
          lng,
          ciudadDetectada,
          ip: ip.toString(),
          deviceInfo,
        },
        include: {
          usuario: {
            select: {
              id: true,
              username: true,
              nombres: true,
              apellidos: true,
              rol: true,
            },
          },
          unidad: {
            select: {
              id: true,
              nombre: true,
              ciudad: true,
            },
          },
          puesto: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ asistencia }, { status: 201 });
  } catch (error) {
    console.error("Error en check-in:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
