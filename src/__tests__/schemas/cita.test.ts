import { describe, it, expect } from 'vitest';
import { citaCreateSchema } from '@/lib/validation/schemas/cita.schema';

describe('citaCreateSchema', () => {
  describe('valid input', () => {
    it('should validate correct input', () => {
      const valid = {
        caso_id: 1,
        fecha: '2024-01-01T10:00:00Z',
        motivo: 'Initial meeting',
      };
      expect(() => citaCreateSchema.parse(valid)).not.toThrow();
    });

    it('should validate with valid ISO date', () => {
      const valid = {
        caso_id: 5,
        fecha: '2024-12-31T23:59:59Z',
        motivo: 'Follow-up',
      };
      expect(() => citaCreateSchema.parse(valid)).not.toThrow();
    });

    it('should validate with long motivo', () => {
      const valid = {
        caso_id: 1,
        fecha: '2024-01-01T10:00:00Z',
        motivo: 'This is a very long reason for the meeting that explains everything in detail',
      };
      expect(() => citaCreateSchema.parse(valid)).not.toThrow();
    });
  });

  describe('invalid date format', () => {
    it('should reject invalid date string', () => {
      const invalid = {
        caso_id: 1,
        fecha: 'not-a-date',
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow('Invalid date');
    });

    it('should reject empty date', () => {
      const invalid = {
        caso_id: 1,
        fecha: '',
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject date without time', () => {
      const invalid = {
        caso_id: 1,
        fecha: '2024-01-01',
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject numeric date', () => {
      const invalid = {
        caso_id: 1,
        fecha: 1234567890,
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });
  });

  describe('empty motivo', () => {
    it('should reject empty motivo', () => {
      const invalid = {
        caso_id: 1,
        fecha: '2024-01-01T10:00:00Z',
        motivo: '',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });
  });

  describe('invalid caso_id', () => {
    it('should reject case_id of 0', () => {
      const invalid = {
        caso_id: 0,
        fecha: '2024-01-01T10:00:00Z',
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow('Case ID is required');
    });

    it('should reject negative case_id', () => {
      const invalid = {
        caso_id: -1,
        fecha: '2024-01-01T10:00:00Z',
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow('Case ID is required');
    });

    it('should reject non-integer case_id', () => {
      const invalid = {
        caso_id: 1.5,
        fecha: '2024-01-01T10:00:00Z',
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject non-numeric case_id', () => {
      const invalid = {
        caso_id: 'one',
        fecha: '2024-01-01T10:00:00Z',
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });
  });

  describe('missing required fields', () => {
    it('should reject missing caso_id', () => {
      const invalid = {
        fecha: '2024-01-01T10:00:00Z',
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject missing fecha', () => {
      const invalid = {
        caso_id: 1,
        motivo: 'Meeting',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject missing motivo', () => {
      const invalid = {
        caso_id: 1,
        fecha: '2024-01-01T10:00:00Z',
      };
      expect(() => citaCreateSchema.parse(invalid)).toThrow();
    });
  });
});
