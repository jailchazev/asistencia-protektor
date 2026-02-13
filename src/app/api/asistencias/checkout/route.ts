import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkOutSchema } from "@/lib/validations";
import { Turno } from "@/types";
import { cookies } from "next/headers";

function getTurnoActual(): Turno {
  const hora = new Date().getHours();
  return hora >= 7 && hora < 19 ? Turno.DIA : Turno.NOCHE;
}

function getFechaTurno(): string {
  const ahora = new Date();
  const hora = ahora.getHours();

  if (hora < 7) {
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    return ayer.toISOString().split("T")[0];
  }

  return ahora.toISOString().split("T")[0];
}

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);

    const body = await request.json();

    const result = checkOutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { asistenciaId, lat, lng } = result.data;

    // Verificar que la asistencia pertenezca al usuario
    const asistencia = await prisma.asistencia.findFirst({
      where: {
        id: asistenciaId,
        userId: user.id,
      },
    });

    if (!asistencia) {
      return NextResponse.json(
        { error: "Registro de asistencia no encontrado" },
        { status: 404 }
      );
    }

    if (!asistencia.checkInAt) {
      return NextResponse.json(
        { error: "Debe registrar su ingreso primero" },
        { status: 400 }
      );
    }

    if (asistencia.checkOutAt) {
      return NextResponse.json(
        { error: "Ya ha registrado su salida para este turno" },
        { status: 400 }
      );
    }

    // Calcular horas trabajadas
    const checkIn = new Date(asistencia.checkInAt);
    const checkOut = new Date();
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const horasTrabajadas = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    const asistenciaActualizada = await prisma.asistencia.update({
      where: { id: asistenciaId },
      data: {
        checkOutAt: checkOut,
        horasTrabajadas,
        lat: lat || asistencia.lat,
        lng: lng || asistencia.lng,
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

    // Cerrar sesión automáticamente
    const cookieStore = cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("unidadId");
    cookieStore.delete("puestoId");

    return NextResponse.json({
      asistencia: asistenciaActualizada,
      mensaje: "Salida registrada correctamente. Sesión cerrada.",
    });
  } catch (error) {
    console.error("Error en check-out:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
