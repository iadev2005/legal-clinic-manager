'use server';

import { query } from '@/lib/db';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Notificacion {
    id_notificacion: number;
    descripcion: string;
    fecha_notificacion: Date | string;
}

export interface NotificacionUsuario {
    id_notificacion: number;
    cedula_usuario: string;
    revisado: boolean;
    fecha_revision: Date | string | null;
    descripcion?: string;
    fecha_notificacion?: Date | string;
    nombres?: string;
    apellidos?: string;
}

export interface NotificacionInput {
    descripcion: string;
    fecha_notificacion?: Date | string;
    usuarios: string[]; // Array de cédulas de usuarios
}

// ============================================================================
// CRUD BÁSICO DE NOTIFICACIONES
// ============================================================================

/**
 * Obtener todas las notificaciones
 */
export async function getNotificaciones() {
    try {
        const result = await query(`
            SELECT 
                id_notificacion,
                descripcion,
                fecha_notificacion
            FROM Notificaciones
            ORDER BY fecha_notificacion DESC
        `);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener notificaciones:', error);
        return { success: false, error: 'Error al obtener notificaciones' };
    }
}

/**
 * Obtener una notificación por ID
 */
export async function getNotificacionById(id_notificacion: number) {
    try {
        const result = await query(`
            SELECT 
                id_notificacion,
                descripcion,
                fecha_notificacion
            FROM Notificaciones
            WHERE id_notificacion = $1
        `, [id_notificacion]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Notificación no encontrada' };
        }

        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al obtener notificación:', error);
        return { success: false, error: 'Error al obtener notificación' };
    }
}

/**
 * Crear una notificación y asignarla a múltiples usuarios
 */
export async function createNotificacion(data: NotificacionInput) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Crear la notificación
        const notifResult = await client.query(`
            INSERT INTO Notificaciones (descripcion, fecha_notificacion)
            VALUES ($1, COALESCE($2::timestamp, NOW()))
            RETURNING id_notificacion
        `, [data.descripcion, data.fecha_notificacion || null]);

        const id_notificacion = notifResult.rows[0].id_notificacion;

        // 2. Asignar notificación a usuarios
        if (data.usuarios && data.usuarios.length > 0) {
            for (const cedula of data.usuarios) {
                await client.query(`
                    INSERT INTO Notificaciones_Usuarios (id_notificacion, cedula_usuario)
                    VALUES ($1, $2)
                `, [id_notificacion, cedula]);
            }
        }

        await client.query('COMMIT');

        revalidatePath('/dashboard');
        return {
            success: true,
            data: { id_notificacion },
            message: 'Notificación creada correctamente'
        };
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error al crear notificación:', error);
        
        if (error.code === '23503') { // foreign_key_violation
            return { success: false, error: 'Uno o más usuarios no existen' };
        }

        return { success: false, error: error.message || 'Error al crear notificación' };
    } finally {
        client.release();
    }
}

/**
 * Eliminar una notificación (con CASCADE eliminará las relaciones)
 */
export async function deleteNotificacion(id_notificacion: number) {
    try {
        const result = await query(`
            DELETE FROM Notificaciones
            WHERE id_notificacion = $1
            RETURNING id_notificacion
        `, [id_notificacion]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Notificación no encontrada' };
        }

        revalidatePath('/dashboard');
        return {
            success: true,
            message: 'Notificación eliminada correctamente'
        };
    } catch (error: any) {
        console.error('Error al eliminar notificación:', error);
        return { success: false, error: error.message || 'Error al eliminar notificación' };
    }
}

// ============================================================================
// NOTIFICACIONES POR USUARIO
// ============================================================================

/**
 * Obtener todas las notificaciones de un usuario
 */
export async function getNotificacionesByUsuario(cedula_usuario: string, soloNoRevisadas: boolean = false) {
    try {
        const sql = soloNoRevisadas
            ? `
                SELECT 
                    n.id_notificacion,
                    n.descripcion,
                    n.fecha_notificacion,
                    nu.revisado,
                    nu.fecha_revision
                FROM Notificaciones n
                INNER JOIN Notificaciones_Usuarios nu ON n.id_notificacion = nu.id_notificacion
                WHERE nu.cedula_usuario = $1 AND nu.revisado = FALSE
                ORDER BY n.fecha_notificacion DESC
            `
            : `
                SELECT 
                    n.id_notificacion,
                    n.descripcion,
                    n.fecha_notificacion,
                    nu.revisado,
                    nu.fecha_revision
                FROM Notificaciones n
                INNER JOIN Notificaciones_Usuarios nu ON n.id_notificacion = nu.id_notificacion
                WHERE nu.cedula_usuario = $1
                ORDER BY n.fecha_notificacion DESC
            `;

        const result = await query(sql, [cedula_usuario]);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener notificaciones del usuario:', error);
        return { success: false, error: 'Error al obtener notificaciones' };
    }
}

