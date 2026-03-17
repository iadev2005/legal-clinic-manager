import { describe, it, expect } from 'vitest';
import { usuarioCreateSchema } from '@/lib/validation/schemas/usuario.schema';

describe('usuarioCreateSchema', () => {
  describe('valid input', () => {
    it('should validate correct input', () => {
      const valid = {
        nombre: 'John',
        email: 'john@test.com',
        password: '123456',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(valid)).not.toThrow();
    });

    it('should validate valid input with Administrador role', () => {
      const valid = {
        nombre: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        rol: 'Administrador' as const,
      };
      expect(() => usuarioCreateSchema.parse(valid)).not.toThrow();
    });

    it('should validate valid input with Abogado role', () => {
      const valid = {
        nombre: 'Lawyer',
        email: 'lawyer@test.com',
        password: 'securepass',
        rol: 'Abogado' as const,
      };
      expect(() => usuarioCreateSchema.parse(valid)).not.toThrow();
    });
  });

  describe('invalid email', () => {
    it('should reject invalid email format', () => {
      const invalid = {
        nombre: 'John',
        email: 'invalid-email',
        password: '123456',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow('Invalid email');
    });

    it('should reject email without domain', () => {
      const invalid = {
        nombre: 'John',
        email: 'john',
        password: '123456',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow('Invalid email');
    });

    it('should reject empty email', () => {
      const invalid = {
        nombre: 'John',
        email: '',
        password: '123456',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow('Invalid email');
    });
  });

  describe('invalid password', () => {
    it('should reject short password (less than 6 characters)', () => {
      const invalid = {
        nombre: 'John',
        email: 'john@test.com',
        password: '123',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow('Password must be at least 6 characters');
    });

    it('should reject empty password', () => {
      const invalid = {
        nombre: 'John',
        email: 'john@test.com',
        password: '',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow('Password must be at least 6 characters');
    });
  });

  describe('invalid role', () => {
    it('should reject invalid role', () => {
      const invalid = {
        nombre: 'John',
        email: 'john@test.com',
        password: '123456',
        rol: 'SuperAdmin',
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject numeric role', () => {
      const invalid = {
        nombre: 'John',
        email: 'john@test.com',
        password: '123456',
        rol: 1,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow();
    });
  });

  describe('missing required fields', () => {
    it('should reject missing nombre', () => {
      const invalid = {
        email: 'john@test.com',
        password: '123456',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject missing email', () => {
      const invalid = {
        nombre: 'John',
        password: '123456',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject missing password', () => {
      const invalid = {
        nombre: 'John',
        email: 'john@test.com',
        rol: 'Estudiante' as const,
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow();
    });

    it('should reject missing rol', () => {
      const invalid = {
        nombre: 'John',
        email: 'john@test.com',
        password: '123456',
      };
      expect(() => usuarioCreateSchema.parse(invalid)).toThrow();
    });
  });
});
