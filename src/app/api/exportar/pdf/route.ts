import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filtroAsistenciaSchema } from "@/lib/validations";
import { tieneAccesoHistorial } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

    // Crear PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Asistencias", 14, 20);

    // Información de la empresa
    doc.setFontSize(10);
    doc.text("Sistema de Seguridad - Control de Asistencia", 14, 28);
    doc.text(`Fecha de emisión: ${new Date().toLocaleString("es-PE")}`, 14, 33);
    doc.text(`Generado por: ${user.nombres} ${user.apellidos}`, 14, 38);

    // Filtros aplicados
    let yPos = 48;
    doc.setFontSize(10);
    doc.text("Filtros aplicados:", 14, yPos);
    yPos += 5;

    const filtrosAplicados = [];
    if (fechaDesde) filtrosAplicados.push(`Desde: ${fechaDesde}`);
    if (fechaHasta) filtrosAplicados.push(`Hasta: ${fechaHasta}`);
    if (unidadId) {
      const unidad = await prisma.unidad.findUnique({
        where: { id: unidadId },
        select: { nombre: true },
      });
      filtrosAplicados.push(`Unidad: ${unidad?.nombre || unidadId}`);
    }
    if (turno) filtrosAplicados.push(`Turno: ${turno}`);
    if (estado) filtrosAplicados.push(`Estado: ${estado}`);
    if (ciudad) filtrosAplicados.push(`Ciudad: ${ciudad}`);

    if (filtrosAplicados.length === 0) {
      filtrosAplicados.push("Ninguno");
    }

    doc.setFontSize(9);
    filtrosAplicados.forEach((filtro) => {
      doc.text(`• ${filtro}`, 18, yPos);
      yPos += 4;
    });

    // Tabla de datos
    const tableData = asistencias.map((a) => [
      a.fechaTurno,
      a.turno,
      `${a.usuario.nombres} ${a.usuario.apellidos}`,
      a.usuario.rol,
      a.unidad.nombre,
      a.puesto.nombre,
      a.checkInAt ? new Date(a.checkInAt).toLocaleString("es-PE") : "-",
      a.checkOutAt ? new Date(a.checkOutAt).toLocaleString("es-PE") : "-",
      a.horasTrabajadas?.toFixed(2) || "-",
    ]);

    autoTable(doc, {
      head: [
        [
          "Fecha",
          "Turno",
          "Agente",
          "Rol",
          "Unidad",
          "Puesto",
          "Ingreso",
          "Salida",
          "Horas",
        ],
      ],
      body: tableData,
      startY: yPos + 5,
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total de registros: ${asistencias.length}`, 14, finalY);

    const totalHoras = asistencias.reduce(
      (sum, a) => sum + (a.horasTrabajadas || 0),
      0
    );
    doc.text(`Total horas trabajadas: ${totalHoras.toFixed(2)}`, 14, finalY + 5);

    // Generar PDF
    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="asistencias_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al exportar PDF:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
