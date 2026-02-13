import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createAccessToken,
  createRefreshToken,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { username, password, unidadId, puestoId } = result.data;

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { username },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordValid = await verifyPassword(password, usuario.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Verificar que unidad y puesto existan
    const unidad = await prisma.unidad.findUnique({
      where: { id: unidadId, activo: true },
    });

    if (!unidad) {
      return NextResponse.json(
        { error: "La unidad seleccionada no existe o está inactiva" },
        { status: 400 }
      );
    }

    const puesto = await prisma.puesto.findUnique({
      where: { id: puestoId, unidadId, activo: true },
    });

    if (!puesto) {
      return NextResponse.json(
        { error: "El puesto seleccionado no existe o está inactivo" },
        { status: 400 }
      );
    }

    // Crear sesión
    const userSession = {
      id: usuario.id,
      username: usuario.username,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      rol: usuario.rol,
      unidadId,
      puestoId,
    };

    const accessToken = await createAccessToken(userSession);
    const refreshToken = await createRefreshToken(userSession);

    // Guardar tokens en cookies
    const cookieStore = cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 horas
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    // Guardar unidad y puesto en cookies separadas para fácil acceso
    cookieStore.set("unidadId", unidadId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    cookieStore.set("puestoId", puestoId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: userSession,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
