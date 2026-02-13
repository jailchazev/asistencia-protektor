export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crearPuestoSchema, actualizarPuestoSchema } from "@/lib/validations";
import { esAdmin } from "@/types";

// GET - Listar puestos (PÚBLICO - no requiere autenticación)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unidadId = searchParams.get("unidadId");
    const activo = searchParams.get("activo");

    const where: any = {};

    if (unidadId) {
      where.unidadId = unidadId;
    }

    if (activo !== null && activo !== undefined) {
      where.activo = activo === "true";
    } else {
      where.activo = true;
    }

    const puestos = await prisma.puesto.findMany({
      where,
      include: {
        unidad: {
          select: {
            id: true,
            nombre: true,
            ciudad: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ puestos });
  } catch (error) {
    console.error("Error al listar puestos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear puesto
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    if (!esAdmin(user.rol)) {
      return NextResponse.json(
        { error: "No tiene permisos para crear puestos" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const result = crearPuestoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { unidadId, nombre, activo } = result.data;

    // Verificar que la unidad exista
    const unidad = await prisma.unidad.findUnique({
      where: { id: unidadId },
    });

    if (!unidad) {
      return NextResponse.json(
        { error: "La unidad seleccionada no existe" },
        { status: 400 }
      );
    }

    const puesto = await prisma.puesto.create({
      data: {
        unidadId,
        nombre,
        activo,
      },
    });

    return NextResponse.json({ puesto }, { status: 201 });
  } catch (error) {
    console.error("Error al crear puesto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
