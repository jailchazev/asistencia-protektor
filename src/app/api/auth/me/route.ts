export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

// ✅ Fuerza Node.js (evita Edge Runtime y errores con bcryptjs)
export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    const token = cookies().get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await verifyAccessToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error en me:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
