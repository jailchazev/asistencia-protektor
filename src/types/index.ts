// ✅ Runtime constants (SI existen en runtime)
export const ROL = {
  admin: "admin",
  supervisor: "supervisor",
  agente: "agente",
  jefe: "jefe",
  gerente: "gerente",
  coordinador: "coordinador",
  asistente: "asistente",
  centro_de_control: "centro_de_control",
  oficina: "oficina",
} as const;

// ✅ Lista runtime para UI (reemplaza Object.values(Rol))
export const ROL_VALUES = [
  ROL.admin,
  ROL.supervisor,
  ROL.agente,
  ROL.jefe,
  ROL.gerente,
  ROL.coordinador,
  ROL.asistente,
  ROL.centro_de_control,
  ROL.oficina,
] as const;

// ✅ Tipo Rol derivado de runtime (NO duplica, NO Prisma)
export type Rol = (typeof ROL_VALUES)[number];

// ✅ Mantener Turno local
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

// ✅ Roles con permisos
export const ROLES_CON_HISTORIAL: Rol[] = [
  ROL.admin,
  ROL.asistente,
  ROL.jefe,
  ROL.gerente,
  ROL.centro_de_control,
];

export const ROLES_CON_MAPA: Rol[] = [
  ROL.admin,
  ROL.asistente,
  ROL.jefe,
  ROL.gerente,
  ROL.centro_de_control,
];

export const ROLES_ADMIN: Rol[] = [ROL.admin];

export function tieneAccesoHistorial(rol: Rol): boolean {
  return ROLES_CON_HISTORIAL.includes(rol);
}

export function tieneAccesoMapa(rol: Rol): boolean {
  return ROLES_CON_MAPA.includes(rol);
}

export function esAdmin(rol: Rol): boolean {
  return ROLES_ADMIN.includes(rol);
}
