// Solicitante schema - placeholder for Phase 4
import { z } from 'zod';

export const solicitanteCreateSchema = z.object({
  nombre: z.string().min(1, 'Name is required'),
  apellido: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional(),
  telefono: z.string().optional(),
});

export const solicitanteUpdateSchema = solicitanteCreateSchema.partial();

export type CreateSolicitanteDTO = z.infer<typeof solicitanteCreateSchema>;
export type UpdateSolicitanteDTO = z.infer<typeof solicitanteUpdateSchema>;
