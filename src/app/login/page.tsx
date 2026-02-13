"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Unidad, Puesto } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [dataError, setDataError] = useState("");
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [puestosFiltrados, setPuestosFiltrados] = useState<Puesto[]>([]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    unidadId: "",
    puestoId: "",
  });

  // Cargar unidades y puestos
  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoadingData(true);
      setDataError("");
      
      try {
        console.log("Cargando unidades y puestos...");
        
        const [resUnidades, resPuestos] = await Promise.all([
          fetch("/api/unidades?activo=true"),
          fetch("/api/puestos?activo=true"),
        ]);

        console.log("Respuesta unidades:", resUnidades.status);
        console.log("Respuesta puestos:", resPuestos.status);

        if (!resUnidades.ok) {
          const errorData = await resUnidades.json().catch(() => ({}));
          throw new Error(errorData.error || `Error al cargar unidades: ${resUnidades.status}`);
        }
        
        if (!resPuestos.ok) {
          const errorData = await resPuestos.json().catch(() => ({}));
          throw new Error(errorData.error || `Error al cargar puestos: ${resPuestos.status}`);
        }

        const dataUnidades = await resUnidades.json();
        const dataPuestos = await resPuestos.json();
        
        console.log("Unidades cargadas:", dataUnidades.unidades?.length || 0);
        console.log("Puestos cargados:", dataPuestos.puestos?.length || 0);
        
        setUnidades(dataUnidades.unidades || []);
        setPuestos(dataPuestos.puestos || []);
        
        if (!dataUnidades.unidades || dataUnidades.unidades.length === 0) {
          setDataError("No hay unidades disponibles. Contacte al administrador.");
        }
      } catch (error: any) {
        console.error("Error al cargar datos:", error);
        setDataError(error.message || "Error al cargar datos. Verifique su conexión.");
      } finally {
        setIsLoadingData(false);
      }
    };

    cargarDatos();
  }, []);

  // Filtrar puestos cuando cambia la unidad
  useEffect(() => {
    if (formData.unidadId) {
      const filtrados = puestos.filter(
        (p) => p.unidadId === formData.unidadId
      );
      setPuestosFiltrados(filtrados);
      // Reset puesto si la unidad cambia
      if (!filtrados.find((p) => p.id === formData.puestoId)) {
        setFormData((prev) => ({ ...prev, puestoId: "" }));
      }
    } else {
      setPuestosFiltrados([]);
      setFormData((prev) => ({ ...prev, puestoId: "" }));
    }
  }, [formData.unidadId, puestos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validaciones
    if (!formData.username.trim()) {
      setError("Ingrese su usuario");
      return;
    }
    if (!formData.password) {
      setError("Ingrese su contraseña");
      return;
    }
    if (!formData.unidadId) {
      setError("Seleccione una unidad");
      return;
    }
    if (!formData.puestoId) {
      setError("Seleccione un puesto");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/mi-asistencia");
        router.refresh();
      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const unidadOptions = unidades.map((u) => ({
    value: u.id,
    label: `${u.nombre} (${u.ciudad})`,
  }));

  const puestoOptions = puestosFiltrados.map((p) => ({
    value: p.id,
    label: p.nombre,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Seguridad</h1>
          <p className="text-primary-100">Sistema de Control de Asistencia</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}
          
          {dataError && (
            <Alert variant="warning" className="mb-6">
              {dataError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Usuario"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              required
              placeholder="Ingrese su usuario"
              disabled={isLoading}
            />

            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              placeholder="Ingrese su contraseña"
              disabled={isLoading}
            />

            <Select
              label="Unidad"
              value={formData.unidadId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unidadId: e.target.value }))
              }
              options={unidadOptions}
              placeholder={isLoadingData ? "Cargando unidades..." : "Seleccione una unidad"}
              required
              loading={isLoadingData}
              disabled={isLoading || isLoadingData || unidades.length === 0}
            />

            <Select
              label="Puesto"
              value={formData.puestoId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, puestoId: e.target.value }))
              }
              options={puestoOptions}
              placeholder={
                !formData.unidadId 
                  ? "Primero seleccione una unidad" 
                  : puestosFiltrados.length === 0 
                    ? "No hay puestos disponibles" 
                    : "Seleccione un puesto"
              }
              required
              disabled={!formData.unidadId || puestosFiltrados.length === 0 || isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isLoadingData || unidades.length === 0}
              className="w-full"
            >
              {isLoadingData ? "Cargando datos..." : "Ingresar"}
            </Button>
          </form>

          {/* Debug info - solo para desarrollo */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <p>Unidades: {unidades.length}</p>
              <p>Puestos: {puestos.length}</p>
              <p>Puestos filtrados: {puestosFiltrados.length}</p>
              <p>Cargando: {isLoadingData ? "Sí" : "No"}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-500 mb-2">
              Credenciales de prueba:
            </p>
            <div className="grid grid-cols-1 gap-1 text-xs text-gray-400">
              <p><strong>admin</strong> / Admin123!</p>
              <p><strong>supervisor</strong> / Supervisor123!</p>
              <p><strong>agente</strong> / Agente123!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-200 text-sm mt-8">
          © {new Date().getFullYear()} Sistema de Seguridad. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
