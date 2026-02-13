export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crearUnidadSchema, actualizarUnidadSchema } from "@/lib/validations";
import { esAdmin } from "@/types";

// GET - Listar unidades (PÚBLICO - no requiere autenticación)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activo = searchParams.get("activo");

    const where: any = {};

    if (activo !== null && activo !== undefined) {
      where.activo = activo === "true";
    } else {
      where.activo = true;
    }

    const unidades = await prisma.unidad.findMany({
      where,
      include: {
        puestos: {
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            activo: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ unidades });
  } catch (error) {
    console.error("Error al listar unidades:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear unidad
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
        { error: "No tiene permisos para crear unidades" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const result = crearUnidadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { nombre, ciudad, direccion, activo } = result.data;

    const unidad = await prisma.unidad.create({
      data: {
        nombre,
        ciudad,
        direccion,
        activo,
      },
    });

    return NextResponse.json({ unidad }, { status: 201 });
  } catch (error) {
    console.error("Error al crear unidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
