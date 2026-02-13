import { z } from "zod";
import { ROL_VALUES, Turno } from "@/types";

export const loginSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  unidadId: z.string().uuid("Debe seleccionar una unidad"),
  puestoId: z.string().uuid("Debe seleccionar un puesto"),
});

export const crearUsuarioSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50, "El usuario no puede exceder 50 caracteres"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
  nombres: z.string().min(2, "Los nombres son obligatorios"),
  apellidos: z.string().min(2, "Los apellidos son obligatorios"),
  rol: z.enum(ROL_VALUES),
  activo: z.boolean().default(true),
});

export const actualizarUsuarioSchema = z.object({
  nombres: z.string().min(2, "Los nombres son obligatorios").optional(),
  apellidos: z.string().min(2, "Los apellidos son obligatorios").optional(),
  rol: z.enum(ROL_VALUES).optional(),
  activo: z.boolean().optional(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    )
    .optional(),
});

export const crearUnidadSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  ciudad: z.string().min(2, "La ciudad es obligatoria"),
  direccion: z.string().optional(),
  activo: z.boolean().default(true),
});

export const actualizarUnidadSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio").optional(),
  ciudad: z.string().min(2, "La ciudad es obligatoria").optional(),
  direccion: z.string().optional(),
  activo: z.boolean().optional(),
});

export const crearPuestoSchema = z.object({
  unidadId: z.string().uuid("Debe seleccionar una unidad"),
  nombre: z.string().min(2, "El nombre es obligatorio"),
  activo: z.boolean().default(true),
});

export const actualizarPuestoSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio").optional(),
  activo: z.boolean().optional(),
});

export const checkInSchema = z.object({
  unidadId: z.string().uuid(),
  puestoId: z.string().uuid(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  ciudadDetectada: z.string().optional(),
  deviceInfo: z.string().optional(),
});

export const checkOutSchema = z.object({
  asistenciaId: z.string().uuid(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const filtroAsistenciaSchema = z.object({
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  unidadId: z.string().optional(),
  puestoId: z.string().optional(),
  userId: z.string().optional(),
  rol: z.enum(ROL_VALUES).optional(),
  turno: z.nativeEnum(Turno).optional(),
  estado: z.enum(["solo_ingreso", "completo"]).optional(),
  ciudad: z.string().optional(),
  busqueda: z.string().optional(),
  pagina: z.string().default("1"),
  porPagina: z.string().default("20"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
export type CrearUnidadInput = z.infer<typeof crearUnidadSchema>;
export type ActualizarUnidadInput = z.infer<typeof actualizarUnidadSchema>;
export type CrearPuestoInput = z.infer<typeof crearPuestoSchema>;
export type ActualizarPuestoInput = z.infer<typeof actualizarPuestoSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type FiltroAsistenciaInput = z.infer<typeof filtroAsistenciaSchema>;
