import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { actualizarUnidadSchema } from "@/lib/validations";
import { esAdmin } from "@/types";

// GET - Obtener unidad por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const unidad = await prisma.unidad.findUnique({
      where: { id },
      include: {
        puestos: true,
      },
    });

    if (!unidad) {
      return NextResponse.json(
        { error: "Unidad no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ unidad });
  } catch (error) {
    console.error("Error al obtener unidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar unidad
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    if (!esAdmin(user.rol)) {
      return NextResponse.json(
        { error: "No tiene permisos para actualizar unidades" },
        { status: 403 }
      );
    }

    const { id } = params;

    const body = await request.json();

    const result = actualizarUnidadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const unidad = await prisma.unidad.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ unidad });
  } catch (error) {
    console.error("Error al actualizar unidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar unidad (desactivar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    if (!esAdmin(user.rol)) {
      return NextResponse.json(
        { error: "No tiene permisos para eliminar unidades" },
        { status: 403 }
      );
    }

    const { id } = params;

    const unidad = await prisma.unidad.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ unidad });
  } catch (error) {
    console.error("Error al eliminar unidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
