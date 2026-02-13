"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import { UserSession, Unidad, Rol } from "@/types";

export default function UnidadesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState<Unidad | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    ciudad: "",
    direccion: "",
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
        if (data.user.rol !== Rol.admin) {
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

  const cargarUnidades = async () => {
    try {
      const res = await fetch("/api/unidades");
      if (res.ok) {
        const data = await res.json();
        setUnidades(data.unidades);
      }
    } catch (error) {
      console.error("Error al cargar unidades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarUnidades();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = editingUnidad ? `/api/unidades/${editingUnidad.id}` : "/api/unidades";
      const method = editingUnidad ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(editingUnidad ? "Unidad actualizada correctamente" : "Unidad creada correctamente");
        setShowModal(false);
        setEditingUnidad(null);
        setFormData({ nombre: "", ciudad: "", direccion: "", activo: true });
        cargarUnidades();
      } else {
        setError(data.error || "Error al guardar unidad");
      }
    } catch (error) {
      setError("Error de conexión. Intente nuevamente.");
    }
  };

  const handleEdit = (unidad: Unidad) => {
    setEditingUnidad(unidad);
    setFormData({
      nombre: unidad.nombre,
      ciudad: unidad.ciudad,
      direccion: unidad.direccion || "",
      activo: unidad.activo,
    });
    setShowModal(true);
  };

  const handleToggleActivo = async (unidad: Unidad) => {
    try {
      const res = await fetch(`/api/unidades/${unidad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !unidad.activo }),
      });

      if (res.ok) {
        setSuccess(`Unidad ${unidad.activo ? "desactivada" : "activada"} correctamente`);
        cargarUnidades();
      }
    } catch (error) {
      setError("Error al cambiar estado de la unidad");
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Unidades</h1>
          <Button
            variant="primary"
            onClick={() => {
              setEditingUnidad(null);
              setFormData({ nombre: "", ciudad: "", direccion: "", activo: true });
              setShowModal(true);
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Unidad
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puestos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unidades.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{u.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{u.ciudad}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{u.direccion || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(u as any).puestos?.length || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${u.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {u.activo ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(u)} className="text-primary-600 hover:text-primary-800">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleToggleActivo(u)} className={u.activo ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}>
                          {u.activo ? (
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
                  {editingUnidad ? "Editar Unidad" : "Nueva Unidad"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                  <Input
                    label="Ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    required
                  />
                  <Input
                    label="Dirección"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="text-sm text-gray-700">Unidad activa</label>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingUnidad ? "Guardar Cambios" : "Crear Unidad"}
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
