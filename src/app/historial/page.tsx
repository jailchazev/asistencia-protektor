"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import { UserSession, Asistencia, Unidad, Puesto, Usuario, Turno, ROL } from "@/types";
import type { Rol } from "@/types";


interface Paginacion {
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
}

export default function HistorialPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    unidadId: "",
    puestoId: "",
    userId: "",
    rol: "",
    turno: "",
    estado: "",
    ciudad: "",
    busqueda: "",
  });

  // Cargar usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    };

    cargarUsuario();
  }, [router]);

  // Cargar datos de filtros
  useEffect(() => {
    const cargarDatosFiltros = async () => {
      try {
        const [resUnidades, resPuestos, resUsuarios] = await Promise.all([
          fetch("/api/unidades"),
          fetch("/api/puestos"),
          fetch("/api/usuarios"),
        ]);

        if (resUnidades.ok) {
          const data = await resUnidades.json();
          setUnidades(data.unidades);
        }
        if (resPuestos.ok) {
          const data = await resPuestos.json();
          setPuestos(data.puestos);
        }
        if (resUsuarios.ok) {
          const data = await resUsuarios.json();
          setUsuarios(data.usuarios);
        }
      } catch (error) {
        console.error("Error al cargar datos de filtros:", error);
      }
    };

    if (user) {
      cargarDatosFiltros();
    }
  }, [user]);

  // Cargar asistencias
  const cargarAsistencias = async (pagina = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("pagina", pagina.toString());
      params.append("porPagina", "20");

      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/asistencias?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAsistencias(data.asistencias);
        setPaginacion(data.paginacion);
      }
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarAsistencias();
    }
  }, [user]);

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarAsistencias(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      unidadId: "",
      puestoId: "",
      userId: "",
      rol: "",
      turno: "",
      estado: "",
      ciudad: "",
      busqueda: "",
    });
    setTimeout(() => cargarAsistencias(1), 0);
  };

  const exportarExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/exportar/excel?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `asistencias_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al exportar Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportarPDF = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/exportar/pdf?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `asistencias_${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const unidadOptions = [
    { value: "", label: "Todas las unidades" },
    ...unidades.map((u) => ({ value: u.id, label: `${u.nombre} (${u.ciudad})` })),
  ];

  const puestoOptions = [
    { value: "", label: "Todos los puestos" },
    ...puestos.map((p) => ({ value: p.id, label: p.nombre })),
  ];

  const usuarioOptions = [
    { value: "", label: "Todos los usuarios" },
    ...usuarios.map((u) => ({
      value: u.id,
      label: `${u.nombres} ${u.apellidos} (${u.username})`,
    })),
  ];

  const rolOptions = [
  { value: "", label: "Todos los roles" },
  ...Object.values(ROL).map((r) => ({
    value: r,
    label: r.replace("_", " ").toUpperCase(),
  })),
];


  const turnoOptions = [
    { value: "", label: "Todos los turnos" },
    { value: Turno.DIA, label: "Día (07:00 - 19:00)" },
    { value: Turno.NOCHE, label: "Noche (19:00 - 07:00)" },
  ];

  const estadoOptions = [
    { value: "", label: "Todos los estados" },
    { value: "solo_ingreso", label: "Solo Ingreso" },
    { value: "completo", label: "Completo" },
  ];

  return (
    <DashboardLayout user={user}>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Historial de Asistencias</h1>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={exportarExcel}
              isLoading={isExporting}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </Button>
            <Button
              variant="secondary"
              onClick={exportarPDF}
              isLoading={isExporting}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-6">
          <form onSubmit={handleFiltrar}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={filtros.fechaDesde}
                  onChange={(e) =>
                    setFiltros((prev) => ({ ...prev, fechaDesde: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={filtros.fechaHasta}
                  onChange={(e) =>
                    setFiltros((prev) => ({ ...prev, fechaHasta: e.target.value }))
                  }
                />
              </div>
              <Select
                label="Unidad"
                value={filtros.unidadId}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, unidadId: e.target.value }))
                }
                options={unidadOptions}
              />
              <Select
                label="Puesto"
                value={filtros.puestoId}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, puestoId: e.target.value }))
                }
                options={puestoOptions}
              />
              <Select
                label="Usuario"
                value={filtros.userId}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, userId: e.target.value }))
                }
                options={usuarioOptions}
              />
              <Select
                label="Rol"
                value={filtros.rol}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, rol: e.target.value }))
                }
                options={rolOptions}
              />
              <Select
                label="Turno"
                value={filtros.turno}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, turno: e.target.value }))
                }
                options={turnoOptions}
              />
              <Select
                label="Estado"
                value={filtros.estado}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, estado: e.target.value }))
                }
                options={estadoOptions}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Filtrar
              </Button>
              <Button type="button" variant="secondary" onClick={handleLimpiarFiltros}>
                Limpiar
              </Button>
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turno
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puesto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salida
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : asistencias.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron registros
                    </td>
                  </tr>
                ) : (
                  asistencias.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {a.fechaTurno}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            a.turno === Turno.DIA
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {a.turno}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {a.usuario?.nombres} {a.usuario?.apellidos}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {a.unidad?.nombre}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {a.puesto?.nombre}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {a.checkInAt
                          ? new Date(a.checkInAt).toLocaleString("es-PE")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {a.checkOutAt
                          ? new Date(a.checkOutAt).toLocaleString("es-PE")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {a.horasTrabajadas?.toFixed(2) || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {paginacion && paginacion.totalPaginas > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                Mostrando {(paginacion.pagina - 1) * paginacion.porPagina + 1} a{" "}
                {Math.min(paginacion.pagina * paginacion.porPagina, paginacion.total)} de{" "}
                {paginacion.total} resultados
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => cargarAsistencias(paginacion.pagina - 1)}
                  disabled={paginacion.pagina === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => cargarAsistencias(paginacion.pagina + 1)}
                  disabled={paginacion.pagina === paginacion.totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
