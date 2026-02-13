"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import { UserSession, Puesto, Unidad, Rol } from "@/types";

export default function PuestosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPuesto, setEditingPuesto] = useState<Puesto | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    unidadId: "",
    nombre: "",
    activo: true,
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
        if (data.user.rol !== "admin") {
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

  const cargarDatos = async () => {
    try {
      const [resPuestos, resUnidades] = await Promise.all([
        fetch("/api/puestos"),
        fetch("/api/unidades"),
      ]);

      if (resPuestos.ok && resUnidades.ok) {
        const dataPuestos = await resPuestos.json();
        const dataUnidades = await resUnidades.json();
        setPuestos(dataPuestos.puestos);
        setUnidades(dataUnidades.unidades);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = editingPuesto ? `/api/puestos/${editingPuesto.id}` : "/api/puestos";
      const method = editingPuesto ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingPuesto ? "Puesto actualizado correctamente" : "Puesto creado correctamente");
        setShowModal(false);
        setEditingPuesto(null);
        setFormData({ unidadId: "", nombre: "", activo: true });
        cargarDatos();
      } else {
        setError(data.error || "Error al guardar puesto");
      }
    } catch (error) {
      setError("Error de conexión. Intente nuevamente.");
    }
  };

  const handleEdit = (puesto: Puesto) => {
    setEditingPuesto(puesto);
    setFormData({
      unidadId: puesto.unidadId,
      nombre: puesto.nombre,
      activo: puesto.activo,
    });
    setShowModal(true);
  };

  const handleToggleActivo = async (puesto: Puesto) => {
    try {
      const res = await fetch(`/api/puestos/${puesto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !puesto.activo }),
      });

      if (res.ok) {
        setSuccess(`Puesto ${puesto.activo ? "desactivado" : "activado"} correctamente`);
        cargarDatos();
      }
    } catch (error) {
      setError("Error al cambiar estado del puesto");
    }
  };

  const unidadOptions = unidades.map((u) => ({
    value: u.id,
    label: `${u.nombre} (${u.ciudad})`,
  }));

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Puestos</h1>
          <Button
            variant="primary"
            onClick={() => {
              setEditingPuesto(null);
              setFormData({ unidadId: "", nombre: "", activo: true });
              setShowModal(true);
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Puesto
          </Button>
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {puestos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{p.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{p.unidad?.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{p.unidad?.ciudad}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${p.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(p)} className="text-primary-600 hover:text-primary-800">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleToggleActivo(p)} className={p.activo ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}>
                          {p.activo ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {editingPuesto ? "Editar Puesto" : "Nuevo Puesto"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Select
                    label="Unidad"
                    value={formData.unidadId}
                    onChange={(e) => setFormData({ ...formData, unidadId: e.target.value })}
                    options={unidadOptions}
                    required
                  />
                  <Input
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="text-sm text-gray-700">Puesto activo</label>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingPuesto ? "Guardar Cambios" : "Crear Puesto"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
