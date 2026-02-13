import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Turno } from "@/types";

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

export async function GET(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);

    const turno = getTurnoActual();
    const fechaTurno = getFechaTurno();

    const asistencia = await prisma.asistencia.findUnique({
      where: {
        userId_unidadId_puestoId_fechaTurno_turno: {
          userId: user.id,
          unidadId: user.unidadId,
          puestoId: user.puestoId,
          fechaTurno,
          turno,
        },
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

    return NextResponse.json({ asistencia });
  } catch (error) {
    console.error("Error al obtener asistencia actual:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
