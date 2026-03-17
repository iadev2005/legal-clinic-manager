import { describe, it, expect } from 'vitest';
import { casoCreateSchema } from '@/lib/validation/schemas/caso.schema';

describe('casoCreateSchema', () => {
  describe('valid input', () => {
    it('should validate correct input', () => {
      const valid = {
        titulo: 'Test Case',
        descripcion: 'Description',
        estatus_id: 1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(valid)).not.toThrow();
    });

    it('should validate input with minimum title length (3 chars)', () => {
      const valid = {
        titulo: 'ABC',
        estatus_id: 1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(valid)).not.toThrow();
    });

    it('should validate input with all valid roles', () => {
      const valid = {
        titulo: 'Test Case',
        estatus_id: 5,
        solicitante_id: 10,
      };
      expect(() => casoCreateSchema.parse(valid)).not.toThrow();
    });
  });

  describe('invalid title', () => {
    it('should reject short title (less than 3 characters)', () => {
      const invalid = {
        titulo: 'AB',
        estatus_id: 1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow('Title must be at least 3 characters');
    });

    it('should reject empty title', () => {
      const invalid = {
        titulo: '',
        estatus_id: 1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow('Title must be at least 3 characters');
    });

    it('should reject numeric title', () => {
      const invalid = {
        titulo: 123,
        estatus_id: 1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow();
    });
  });

  describe('invalid estatus_id', () => {
    it('should reject negative status ID', () => {
      const invalid = {
        titulo: 'Test Case',
        estatus_id: -1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow('Status ID must be a positive integer');
    });

    it('should reject zero status ID', () => {
      const invalid = {
        titulo: 'Test Case',
        estatus_id: 0,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow('Status ID must be a positive integer');
    });

    it('should reject non-integer status ID', () => {
      const invalid = {
        titulo: 'Test Case',
        estatus_id: 1.5,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject non-numeric status ID', () => {
      const invalid = {
        titulo: 'Test Case',
        estatus_id: 'one',
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow();
    });
  });

  describe('invalid solicitante_id', () => {
    it('should reject negative solicitante ID', () => {
      const invalid = {
        titulo: 'Test Case',
        estatus_id: 1,
        solicitante_id: -1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow('Solicitante ID must be a positive integer');
    });

    it('should reject zero solicitante ID', () => {
      const invalid = {
        titulo: 'Test Case',
        estatus_id: 1,
        solicitante_id: 0,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow('Solicitante ID must be a positive integer');
    });

    it('should reject non-integer solicitante ID', () => {
      const invalid = {
        titulo: 'Test Case',
        estatus_id: 1,
        solicitante_id: 1.5,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow();
    });
  });

  describe('optional description', () => {
    it('should allow optional description', () => {
      const valid = {
        titulo: 'Test Case',
        estatus_id: 1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(valid)).not.toThrow();
    });

    it('should allow empty description', () => {
      const valid = {
        titulo: 'Test Case',
        descripcion: '',
        estatus_id: 1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(valid)).not.toThrow();
    });
  });

  describe('missing required fields', () => {
    it('should reject missing titulo', () => {
      const invalid = {
        estatus_id: 1,
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject missing estatus_id', () => {
      const invalid = {
        titulo: 'Test Case',
        solicitante_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject missing solicitante_id', () => {
      const invalid = {
        titulo: 'Test Case',
        estatus_id: 1,
      };
      expect(() => casoCreateSchema.parse(invalid)).toThrow();
    });
  });
});
