export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crearPuestoSchema } from "@/lib/validations";

export async function GET() {
  try {
    const puestos = await prisma.puesto.findMany({
      orderBy: { createdAt: "desc" },
      include: { unidad: true },
    });

    return NextResponse.json({ puestos });
  } catch (error) {
    console.error("GET /api/puestos error:", error);
    return NextResponse.json({ error: "Error al listar puestos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();

    const parsed = crearPuestoSchema.safeParse(json);
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

    const { unidadId, nombre, activo } = parsed.data;

    const puesto = await prisma.puesto.create({
      data: { unidadId, nombre, activo },
      include: { unidad: true },
    });

    return NextResponse.json({ puesto }, { status: 201 });
  } catch (error) {
    console.error("POST /api/puestos error:", error);
    return NextResponse.json({ error: "Error al crear puesto" }, { status: 500 });
  }
}
