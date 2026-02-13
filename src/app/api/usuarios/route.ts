import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { crearUsuarioSchema } from "@/lib/validations";
import { esAdmin } from "@/types";

// GET - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
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

    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get("busqueda");
    const rol = searchParams.get("rol");
    const activo = searchParams.get("activo");

    const where: any = {};

    if (busqueda) {
      where.OR = [
        { username: { contains: busqueda, mode: "insensitive" } },
        { nombres: { contains: busqueda, mode: "insensitive" } },
        { apellidos: { contains: busqueda, mode: "insensitive" } },
      ];
    }

    if (rol) {
      where.rol = rol;
    }

    if (activo !== null && activo !== undefined) {
      where.activo = activo === "true";
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        username: true,
        nombres: true,
        apellidos: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear usuario
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
        { error: "No tiene permisos para crear usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const result = crearUsuarioSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { username, password, nombres, apellidos, rol, activo } = result.data;

    // Verificar si el username ya existe
    const existente = await prisma.usuario.findUnique({
      where: { username },
    });

    if (existente) {
      return NextResponse.json(
        { error: "El nombre de usuario ya está en uso" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        username,
        passwordHash,
        nombres,
        apellidos,
        rol,
        activo,
      },
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

    return NextResponse.json({ usuario: nuevoUsuario }, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
