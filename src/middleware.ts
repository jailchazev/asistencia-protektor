import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./lib/auth";
import { Rol, ROLES_CON_HISTORIAL, ROLES_CON_MAPA, ROLES_ADMIN } from "./types";

// Rutas que no requieren autenticación
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/refresh",
];

// Rutas de API públicas (GET solo, no requieren auth)
const PUBLIC_API_GET_PATHS = [
  "/api/unidades",
  "/api/puestos",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isPublicApiGetPath(pathname: string, method: string): boolean {
  if (method !== "GET") return false;
  return PUBLIC_API_GET_PATHS.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Permitir rutas públicas
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Permitir GET a rutas de API públicas
  if (isPublicApiGetPath(pathname, method)) {
    return NextResponse.next();
  }

  // Permitir archivos estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sw") ||
    pathname.startsWith("/workbox") ||
    pathname.startsWith("/icons") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Verificar token para rutas protegidas
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await verifyAccessToken(token);

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verificar permisos por ruta
  if (pathname.startsWith("/admin/") || pathname.startsWith("/historial")) {
    if (!ROLES_CON_HISTORIAL.includes(user.rol)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "No tiene permisos para acceder a este recurso" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/mi-asistencia", request.url));
    }
  }

  if (pathname.startsWith("/admin/usuarios") || pathname.startsWith("/admin/unidades") || pathname.startsWith("/admin/puestos")) {
    if (!ROLES_ADMIN.includes(user.rol)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "No tiene permisos para acceder a este recurso" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/mi-asistencia", request.url));
    }
  }

  if (pathname.startsWith("/mapa")) {
    if (!ROLES_CON_MAPA.includes(user.rol)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "No tiene permisos para acceder a este recurso" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/mi-asistencia", request.url));
    }
  }

  // Agregar usuario al header para uso en API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user", JSON.stringify(user));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
