import { describe, it, expect } from 'vitest';
import { solicitanteCreateSchema } from '@/lib/validation/schemas/solicitante.schema';

describe('solicitanteCreateSchema', () => {
  describe('valid input', () => {
    it('should validate correct input with all fields', () => {
      const valid = {
        nombre: 'Jane',
        apellido: 'Doe',
        email: 'jane@test.com',
        telefono: '1234567',
      };
      expect(() => solicitanteCreateSchema.parse(valid)).not.toThrow();
    });

    it('should validate with only required fields', () => {
      const valid = {
        nombre: 'Jane',
        apellido: 'Doe',
      };
      expect(() => solicitanteCreateSchema.parse(valid)).not.toThrow();
    });

    it('should validate with optional email and telefono', () => {
      const valid = {
        nombre: 'John',
        apellido: 'Smith',
        email: 'john@test.com',
      };
      expect(() => solicitanteCreateSchema.parse(valid)).not.toThrow();
    });
  });

  describe('optional email', () => {
    it('should allow optional email', () => {
      const valid = {
        nombre: 'Jane',
        apellido: 'Doe',
      };
      expect(() => solicitanteCreateSchema.parse(valid)).not.toThrow();
    });

    it('should allow undefined email', () => {
      const valid = {
        nombre: 'Jane',
        apellido: 'Doe',
        email: undefined,
      };
      expect(() => solicitanteCreateSchema.parse(valid)).not.toThrow();
    });
  });

  describe('invalid email format', () => {
    it('should reject invalid email format', () => {
      const invalid = {
        nombre: 'Jane',
        apellido: 'Doe',
        email: 'not-an-email',
      };
      expect(() => solicitanteCreateSchema.parse(invalid)).toThrow('Invalid email');
    });

    it('should reject email without domain', () => {
      const invalid = {
        nombre: 'Jane',
        apellido: 'Doe',
        email: 'jane',
      };
      expect(() => solicitanteCreateSchema.parse(invalid)).toThrow('Invalid email');
    });

    it('should reject email without @', () => {
      const invalid = {
        nombre: 'Jane',
        apellido: 'Doe',
        email: 'janetest.com',
      };
      expect(() => solicitanteCreateSchema.parse(invalid)).toThrow('Invalid email');
    });
  });

  describe('invalid telefono', () => {
    it('should allow empty telefono', () => {
      const valid = {
        nombre: 'Jane',
        apellido: 'Doe',
        telefono: '',
      };
      expect(() => solicitanteCreateSchema.parse(valid)).not.toThrow();
    });

    it('should allow undefined telefono', () => {
      const valid = {
        nombre: 'Jane',
        apellido: 'Doe',
        telefono: undefined,
      };
      expect(() => solicitanteCreateSchema.parse(valid)).not.toThrow();
    });
  });

  describe('missing required fields', () => {
    it('should reject missing nombre', () => {
      const invalid = {
        apellido: 'Doe',
      };
      expect(() => solicitanteCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject missing apellido', () => {
      const invalid = {
        nombre: 'Jane',
      };
      expect(() => solicitanteCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject empty nombre', () => {
      const invalid = {
        nombre: '',
        apellido: 'Doe',
      };
      expect(() => solicitanteCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject empty apellido', () => {
      const invalid = {
        nombre: 'Jane',
        apellido: '',
      };
      expect(() => solicitanteCreateSchema.parse(invalid)).toThrow();
    });
  });
});
