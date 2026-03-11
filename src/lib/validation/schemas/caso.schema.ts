// Caso schema - to be implemented in Phase 4
import { z } from 'zod';

export const casoCreateSchema = z.object({
  titulo: z.string().min(3, 'Title must be at least 3 characters'),
  descripcion: z.string().optional(),
  estatus_id: z.number().int().positive('Status ID must be a positive integer'),
  solicitante_id: z.number().int().positive('Solicitante ID must be a positive integer'),
});

export const casoUpdateSchema = casoCreateSchema.partial();

export type CreateCasoDTO = z.infer<typeof casoCreateSchema>;
export type UpdateCasoDTO = z.infer<typeof casoUpdateSchema>;
