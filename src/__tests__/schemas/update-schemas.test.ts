import { describe, it, expect } from 'vitest';
import { casoUpdateSchema, casoCreateSchema } from '@/lib/validation/schemas/caso.schema';
import { usuarioUpdateSchema, usuarioCreateSchema } from '@/lib/validation/schemas/usuario.schema';
import { citaUpdateSchema, citaCreateSchema } from '@/lib/validation/schemas/cita.schema';
import { solicitanteUpdateSchema, solicitanteCreateSchema } from '@/lib/validation/schemas/solicitante.schema';

describe('Update schemas - partial validation', () => {
  describe('casoUpdateSchema', () => {
    it('should allow partial update with only titulo', () => {
      const partial = { titulo: 'New Title' };
      expect(() => casoUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow partial update with only descripcion', () => {
      const partial = { descripcion: 'New description' };
      expect(() => casoUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow partial update with only estatus_id', () => {
      const partial = { estatus_id: 2 };
      expect(() => casoUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow partial update with only solicitante_id', () => {
      const partial = { solicitante_id: 5 };
      expect(() => casoUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow empty object (all fields optional)', () => {
      const partial = {};
      expect(() => casoUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow updating multiple fields', () => {
      const partial = {
        titulo: 'Updated Title',
        descripcion: 'Updated description',
        estatus_id: 3,
      };
      expect(() => casoUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should validate titulo length even in partial update', () => {
      const partial = { titulo: 'AB' };
      expect(() => casoUpdateSchema.parse(partial)).toThrow('Title must be at least 3 characters');
    });

    it('should validate estatus_id even in partial update', () => {
      const partial = { estatus_id: -1 };
      expect(() => casoUpdateSchema.parse(partial)).toThrow('Status ID must be a positive integer');
    });
  });

  describe('usuarioUpdateSchema', () => {
    it('should allow partial update with only nombre', () => {
      const partial = { nombre: 'New Name' };
      expect(() => usuarioUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow partial update with only email', () => {
      const partial = { email: 'new@test.com' };
      expect(() => usuarioUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow partial update with only rol', () => {
      const partial = { rol: 'Administrador' as const };
      expect(() => usuarioUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow empty object (all fields optional except password which is handled specially)', () => {
      const partial = {};
      expect(() => usuarioUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow updating password', () => {
      const partial = { password: 'newpass123' };
      expect(() => usuarioUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should validate email format even in partial update', () => {
      const partial = { email: 'invalid' };
      expect(() => usuarioUpdateSchema.parse(partial)).toThrow('Invalid email');
    });

    it('should validate password length even in partial update', () => {
      const partial = { password: '123' };
      expect(() => usuarioUpdateSchema.parse(partial)).toThrow('Password must be at least 6 characters');
    });

    it('should validate rol even in partial update', () => {
      const partial = { rol: 'SuperAdmin' };
      expect(() => usuarioUpdateSchema.parse(partial)).toThrow();
    });
  });

  describe('citaUpdateSchema', () => {
    it('should allow partial update with only fecha', () => {
      const partial = { fecha: '2024-02-01T10:00:00Z' };
      expect(() => citaUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow partial update with only motivo', () => {
      const partial = { motivo: 'Updated reason' };
      expect(() => citaUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow empty object', () => {
      const partial = {};
      expect(() => citaUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should validate fecha format even in partial update', () => {
      const partial = { fecha: 'invalid-date' };
      expect(() => citaUpdateSchema.parse(partial)).toThrow('Invalid date');
    });

    it('should validate motivo even in partial update', () => {
      const partial = { motivo: '' };
      expect(() => citaUpdateSchema.parse(partial)).toThrow('Reason is required');
    });
  });

  describe('solicitanteUpdateSchema', () => {
    it('should allow partial update with only nombre', () => {
      const partial = { nombre: 'New Name' };
      expect(() => solicitanteUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow partial update with only apellido', () => {
      const partial = { apellido: 'New Lastname' };
      expect(() => solicitanteUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow partial update with only email', () => {
      const partial = { email: 'new@test.com' };
      expect(() => solicitanteUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should allow empty object', () => {
      const partial = {};
      expect(() => solicitanteUpdateSchema.parse(partial)).not.toThrow();
    });

    it('should validate email format even in partial update', () => {
      const partial = { email: 'invalid' };
      expect(() => solicitanteUpdateSchema.parse(partial)).toThrow('Invalid email');
    });

    it('should validate nombre even in partial update', () => {
      const partial = { nombre: '' };
      expect(() => solicitanteUpdateSchema.parse(partial)).toThrow('Name is required');
    });

    it('should validate apellido even in partial update', () => {
      const partial = { apellido: '' };
      expect(() => solicitanteUpdateSchema.parse(partial)).toThrow('Last name is required');
    });
  });

  describe('comparison: create vs update schemas', () => {
    it('create schema requires all fields, update allows partial', () => {
      // Full create should throw when missing required fields
      expect(() => casoCreateSchema.parse({})).toThrow();
      
      // Partial update should allow empty object
      expect(() => casoUpdateSchema.parse({})).not.toThrow();
    });

    it('update schema is derived from create schema using .partial()', () => {
      // Both should have the same shape but optional
      const updateData = {
        titulo: 'Test',
        descripcion: 'Desc',
        estatus_id: 1,
        solicitante_id: 1,
      };
      
      expect(() => casoCreateSchema.parse(updateData)).not.toThrow();
      expect(() => casoUpdateSchema.parse(updateData)).not.toThrow();
    });
  });
});
