"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: false,
    error: null,
  });

  const getLocation = useCallback((): Promise<{
    lat: number;
    lng: number;
  } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setState((prev) => ({
          ...prev,
          error: "Geolocalización no soportada",
          loading: false,
        }));
        resolve(null);
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setState({
            lat: latitude,
            lng: longitude,
            loading: false,
            error: null,
          });
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          let errorMessage = "Error al obtener ubicación";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Permiso de geolocalización denegado. Por favor habilite la ubicación en su navegador.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Información de ubicación no disponible";
              break;
            case error.TIMEOUT:
              errorMessage = "Tiempo de espera agotado";
              break;
          }
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { ...state, getLocation };
}
