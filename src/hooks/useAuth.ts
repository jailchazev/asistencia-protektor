"use client";

import { useState, useEffect, useCallback } from "react";
import { UserSession, Rol } from "@/types";

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (
    username: string,
    password: string,
    unidadId: string,
    puestoId: string
  ) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, unidadId, puestoId }),
    });

    const data = await response.json();

    if (response.ok) {
      setAuthState({
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const tienePermiso = (rolesPermitidos: Rol[]) => {
    if (!authState.user) return false;
    return rolesPermitidos.includes(authState.user.rol);
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    tienePermiso,
  };
}