/**
 * Obtener notificaciones no revisadas de un usuario
 */
export async function getNotificacionesNoRevisadas(cedula_usuario: string) {
    return getNotificacionesByUsuario(cedula_usuario, true);
}

/**
 * Contar notificaciones no revisadas de un usuario
 */
export async function contarNotificacionesNoRevisadas(cedula_usuario: string) {
    try {
        const result = await query(`
            SELECT COUNT(*)::int as total
            FROM Notificaciones_Usuarios
            WHERE cedula_usuario = $1 AND revisado = FALSE
        `, [cedula_usuario]);

        return { 
            success: true, 
            data: { total: result.rows[0].total || 0 }
        };
    } catch (error: any) {
        console.error('Error al contar notificaciones:', error);
        return { success: false, error: 'Error al contar notificaciones' };
    }
}

// ============================================================================
// GESTIÓN DE REVISIÓN
// ============================================================================

/**
 * Marcar una notificación como revisada para un usuario
 */
export async function marcarNotificacionRevisada(id_notificacion: number, cedula_usuario: string) {
    try {
        const result = await query(`
            UPDATE Notificaciones_Usuarios
            SET revisado = TRUE, fecha_revision = NOW()
            WHERE id_notificacion = $1 AND cedula_usuario = $2
            RETURNING id_notificacion, cedula_usuario
        `, [id_notificacion, cedula_usuario]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Relación notificación-usuario no encontrada' };
        }

        revalidatePath('/dashboard');
        return {
            success: true,
            message: 'Notificación marcada como revisada'
        };
    } catch (error: any) {
        console.error('Error al marcar notificación como revisada:', error);
        return { success: false, error: error.message || 'Error al actualizar notificación' };
    }
}

/**
 * Marcar todas las notificaciones como revisadas para un usuario
 */
export async function marcarTodasRevisadas(cedula_usuario: string) {
    try {
        const result = await query(`
            UPDATE Notificaciones_Usuarios
            SET revisado = TRUE, fecha_revision = NOW()
            WHERE cedula_usuario = $1 AND revisado = FALSE
            RETURNING id_notificacion
        `, [cedula_usuario]);

        revalidatePath('/dashboard');
        return {
            success: true,
            message: `${result.rows.length} notificación(es) marcada(s) como revisada(s)`,
            data: { actualizadas: result.rows.length }
        };
    } catch (error: any) {
        console.error('Error al marcar todas como revisadas:', error);
        return { success: false, error: error.message || 'Error al actualizar notificaciones' };
    }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtener usuarios asignados a una notificación
 */
export async function getUsuariosByNotificacion(id_notificacion: number) {
    try {
        const result = await query(`
            SELECT 
                nu.cedula_usuario,
                nu.revisado,
                nu.fecha_revision,
                u.nombres,
                u.apellidos,
                u.correo_electronico
            FROM Notificaciones_Usuarios nu
            INNER JOIN Usuarios_Sistema u ON nu.cedula_usuario = u.cedula_usuario
            WHERE nu.id_notificacion = $1
            ORDER BY u.nombres, u.apellidos
        `, [id_notificacion]);

        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener usuarios de la notificación:', error);
        return { success: false, error: 'Error al obtener usuarios' };
    }
}

/**
 * Agregar usuarios a una notificación existente
 */
export async function agregarUsuariosANotificacion(id_notificacion: number, usuarios: string[]) {
    try {
        if (!usuarios || usuarios.length === 0) {
            return { success: false, error: 'Debe proporcionar al menos un usuario' };
        }

        for (const cedula of usuarios) {
            await query(`
                INSERT INTO Notificaciones_Usuarios (id_notificacion, cedula_usuario)
                VALUES ($1, $2)
                ON CONFLICT (id_notificacion, cedula_usuario) DO NOTHING
            `, [id_notificacion, cedula]);
        }

        revalidatePath('/dashboard');
        return {
            success: true,
            message: 'Usuarios agregados a la notificación correctamente'
        };
    } catch (error: any) {
        console.error('Error al agregar usuarios:', error);
        
        if (error.code === '23503') { // foreign_key_violation
            return { success: false, error: 'Uno o más usuarios no existen' };
        }

        return { success: false, error: error.message || 'Error al agregar usuarios' };
    }
}




