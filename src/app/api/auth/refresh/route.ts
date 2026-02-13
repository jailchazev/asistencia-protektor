import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, createAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No hay token de refresco" },
        { status: 401 }
      );
    }

    const user = await verifyRefreshToken(refreshToken);

    if (!user) {
      return NextResponse.json(
        { error: "Token de refresco inválido" },
        { status: 401 }
      );
    }

    const newAccessToken = await createAccessToken(user);

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en refresh:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
