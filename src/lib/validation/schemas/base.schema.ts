import { z } from 'zod';

// Common validation patterns
export const idSchema = z.number().int().positive('ID must be a positive integer');

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

export const searchSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

// Common date range filter
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Boolean filter
export const booleanFilterSchema = z.object({
  activo: z.boolean().optional(),
});

// Generic create/update base
export const baseCreateSchema = z.object({
  created_at: z.string().datetime().optional(),
  created_by: z.number().int().positive().optional(),
});

export const baseUpdateSchema = z.object({
  updated_at: z.string().datetime().optional(),
  updated_by: z.number().int().positive().optional(),
});

// Common error response
export const errorResponseSchema = z.object({
  message: z.string(),
  code: z.string(),
  details: z.any().optional(),
});

// Helper to validate and return formatted errors
export function formatZodErrors(error: z.ZodError): { path: string; message: string }[] {
  return error.errors.map((err: z.ZodErrorIssue) => ({
    path: err.path.join('.'),
    message: err.message,
  }));
}
