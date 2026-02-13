export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crearUsuarioSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("GET /api/usuarios error:", error);
    return NextResponse.json({ error: "Error al listar usuarios" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();

    const parsed = crearUsuarioSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { username, password, nombres, apellidos, rol, activo } = parsed.data;

    const existe = await prisma.usuario.findUnique({ where: { username } });
    if (existe) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const usuario = await prisma.usuario.create({
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

    return NextResponse.json({ usuario }, { status: 201 });
  } catch (error) {
    console.error("POST /api/usuarios error:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
