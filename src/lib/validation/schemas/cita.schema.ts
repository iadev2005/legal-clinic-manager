// Cita schema - placeholder for Phase 4
import { z } from 'zod';

export const citaCreateSchema = z.object({
  caso_id: z.number().int().positive('Case ID is required'),
  fecha: z.string().datetime('Invalid date'),
  motivo: z.string().min(1, 'Reason is required'),
});

export const citaUpdateSchema = citaCreateSchema.partial();

export type CreateCitaDTO = z.infer<typeof citaCreateSchema>;
export type UpdateCitaDTO = z.infer<typeof citaUpdateSchema>;
