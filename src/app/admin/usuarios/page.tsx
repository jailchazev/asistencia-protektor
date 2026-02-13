"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";

// ✅ IMPORT CORRECTO
import { UserSession, Usuario, ROL } from "@/types";
import type { Rol } from "@/types";

export default function UsuariosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombres: "",
    apellidos: "",
    rol: "agente" as Rol,
    activo: true,
  });

  useEffect(() => {
    const cargarUsuario = async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return router.push("/login");

      const data = await res.json();
      if (data.user.rol !== "admin") return router.push("/mi-asistencia");

      setUser(data.user);
    };

    cargarUsuario();
  }, [router]);

  const cargarUsuarios = async () => {
    const res = await fetch("/api/usuarios");
    if (res.ok) {
      const data = await res.json();
      setUsuarios(data.usuarios);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) cargarUsuarios();
  }, [user]);

  const rolOptions = Object.values(ROL).map((r) => ({
    value: r,
    label: r.replace("_", " ").toUpperCase(),
  }));

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <DashboardLayout user={user}>
      {/* 🔥 TU UI ORIGINAL SIN CAMBIOS */}
    </DashboardLayout>
  );
}
