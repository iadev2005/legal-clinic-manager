'use server';

import { query } from '@/lib/db';
import { getSession } from './auth-utils';

/**
 * Verifica si un alumno participa en un caso (está asignado activamente)
 */
export async function verificarParticipacionAlumno(cedulaAlumno: string, nroCaso: number): Promise<boolean> {
    try {
        const result = await query(`
            SELECT COUNT(*) as count
            FROM Se_Asignan
            WHERE id_caso = $1 
            AND cedula_alumno = $2 
            AND estatus = 'Activo'
        `, [nroCaso, cedulaAlumno]);
        
        return parseInt(result.rows[0]?.count || '0') > 0;
    } catch (error) {
        console.error('Error verificando participación de alumno:', error);
        return false;
    }
}

/**
 * Verifica si un usuario participa en una cita (está en la tabla Atienden)
 */
export async function verificarParticipacionCita(cedulaUsuario: string, idCita: number, nroCaso: number): Promise<boolean> {
    try {
        const result = await query(`
            SELECT COUNT(*) as count
            FROM Atienden
            WHERE id_cita = $1 
            AND nro_caso = $2 
            AND cedula_usuario = $3
        `, [idCita, nroCaso, cedulaUsuario]);
        
        return parseInt(result.rows[0]?.count || '0') > 0;
    } catch (error) {
        console.error('Error verificando participación en cita:', error);
        return false;
    }
}

/**
 * Verifica si un usuario participa en un caso (a través de asignación o supervisión)
 */
export async function verificarParticipacionCaso(cedulaUsuario: string, nroCaso: number): Promise<boolean> {
    try {
        // Verificar si es alumno asignado
        const alumnoResult = await query(`
            SELECT COUNT(*) as count
            FROM Se_Asignan
            WHERE id_caso = $1 
            AND cedula_alumno = $2 
            AND estatus = 'Activo'
        `, [nroCaso, cedulaUsuario]);
        
        if (parseInt(alumnoResult.rows[0]?.count || '0') > 0) {
            return true;
        }
        
        // Verificar si es profesor supervisor
        const profesorResult = await query(`
            SELECT COUNT(*) as count
            FROM Supervisan
            WHERE id_caso = $1 
            AND cedula_profesor = $2 
            AND estatus = 'Activo'
        `, [nroCaso, cedulaUsuario]);
        
        return parseInt(profesorResult.rows[0]?.count || '0') > 0;
    } catch (error) {
        console.error('Error verificando participación en caso:', error);
        return false;
    }
}

/**
 * Verifica si el usuario actual tiene permisos para realizar una acción
 * Retorna { allowed: boolean, error?: string }
 */
export async function verificarPermisoAlumno(
    accion: 'crear' | 'editar' | 'eliminar' | 'ver',
    recurso: 'caso' | 'cita' | 'soporte' | 'accion' | 'solicitante' | 'usuario' | 'asignacion',
    recursoId?: { nroCaso?: number; idCita?: number; idSoporte?: number; nroAccion?: number; cedula?: string }
): Promise<{ allowed: boolean; error?: string }> {
    const session = await getSession();
    
    if (!session) {
        return { allowed: false, error: 'No autorizado' };
    }
    
    // Si no es alumno, permitir (otros roles tienen permisos completos)
    if (session.rol !== 'Estudiante') {
        return { allowed: true };
    }
    
    const cedulaUsuario = session.cedula;
    if (!cedulaUsuario) {
        return { allowed: false, error: 'Cédula de usuario no encontrada' };
    }
    
    // Reglas específicas para alumnos
    switch (recurso) {
        case 'usuario':
            // Alumnos solo pueden ver y editar su propia información
            if (recursoId?.cedula && recursoId.cedula !== cedulaUsuario) {
                return { allowed: false, error: 'No tienes permisos para ver o editar información de otros usuarios' };
            }
            if (accion === 'eliminar') {
                return { allowed: false, error: 'Los alumnos no pueden eliminar usuarios' };
            }
            return { allowed: true };
            
        case 'asignacion':
            // Alumnos solo pueden ver asignaciones (no editarlas)
            if (accion === 'ver') {
                return { allowed: true };
            }
            return { allowed: false, error: 'Los alumnos solo pueden ver asignaciones, no editarlas' };
            
        case 'caso':
            // Alumnos pueden crear casos
            if (accion === 'crear') {
                return { allowed: true };
            }
            // Para editar o ver, deben participar en el caso
            if (recursoId?.nroCaso) {
                const participa = await verificarParticipacionCaso(cedulaUsuario, recursoId.nroCaso);
                if (!participa && accion !== 'ver') {
                    return { allowed: false, error: 'Solo puedes editar casos en los que participas' };
                }
                // Para ver, permitir aunque no participe (pueden ver todos los casos)
                return { allowed: true };
            }
            return { allowed: true };
            
        case 'cita':
            // Para crear, editar o ver, deben participar en el caso
            if (recursoId?.nroCaso) {
                const participa = await verificarParticipacionCaso(cedulaUsuario, recursoId.nroCaso);
                if (!participa) {
                    return { allowed: false, error: 'Solo puedes gestionar citas de casos en los que participas' };
                }
            }
            // Para eliminar, solo docentes
            if (accion === 'eliminar') {
                return { allowed: false, error: 'Solo los docentes pueden eliminar citas' };
            }
            return { allowed: true };
            
        case 'soporte':
            // Para crear, editar o ver, deben participar en el caso
            if (recursoId?.nroCaso) {
                const participa = await verificarParticipacionCaso(cedulaUsuario, recursoId.nroCaso);
                if (!participa) {
                    return { allowed: false, error: 'Solo puedes gestionar anexos de casos en los que participas' };
                }
            }
            // Para eliminar, solo docentes
            if (accion === 'eliminar') {
                return { allowed: false, error: 'Solo los docentes pueden eliminar anexos' };
            }
            return { allowed: true };
            
        case 'accion':
            // Para crear, editar o ver, deben participar en el caso
            if (recursoId?.nroCaso) {
                const participa = await verificarParticipacionCaso(cedulaUsuario, recursoId.nroCaso);
                if (!participa) {
                    return { allowed: false, error: 'Solo puedes gestionar acciones de casos en los que participas' };
                }
            }
            // Para eliminar, solo docentes
            if (accion === 'eliminar') {
                return { allowed: false, error: 'Solo los docentes pueden eliminar acciones' };
            }
            return { allowed: true };
            
        case 'solicitante':
            // Alumnos pueden crear, editar y ver solicitantes
            if (accion === 'eliminar') {
                return { allowed: false, error: 'Los alumnos no pueden eliminar solicitantes' };
            }
            return { allowed: true };
            
        default:
            return { allowed: false, error: 'Recurso no reconocido' };
    }
}



