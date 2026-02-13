import type { Rol } from "@prisma/client";

// ✅ Mantener Turno local (si tu Prisma usa Turno, luego lo alineamos también)
export enum Turno {
  DIA = "DIA",
  NOCHE = "NOCHE",
}

export interface Usuario {
  id: string;
  username: string;
  nombres: string;
  apellidos: string;
  rol: Rol;
  activo: boolean;
  createdAt: string;
}

export interface Unidad {
  id: string;
  nombre: string;
  ciudad: string;
  direccion?: string;
  activo: boolean;
}

export interface Puesto {
  id: string;
  unidadId: string;
  nombre: string;
  activo: boolean;
  unidad?: Unidad;
}

export interface Asistencia {
  id: string;
  userId: string;
  unidadId: string;
  puestoId: string;
  turno: Turno;
  fechaTurno: string;
  checkInAt?: string;
  checkOutAt?: string;
  horasTrabajadas?: number;
  lat?: number;
  lng?: number;
  ciudadDetectada?: string;
  ip?: string;
  deviceInfo?: string;
  createdAt: string;
  usuario?: Usuario;
  unidad?: Unidad;
  puesto?: Puesto;
}

export interface UserSession {
  id: string;
  username: string;
  nombres: string;
  apellidos: string;
  rol: Rol;
  unidadId: string | null;
  puestoId: string | null;
}

// ✅ Roles con permisos (mismos valores que en Prisma)
export const ROLES_CON_HISTORIAL: Rol[] = [
  "admin",
  "asistente",
  "jefe",
  "gerente",
  "centro_de_control",
];

export const ROLES_CON_MAPA: Rol[] = [
  "admin",
  "asistente",
  "jefe",
  "gerente",
  "centro_de_control",
];

export const ROLES_ADMIN: Rol[] = ["admin"];

export function tieneAccesoHistorial(rol: Rol): boolean {
  return ROLES_CON_HISTORIAL.includes(rol);
}

export function tieneAccesoMapa(rol: Rol): boolean {
  return ROLES_CON_MAPA.includes(rol);
}

export function esAdmin(rol: Rol): boolean {
  return ROLES_ADMIN.includes(rol);
}
