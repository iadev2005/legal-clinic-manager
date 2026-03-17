import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verificarPermisoAlumno } from '@/lib/permissions';

// Mock the getSession function
vi.mock('@/lib/auth-utils', () => ({
  getSession: vi.fn(),
}));

// Mock the database query function - this allows verificarParticipacion functions to work
vi.mock('@/lib/db', () => ({
  query: vi.fn(),
}));

import { getSession } from '@/lib/auth-utils';
import { query } from '@/lib/db';

describe('verificarPermisoAlumno', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('denies access without session', () => {
    it('should deny without session', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const result = await verificarPermisoAlumno('ver', 'caso', { nroCaso: 1 });

      expect(result).toEqual({ allowed: false, error: 'No autorizado' });
    });

    it('should deny for any action without session', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const resultCrear = await verificarPermisoAlumno('crear', 'caso', {});
      const resultEditar = await verificarPermisoAlumno('editar', 'caso', { nroCaso: 1 });
      const resultEliminar = await verificarPermisoAlumno('eliminar', 'solicitante', {});
      const resultVer = await verificarPermisoAlumno('ver', 'usuario', {});

      expect(resultCrear).toEqual({ allowed: false, error: 'No autorizado' });
      expect(resultEditar).toEqual({ allowed: false, error: 'No autorizado' });
      expect(resultEliminar).toEqual({ allowed: false, error: 'No autorizado' });
      expect(resultVer).toEqual({ allowed: false, error: 'No autorizado' });
    });
  });

  describe('allows non-Estudiante roles full access', () => {
    it('should allow Administrador to create caso', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Admin',
        rol: 'Administrador',
        cedula: '11111111',
      });

      const result = await verificarPermisoAlumno('crear', 'caso', {});

      expect(result).toEqual({ allowed: true });
    });

    it('should allow Coordinador to edit caso', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Coord',
        rol: 'Coordinador',
        cedula: '22222222',
      });

      const result = await verificarPermisoAlumno('editar', 'caso', { nroCaso: 1 });

      expect(result).toEqual({ allowed: true });
    });

    it('should allow Abogado to delete solicitante', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Lawyer',
        rol: 'Abogado',
        cedula: '33333333',
      });

      const result = await verificarPermisoAlumno('eliminar', 'solicitante', {});

      expect(result).toEqual({ allowed: true });
    });

    it('should allow Administrador to do anything', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Admin',
        rol: 'Administrador',
        cedula: '11111111',
      });

      const actions = ['crear', 'editar', 'eliminar', 'ver'] as const;
      const recursos = ['caso', 'cita', 'solicitante', 'usuario', 'asignacion', 'soporte', 'accion'] as const;

      for (const accion of actions) {
        for (const recurso of recursos) {
          const result = await verificarPermisoAlumno(accion, recurso, { nroCaso: 1 });
          expect(result).toEqual({ allowed: true }, `Failed for ${accion} ${recurso}`);
        }
      }
    });
  });

  describe('Estudiante role - caso permissions', () => {
    it('should allow Estudiante to create caso', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('crear', 'caso', {});

      expect(result).toEqual({ allowed: true });
    });

    it('should allow Estudiante to edit caso they participate in', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });
      // Mock DB to return that student participates in the case
      vi.mocked(query).mockResolvedValue({ rows: [{ count: '1' }], rowCount: 1, command: 'SELECT', oid: 0, fields: [] } as any);

      const result = await verificarPermisoAlumno('editar', 'caso', { nroCaso: 1 });

      expect(result).toEqual({ allowed: true });
    });

    it('should deny Estudiante to edit caso they do not participate in', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });
      // Mock DB to return that student does NOT participate in the case
      vi.mocked(query).mockResolvedValue({ rows: [{ count: '0' }], rowCount: 1, command: 'SELECT', oid: 0, fields: [] } as any);

      const result = await verificarPermisoAlumno('editar', 'caso', { nroCaso: 1 });

      expect(result).toEqual({ allowed: false, error: 'Solo puedes editar casos en los que participas' });
    });

    it('should allow Estudiante to view any caso', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('ver', 'caso', { nroCaso: 999 });

      expect(result).toEqual({ allowed: true });
    });
  });

  describe('Estudiante role - usuario permissions', () => {
    it('should deny Estudiante to edit other users profile', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('editar', 'usuario', { cedula: '87654321' });

      expect(result).toEqual({
        allowed: false,
        error: 'No tienes permisos para ver o editar información de otros usuarios'
      });
    });

    it('should allow Estudiante to edit own profile', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('editar', 'usuario', { cedula: '12345678' });

      expect(result).toEqual({ allowed: true });
    });

    it('should deny Estudiante to delete usuario', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('eliminar', 'usuario', {});

      expect(result).toEqual({ allowed: false, error: 'Los alumnos no pueden eliminar usuarios' });
    });

    it('should allow Estudiante to view own profile', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('ver', 'usuario', { cedula: '12345678' });

      expect(result).toEqual({ allowed: true });
    });
  });

  describe('Estudiante role - asignacion permissions', () => {
    it('should allow Estudiante to view asignacion', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('ver', 'asignacion', {});

      expect(result).toEqual({ allowed: true });
    });

    it('should deny Estudiante to edit asignacion', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('editar', 'asignacion', {});

      expect(result).toEqual({ allowed: false, error: 'Los alumnos solo pueden ver asignaciones, no editarlas' });
    });

    it('should deny Estudiante to create asignacion', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('crear', 'asignacion', {});

      expect(result).toEqual({ allowed: false, error: 'Los alumnos solo pueden ver asignaciones, no editarlas' });
    });

    it('should deny Estudiante to delete asignacion', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('eliminar', 'asignacion', {});

      expect(result).toEqual({ allowed: false, error: 'Los alumnos solo pueden ver asignaciones, no editarlas' });
    });
  });

  describe('Estudiante role - solicitante permissions', () => {
    it('should allow Estudiante to create solicitante', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('crear', 'solicitante', {});

      expect(result).toEqual({ allowed: true });
    });

    it('should allow Estudiante to edit solicitante', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('editar', 'solicitante', {});

      expect(result).toEqual({ allowed: true });
    });

    it('should allow Estudiante to view solicitante', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('ver', 'solicitante', {});

      expect(result).toEqual({ allowed: true });
    });

    it('should deny Estudiante to delete solicitante', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('eliminar', 'solicitante', {});

      expect(result).toEqual({ allowed: false, error: 'Los alumnos no pueden eliminar solicitantes' });
    });
  });

  describe('Estudiante role - unrecognized resource', () => {
    it('should return error for unrecognized resource', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        cedula: '12345678',
      });

      const result = await verificarPermisoAlumno('ver', 'recurso-desconocido' as any, {});

      expect(result).toEqual({ allowed: false, error: 'Recurso no reconocido' });
    });
  });

  describe('Estudiante without cedula', () => {
    it('should deny when cedula is not in session', async () => {
      vi.mocked(getSession).mockResolvedValue({
        nombre: 'Student',
        rol: 'Estudiante',
        // cedula is undefined
      });

      const result = await verificarPermisoAlumno('crear', 'caso', {});

      expect(result).toEqual({ allowed: false, error: 'Cédula de usuario no encontrada' });
    });
  });
});
