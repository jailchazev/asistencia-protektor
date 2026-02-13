"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Asistencia, Turno } from "@/types";

// Centro de Perú
const PERU_CENTER: [number, number] = [-9.19, -75.015];
const PERU_ZOOM = 6;

interface MapaLeafletProps {
  asistencias: Asistencia[];
}

// Componente para ajustar el mapa a los marcadores
function FitBounds({ asistencias }: { asistencias: Asistencia[] }) {
  const map = useMap();

  useEffect(() => {
    if (asistencias.length > 0) {
      const bounds = L.latLngBounds(
        asistencias.map((a) => [a.lat!, a.lng!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView(PERU_CENTER, PERU_ZOOM);
    }
  }, [asistencias, map]);

  return null;
}

export default function MapaLeaflet({ asistencias }: MapaLeafletProps) {
  // Iconos personalizados
  const iconIngreso = useMemo(
    () =>
      L.divIcon({
        className: "custom-marker",
        html: `<div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const iconCompleto = useMemo(
    () =>
      L.divIcon({
        className: "custom-marker",
        html: `<div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const iconSalida = useMemo(
    () =>
      L.divIcon({
        className: "custom-marker",
        html: `<div class="w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const getIcon = (asistencia: Asistencia) => {
    if (asistencia.checkOutAt) return iconCompleto;
    if (asistencia.checkInAt) return iconIngreso;
    return iconSalida;
  };

  return (
    <MapContainer
      center={PERU_CENTER}
      zoom={PERU_ZOOM}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds asistencias={asistencias} />
      {asistencias.map((asistencia) => (
        <Marker
          key={asistencia.id}
          position={[asistencia.lat!, asistencia.lng!]}
          icon={getIcon(asistencia)}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-gray-900 mb-2">
                {asistencia.usuario?.nombres} {asistencia.usuario?.apellidos}
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Unidad:</span>{" "}
                  <span className="font-medium">{asistencia.unidad?.nombre}</span>
                </p>
                <p>
                  <span className="text-gray-500">Puesto:</span>{" "}
                  <span className="font-medium">{asistencia.puesto?.nombre}</span>
                </p>
                <p>
                  <span className="text-gray-500">Turno:</span>{" "}
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      asistencia.turno === Turno.DIA
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {asistencia.turno}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Fecha:</span>{" "}
                  <span className="font-medium">{asistencia.fechaTurno}</span>
                </p>
                {asistencia.checkInAt && (
                  <p>
                    <span className="text-gray-500">Ingreso:</span>{" "}
                    <span className="font-medium text-green-600">
                      {new Date(asistencia.checkInAt).toLocaleTimeString("es-PE")}
                    </span>
                  </p>
                )}
                {asistencia.checkOutAt && (
                  <p>
                    <span className="text-gray-500">Salida:</span>{" "}
                    <span className="font-medium text-orange-600">
                      {new Date(asistencia.checkOutAt).toLocaleTimeString("es-PE")}
                    </span>
                  </p>
                )}
                {asistencia.horasTrabajadas && (
                  <p>
                    <span className="text-gray-500">Horas:</span>{" "}
                    <span className="font-medium text-blue-600">
                      {asistencia.horasTrabajadas.toFixed(2)} h
                    </span>
                  </p>
                )}
                <p className="text-xs text-gray-400 pt-2 border-t">
                  Coordenadas: {asistencia.lat?.toFixed(6)}, {asistencia.lng?.toFixed(6)}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
