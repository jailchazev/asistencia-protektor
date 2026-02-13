"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useGeolocation } from "@/hooks/useGeolocation";
import { UserSession, Asistencia, Turno } from "@/types";

function getTurnoActual(): Turno {
  const hora = new Date().getHours();
  return hora >= 7 && hora < 19 ? Turno.DIA : Turno.NOCHE;
}

function formatHora(turno: Turno): string {
  return turno === Turno.DIA ? "07:00 - 19:00" : "19:00 - 07:00";
}

export default function MiAsistenciaPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [asistencia, setAsistencia] = useState<Asistencia | null>(null);
  const [unidadNombre, setUnidadNombre] = useState("");
  const [puestoNombre, setPuestoNombre] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const { getLocation, loading: geoLoading, error: geoError } = useGeolocation();

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar usuario y asistencia actual
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resUser = await fetch("/api/auth/me");
        if (!resUser.ok) {
          router.push("/login");
          return;
        }

        const dataUser = await resUser.json();
        setUser(dataUser.user);

        // 🔥 NUEVO: obtener nombres de unidad y puesto desde API unidades
        const resUnidades = await fetch("/api/unidades?activo=true");
        if (resUnidades.ok) {
          const dataUnidades = await resUnidades.json();

          const unidad = dataUnidades.unidades?.find(
            (u: any) => u.id === dataUser.user.unidadId
          );

          setUnidadNombre(unidad?.nombre || "");

          const puesto = unidad?.puestos?.find(
            (p: any) => p.id === dataUser.user.puestoId
          );

          setPuestoNombre(puesto?.nombre || "");
        }

        const resAsistencia = await fetch("/api/asistencias/actual");
        if (resAsistencia.ok) {
          const dataAsistencia = await resAsistencia.json();
          setAsistencia(dataAsistencia.asistencia);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [router]);

  const handleCheckIn = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!user?.unidadId || !user?.puestoId) {
      setError("No tiene unidad o puesto asignado.");
      setIsSubmitting(false);
      return;
    }

    const location = await getLocation();

    if (!location) {
      setError(
        geoError ||
          "No se pudo obtener la ubicación. Por favor habilite la geolocalización."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/asistencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unidadId: user.unidadId,
          puestoId: user.puestoId,
          lat: location.lat,
          lng: location.lng,
          ciudadDetectada: "Lima",
          deviceInfo: navigator.userAgent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAsistencia(data.asistencia);
        setSuccess("Ingreso registrado correctamente");
      } else {
        setError(data.error || "Error al registrar ingreso");
      }
    } catch (error) {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const location = await getLocation();

    try {
      const response = await fetch("/api/asistencias/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asistenciaId: asistencia?.id,
          lat: location?.lat,
          lng: location?.lng,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Salida registrada correctamente. Cerrando sesión...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Error al registrar salida");
        setIsSubmitting(false);
      }
    } catch (error) {
      setError("Error de conexión. Intente nuevamente.");
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const turnoActual = getTurnoActual();
  const yaMarcadoIngreso = asistencia?.checkInAt != null;
  const yaMarcadoSalida = asistencia?.checkOutAt != null;

  const unidadMostrar =
    asistencia?.unidad?.nombre || unidadNombre || "Sin unidad asignada";

  const puestoMostrar =
    asistencia?.puesto?.nombre || puestoNombre || "Sin puesto asignado";

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Mi Asistencia
        </h1>

        {/* Información del turno */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Fecha y Hora Actual
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleDateString("es-PE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xl text-primary-600 font-mono">
                {currentTime.toLocaleTimeString("es-PE")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Turno Actual</p>
              <p className="text-2xl font-bold text-gray-900">
                {turnoActual === Turno.DIA ? "Turno Día" : "Turno Noche"}
              </p>
              <p className="text-lg text-gray-600">
                {formatHora(turnoActual)}
              </p>
            </div>
          </div>
        </div>

        {/* Información del trabajador */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Trabajador
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nombre Completo</p>
              <p className="font-medium text-gray-900">
                {user.nombres} {user.apellidos}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rol</p>
              <p className="font-medium text-gray-900 capitalize">
                {user.rol.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Ubicación asignada */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ubicación Asignada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Unidad</p>
              <p className="font-medium text-gray-900">{unidadMostrar}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Puesto</p>
              <p className="font-medium text-gray-900">{puestoMostrar}</p>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {error && <Alert variant="error" className="mb-6">{error}</Alert>}
        {success && <Alert variant="success" className="mb-6">{success}</Alert>}
        {geoError && !error && (
          <Alert variant="warning" className="mb-6">{geoError}</Alert>
        )}

        {/* Estado del registro */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estado del Registro
          </h2>

          {!yaMarcadoIngreso ? (
            <div className="text-center py-8">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckIn}
                isLoading={isSubmitting || geoLoading}
                className="w-full max-w-md"
              >
                Marcar Ingreso
              </Button>
            </div>
          ) : !yaMarcadoSalida ? (
            <div className="text-center py-8">
              <Button
                variant="success"
                size="lg"
                onClick={handleCheckOut}
                isLoading={isSubmitting || geoLoading}
                className="w-full max-w-md"
              >
                Marcar Salida
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-green-600 font-semibold">
                Turno completado correctamente
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
