"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import { UserSession, Asistencia, Unidad, Puesto, Usuario, Turno, tieneAccesoMapa } from "@/types";
import type { Rol } from "@/types";


// Importar Leaflet dinámicamente para evitar problemas de SSR
const MapaLeaflet = dynamic(() => import("@/components/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  ),
});

export default function MapaPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    unidadId: "",
    puestoId: "",
    userId: "",
    turno: "",
  });

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!tieneAccesoMapa(data.user.rol)) {
          router.push("/mi-asistencia");
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    };

    cargarUsuario();
  }, [router]);

  useEffect(() => {
    const cargarDatos = async () => {
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
        console.error("Error al cargar datos:", error);
      }
    };

    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarAsistencias = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("porPagina", "1000");

      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/asistencias?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAsistencias(data.asistencias.filter((a: Asistencia) => a.lat && a.lng));
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

  // Actualización automática cada 30 segundos
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      cargarAsistencias();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, filtros]);

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarAsistencias();
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
      label: `${u.nombres} ${u.apellidos}`,
    })),
  ];

  const turnoOptions = [
    { value: "", label: "Todos los turnos" },
    { value: Turno.DIA, label: "Día" },
    { value: Turno.NOCHE, label: "Noche" },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="h-[calc(100vh-8rem)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Mapa de Asistencias</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Actualización en tiempo real
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-4">
          <form onSubmit={handleFiltrar}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  className="input-field text-sm py-1.5"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, fechaDesde: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  className="input-field text-sm py-1.5"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, fechaHasta: e.target.value }))}
                />
              </div>
              <Select
                label="Unidad"
                value={filtros.unidadId}
                onChange={(e) => setFiltros((prev) => ({ ...prev, unidadId: e.target.value }))}
                options={unidadOptions}
              />
              <Select
                label="Puesto"
                value={filtros.puestoId}
                onChange={(e) => setFiltros((prev) => ({ ...prev, puestoId: e.target.value }))}
                options={puestoOptions}
              />
              <Select
                label="Usuario"
                value={filtros.userId}
                onChange={(e) => setFiltros((prev) => ({ ...prev, userId: e.target.value }))}
                options={usuarioOptions}
              />
              <Select
                label="Turno"
                value={filtros.turno}
                onChange={(e) => setFiltros((prev) => ({ ...prev, turno: e.target.value }))}
                options={turnoOptions}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button type="submit" variant="primary" size="sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Filtrar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFiltros({
                    fechaDesde: "",
                    fechaHasta: "",
                    unidadId: "",
                    puestoId: "",
                    userId: "",
                    turno: "",
                  });
                  setTimeout(cargarAsistencias, 0);
                }}
              >
                Limpiar
              </Button>
            </div>
          </form>
        </div>

        {/* Mapa */}
        <div className="card h-[calc(100%-12rem)]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <MapaLeaflet asistencias={asistencias} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
