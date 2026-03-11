// Usuario schema - placeholder for Phase 4
import { z } from 'zod';

export const usuarioCreateSchema = z.object({
  nombre: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rol: z.enum(['Administrador', 'Coordinador', 'Estudiante', 'Abogado']),
});

export const usuarioUpdateSchema = usuarioCreateSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type CreateUsuarioDTO = z.infer<typeof usuarioCreateSchema>;
export type UpdateUsuarioDTO = z.infer<typeof usuarioUpdateSchema>;
