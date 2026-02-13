import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { actualizarPuestoSchema } from "@/lib/validations";
import { esAdmin } from "@/types";

// GET - Obtener puesto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const puesto = await prisma.puesto.findUnique({
      where: { id },
      include: {
        unidad: true,
      },
    });

    if (!puesto) {
      return NextResponse.json(
        { error: "Puesto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ puesto });
  } catch (error) {
    console.error("Error al obtener puesto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar puesto
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
        { error: "No tiene permisos para actualizar puestos" },
        { status: 403 }
      );
    }

    const { id } = params;

    const body = await request.json();

    const result = actualizarPuestoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const puesto = await prisma.puesto.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ puesto });
  } catch (error) {
    console.error("Error al actualizar puesto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar puesto (desactivar)
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
        { error: "No tiene permisos para eliminar puestos" },
        { status: 403 }
      );
    }

    const { id } = params;

    const puesto = await prisma.puesto.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ puesto });
  } catch (error) {
    console.error("Error al eliminar puesto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
