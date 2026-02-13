import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filtroAsistenciaSchema } from "@/lib/validations";
import { tieneAccesoHistorial } from "@/types";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);

    if (!tieneAccesoHistorial(user.rol)) {
      return NextResponse.json(
        { error: "No tiene permisos para exportar datos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const filtros = {
      fechaDesde: searchParams.get("fechaDesde") || undefined,
      fechaHasta: searchParams.get("fechaHasta") || undefined,
      unidadId: searchParams.get("unidadId") || undefined,
      puestoId: searchParams.get("puestoId") || undefined,
      userId: searchParams.get("userId") || undefined,
      rol: searchParams.get("rol") || undefined,
      turno: searchParams.get("turno") || undefined,
      estado: searchParams.get("estado") || undefined,
      ciudad: searchParams.get("ciudad") || undefined,
      busqueda: searchParams.get("busqueda") || undefined,
    };

    const result = filtroAsistenciaSchema.safeParse({
      ...filtros,
      pagina: "1",
      porPagina: "10000",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Filtros inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      fechaDesde,
      fechaHasta,
      unidadId,
      puestoId,
      userId,
      rol: rolFiltro,
      turno,
      estado,
      ciudad,
      busqueda,
    } = result.data;

    const where: any = {};

    if (fechaDesde && fechaHasta) {
      where.fechaTurno = {
        gte: fechaDesde,
        lte: fechaHasta,
      };
    } else if (fechaDesde) {
      where.fechaTurno = { gte: fechaDesde };
    } else if (fechaHasta) {
      where.fechaTurno = { lte: fechaHasta };
    }

    if (unidadId) where.unidadId = unidadId;
    if (puestoId) where.puestoId = puestoId;
    if (userId) where.userId = userId;
    if (turno) where.turno = turno;
    if (ciudad) where.ciudadDetectada = { contains: ciudad, mode: "insensitive" };

    if (estado === "solo_ingreso") {
      where.checkInAt = { not: null };
      where.checkOutAt = null;
    } else if (estado === "completo") {
      where.checkOutAt = { not: null };
    }

    if (busqueda) {
      where.OR = [
        { usuario: { nombres: { contains: busqueda, mode: "insensitive" } } },
        { usuario: { apellidos: { contains: busqueda, mode: "insensitive" } } },
        { unidad: { nombre: { contains: busqueda, mode: "insensitive" } } },
        { puesto: { nombre: { contains: busqueda, mode: "insensitive" } } },
      ];
    }

    if (rolFiltro) {
      where.usuario = { ...where.usuario, rol: rolFiltro };
    }

    const asistencias = await prisma.asistencia.findMany({
      where,
      include: {
        usuario: {
          select: {
            nombres: true,
            apellidos: true,
            rol: true,
          },
        },
        unidad: {
          select: {
            nombre: true,
            ciudad: true,
          },
        },
        puesto: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Asistencias");

    // Encabezados
    worksheet.columns = [
      { header: "Fecha Turno", key: "fechaTurno", width: 15 },
      { header: "Turno", key: "turno", width: 10 },
      { header: "Agente", key: "agente", width: 30 },
      { header: "Rol", key: "rol", width: 15 },
      { header: "Unidad", key: "unidad", width: 25 },
      { header: "Ciudad", key: "ciudad", width: 15 },
      { header: "Puesto", key: "puesto", width: 25 },
      { header: "Hora Ingreso", key: "checkInAt", width: 20 },
      { header: "Hora Salida", key: "checkOutAt", width: 20 },
      { header: "Horas Trabajadas", key: "horasTrabajadas", width: 18 },
      { header: "Ciudad Detectada", key: "ciudadDetectada", width: 18 },
      { header: "Coordenadas", key: "coordenadas", width: 25 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "3B82F6" },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };

    // Datos
    asistencias.forEach((a) => {
      worksheet.addRow({
        fechaTurno: a.fechaTurno,
        turno: a.turno,
        agente: `${a.usuario.nombres} ${a.usuario.apellidos}`,
        rol: a.usuario.rol,
        unidad: a.unidad.nombre,
        ciudad: a.unidad.ciudad,
        puesto: a.puesto.nombre,
        checkInAt: a.checkInAt
          ? new Date(a.checkInAt).toLocaleString("es-PE")
          : "-",
        checkOutAt: a.checkOutAt
          ? new Date(a.checkOutAt).toLocaleString("es-PE")
          : "-",
        horasTrabajadas: a.horasTrabajadas?.toFixed(2) || "-",
        ciudadDetectada: a.ciudadDetectada || "-",
        coordenadas:
          a.lat && a.lng ? `${a.lat}, ${a.lng}` : "-",
      });
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="asistencias_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error al exportar Excel:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
