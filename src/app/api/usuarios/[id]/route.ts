import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { actualizarUsuarioSchema } from "@/lib/validations";
import { esAdmin } from "@/types";

// GET - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    if (!esAdmin(user.rol)) {
      return NextResponse.json(
        { error: "No tiene permisos para ver usuarios" },
        { status: 403 }
      );
    }

    const { id } = params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nombres: true,
        apellidos: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ usuario });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    if (!esAdmin(user.rol)) {
      return NextResponse.json(
        { error: "No tiene permisos para actualizar usuarios" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const result = actualizarUsuarioSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: any = { ...result.data };

    // Si hay contraseña, hashearla
    if (updateData.password) {
      updateData.passwordHash = await hashPassword(updateData.password);
      delete updateData.password;
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        nombres: true,
        apellidos: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ usuario });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    if (!esAdmin(user.rol)) {
      return NextResponse.json(
        { error: "No tiene permisos para eliminar usuarios" },
        { status: 403 }
      );
    }

    const { id } = params;

    // No permitir eliminar el propio usuario
    if (id === user.id) {
      return NextResponse.json(
        { error: "No puede eliminar su propio usuario" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        username: true,
        nombres: true,
        apellidos: true,
        rol: true,
        activo: true,
      },
    });

    return NextResponse.json({ usuario });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
