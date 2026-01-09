'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth-utils';
import { verificarPermisoAlumno } from '@/lib/permissions';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface Cita {
    id_cita: number;
    nro_caso: number;
    fecha_atencion: string; // TIMESTAMP
    observacion?: string;
    fecha_proxima_cita?: string; // TIMESTAMP
}

export interface CitaConDetalles extends Cita {
    caso_numero?: number;
    caso_sintesis?: string;
    solicitante_nombre?: string;
    atendido_por?: string[]; // Array de nombres de usuarios
}

export interface CreateCitaData {
    nro_caso: number;
    fecha_atencion: string; // Formato: 'YYYY-MM-DD HH:mm:ss' o ISO string
    observacion?: string;
    fecha_proxima_cita?: string; // Opcional
    usuarios_asignados?: string[]; // Array de cédulas de usuarios
}

export interface UpdateCitaData {
    fecha_atencion?: string;
    observacion?: string;
    fecha_proxima_cita?: string;
    usuarios_asignados?: string[]; // Para actualizar quién atiende
}

// ============================================================================
// CRUD BÁSICO DE CITAS
// ============================================================================

/**
 * Obtener todas las citas con detalles del caso y usuarios que atienden
 */
export async function getCitas(filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    nroCaso?: number;
    cedulaUsuario?: string;
}) {
    try {
        let sql = `
            SELECT 
                c.id_cita,
                c.nro_caso,
                c.fecha_atencion,
                c.observacion,
                c.fecha_proxima_cita,
                cs.nro_caso as caso_numero,
                cs.sintesis_caso as caso_sintesis,
                s.nombres || ' ' || s.apellidos as solicitante_nombre,
                ARRAY_AGG(DISTINCT u.nombres || ' ' || u.apellidos) FILTER (WHERE u.nombres IS NOT NULL) as atendido_por
            FROM Citas c
            LEFT JOIN Casos cs ON c.nro_caso = cs.nro_caso
            LEFT JOIN Solicitantes s ON cs.cedula_solicitante = s.cedula_solicitante
            LEFT JOIN Atienden a ON c.id_cita = a.id_cita AND c.nro_caso = a.nro_caso
            LEFT JOIN Usuarios_Sistema u ON a.cedula_usuario = u.cedula_usuario
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (filters?.fechaInicio) {
            sql += ` AND c.fecha_atencion >= $${paramIndex}`;
            params.push(filters.fechaInicio);
            paramIndex++;
        }

        if (filters?.fechaFin) {
            sql += ` AND c.fecha_atencion <= $${paramIndex}`;
            params.push(filters.fechaFin);
            paramIndex++;
        }

        if (filters?.nroCaso) {
            sql += ` AND c.nro_caso = $${paramIndex}`;
            params.push(filters.nroCaso);
            paramIndex++;
        }

        if (filters?.cedulaUsuario) {
            sql += ` AND EXISTS (
                SELECT 1 FROM Atienden a2 
                WHERE a2.id_cita = c.id_cita 
                AND a2.nro_caso = c.nro_caso 
                AND a2.cedula_usuario = $${paramIndex}
            )`;
            params.push(filters.cedulaUsuario);
            paramIndex++;
        }

        sql += `
            GROUP BY c.id_cita, c.nro_caso, c.fecha_atencion, c.observacion, c.fecha_proxima_cita,
                     cs.nro_caso, cs.sintesis_caso, s.nombres, s.apellidos
            ORDER BY c.fecha_atencion DESC
        `;

        const result = await query(sql, params);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener citas:', error);
        return { success: false, error: error.message || 'Error al obtener citas' };
    }
}

/**
 * Obtener una cita específica por ID
 */
export async function getCitaById(idCita: number, nroCaso: number) {
    try {
        const result = await query(`
            SELECT 
                c.*,
                cs.sintesis_caso,
                s.nombres || ' ' || s.apellidos as solicitante_nombre,
                ARRAY_AGG(
                    json_build_object(
                        'cedula', u.cedula_usuario,
                        'nombre', u.nombres || ' ' || u.apellidos,
                        'rol', u.rol
                    )
                ) FILTER (WHERE u.cedula_usuario IS NOT NULL) as usuarios_asignados
            FROM Citas c
            LEFT JOIN Casos cs ON c.nro_caso = cs.nro_caso
            LEFT JOIN Solicitantes s ON cs.cedula_solicitante = s.cedula_solicitante
            LEFT JOIN Atienden a ON c.id_cita = a.id_cita AND c.nro_caso = a.nro_caso
            LEFT JOIN Usuarios_Sistema u ON a.cedula_usuario = u.cedula_usuario
            WHERE c.id_cita = $1 AND c.nro_caso = $2
            GROUP BY c.id_cita, c.nro_caso, c.fecha_atencion, c.observacion, c.fecha_proxima_cita,
                     cs.sintesis_caso, s.nombres, s.apellidos
        `, [idCita, nroCaso]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Cita no encontrada' };
        }

        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al obtener cita:', error);
        return { success: false, error: error.message || 'Error al obtener cita' };
    }
}

/**
 * Crear una nueva cita
 */
export async function createCita(data: CreateCitaData) {
    try {
        // Verificar permisos
        const permiso = await verificarPermisoAlumno('crear', 'cita', { nroCaso: data.nro_caso });
        if (!permiso.allowed) {
            return { success: false, error: permiso.error || 'No tienes permisos para crear citas en este caso' };
        }
        
        await query('BEGIN');

        // Validar que el caso existe
        const casoCheck = await query('SELECT nro_caso FROM Casos WHERE nro_caso = $1', [data.nro_caso]);
        if (casoCheck.rows.length === 0) {
            await query('ROLLBACK');
            return { success: false, error: 'El caso especificado no existe' };
        }

        // Validar fecha_proxima_cita >= fecha_atencion si ambas están presentes
        if (data.fecha_proxima_cita && data.fecha_atencion) {
            const fechaAtencion = new Date(data.fecha_atencion);
            const fechaProxima = new Date(data.fecha_proxima_cita);
            if (fechaProxima < fechaAtencion) {
                await query('ROLLBACK');
                return { success: false, error: 'La fecha de próxima cita debe ser posterior a la fecha de atención' };
            }
        }

        // Insertar la cita
        const citaResult = await query(`
            INSERT INTO Citas (nro_caso, fecha_atencion, observacion, fecha_proxima_cita)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            data.nro_caso,
            data.fecha_atencion,
            data.observacion || null,
            data.fecha_proxima_cita || null
        ]);

        const nuevaCita = citaResult.rows[0];
        const idCita = nuevaCita.id_cita;

        // Asignar usuarios a la cita si se proporcionaron
        if (data.usuarios_asignados && data.usuarios_asignados.length > 0) {
            for (const cedulaUsuario of data.usuarios_asignados) {
                // Validar que el usuario existe
                const usuarioCheck = await query(
                    'SELECT cedula_usuario FROM Usuarios_Sistema WHERE cedula_usuario = $1',
                    [cedulaUsuario]
                );

                if (usuarioCheck.rows.length > 0) {
                    await query(`
                        INSERT INTO Atienden (cedula_usuario, nro_caso, id_cita)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (cedula_usuario, nro_caso, id_cita) DO NOTHING
                    `, [cedulaUsuario, data.nro_caso, idCita]);
                }
            }
        }

        await query('COMMIT');
        revalidatePath('/citations');
        revalidatePath(`/cases`);
        return { success: true, data: nuevaCita };
    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Error al crear cita:', error);
        if (error.code === '23514') { // check_violation
            return { success: false, error: 'La fecha de próxima cita debe ser posterior a la fecha de atención' };
        }
        return { success: false, error: error.message || 'Error al crear cita' };
    }
}

/**
 * Actualizar una cita existente
 */
export async function updateCita(idCita: number, nroCaso: number, data: UpdateCitaData) {
    try {
        // Verificar permisos
        const permiso = await verificarPermisoAlumno('editar', 'cita', { nroCaso, idCita });
        if (!permiso.allowed) {
            return { success: false, error: permiso.error || 'No tienes permisos para editar esta cita' };
        }
        
        await query('BEGIN');

        // Verificar que la cita existe
        const citaCheck = await query(
            'SELECT * FROM Citas WHERE id_cita = $1 AND nro_caso = $2',
            [idCita, nroCaso]
        );

        if (citaCheck.rows.length === 0) {
            await query('ROLLBACK');
            return { success: false, error: 'Cita no encontrada' };
        }

        const citaActual = citaCheck.rows[0];

        // Construir la consulta UPDATE dinámicamente
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.fecha_atencion !== undefined) {
            updates.push(`fecha_atencion = $${paramIndex}`);
            values.push(data.fecha_atencion);
            paramIndex++;
        }

        if (data.observacion !== undefined) {
            updates.push(`observacion = $${paramIndex}`);
            values.push(data.observacion || null);
            paramIndex++;
        }

        if (data.fecha_proxima_cita !== undefined) {
            updates.push(`fecha_proxima_cita = $${paramIndex}`);
            values.push(data.fecha_proxima_cita || null);
            paramIndex++;
        }

        if (updates.length === 0 && !data.usuarios_asignados) {
            await query('ROLLBACK');
            return { success: false, error: 'No hay campos para actualizar' };
        }

        // Validar fecha_proxima_cita >= fecha_atencion
        const fechaAtencion = data.fecha_atencion ? new Date(data.fecha_atencion) : new Date(citaActual.fecha_atencion);
        const fechaProxima = data.fecha_proxima_cita ? new Date(data.fecha_proxima_cita) : (citaActual.fecha_proxima_cita ? new Date(citaActual.fecha_proxima_cita) : null);
        
        if (fechaProxima && fechaProxima < fechaAtencion) {
            await query('ROLLBACK');
            return { success: false, error: 'La fecha de próxima cita debe ser posterior a la fecha de atención' };
        }

        // Actualizar la cita si hay campos para actualizar
        if (updates.length > 0) {
            values.push(idCita, nroCaso);
            const sql = `UPDATE Citas SET ${updates.join(', ')} WHERE id_cita = $${paramIndex} AND nro_caso = $${paramIndex + 1} RETURNING *`;
            await query(sql, values);
        }

        // Actualizar usuarios asignados si se proporcionaron
        if (data.usuarios_asignados !== undefined) {
            // Eliminar asignaciones existentes
            await query(`
                DELETE FROM Atienden 
                WHERE id_cita = $1 AND nro_caso = $2
            `, [idCita, nroCaso]);

            // Insertar nuevas asignaciones
            if (data.usuarios_asignados.length > 0) {
                for (const cedulaUsuario of data.usuarios_asignados) {
                    const usuarioCheck = await query(
                        'SELECT cedula_usuario FROM Usuarios_Sistema WHERE cedula_usuario = $1',
                        [cedulaUsuario]
                    );

                    if (usuarioCheck.rows.length > 0) {
                        await query(`
                            INSERT INTO Atienden (cedula_usuario, nro_caso, id_cita)
                            VALUES ($1, $2, $3)
                        `, [cedulaUsuario, nroCaso, idCita]);
                    }
                }
            }
        }

        await query('COMMIT');
        revalidatePath('/citations');
        revalidatePath(`/cases`);
        return { success: true };
    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Error al actualizar cita:', error);
        if (error.code === '23514') { // check_violation
            return { success: false, error: 'La fecha de próxima cita debe ser posterior a la fecha de atención' };
        }
        return { success: false, error: error.message || 'Error al actualizar cita' };
    }
}

/**
 * Eliminar una cita
 */
export async function deleteCita(idCita: number, nroCaso: number) {
    try {
        // Verificar permisos - solo docentes pueden eliminar
        const permiso = await verificarPermisoAlumno('eliminar', 'cita', { nroCaso, idCita });
        if (!permiso.allowed) {
            return { success: false, error: permiso.error || 'Solo los docentes pueden eliminar citas' };
        }
        
        await query('BEGIN');

        // Verificar que la cita existe
        const citaCheck = await query(
            'SELECT * FROM Citas WHERE id_cita = $1 AND nro_caso = $2',
            [idCita, nroCaso]
        );

        if (citaCheck.rows.length === 0) {
            await query('ROLLBACK');
            return { success: false, error: 'Cita no encontrada' };
        }

        // Eliminar asignaciones primero (por la FK)
        await query(`
            DELETE FROM Atienden 
            WHERE id_cita = $1 AND nro_caso = $2
        `, [idCita, nroCaso]);

        // Eliminar la cita
        await query(`
            DELETE FROM Citas 
            WHERE id_cita = $1 AND nro_caso = $2
        `, [idCita, nroCaso]);

        await query('COMMIT');
        revalidatePath('/citations');
        revalidatePath(`/cases`);
        return { success: true };
    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Error al eliminar cita:', error);
        return { success: false, error: error.message || 'Error al eliminar cita' };
    }
}

// ============================================================================
// FUNCIONES ESPECIALES
// ============================================================================

/**
 * Obtener citas de hoy para un usuario específico
 */
export async function getTodayCitas(cedulaUsuario?: string) {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        let sql = `
            SELECT 
                c.*,
                cs.nro_caso,
                cs.sintesis_caso,
                s.nombres || ' ' || s.apellidos as solicitante_nombre
            FROM Citas c
            LEFT JOIN Casos cs ON c.nro_caso = cs.nro_caso
            LEFT JOIN Solicitantes s ON cs.cedula_solicitante = s.cedula_solicitante
            WHERE c.fecha_atencion >= $1 AND c.fecha_atencion < $2
        `;

        const params: any[] = [hoy.toISOString(), manana.toISOString()];

        if (cedulaUsuario) {
            sql += ` AND EXISTS (
                SELECT 1 FROM Atienden a 
                WHERE a.id_cita = c.id_cita 
                AND a.nro_caso = c.nro_caso 
                AND a.cedula_usuario = $3
            )`;
            params.push(cedulaUsuario);
        }

        sql += ` ORDER BY c.fecha_atencion ASC`;

        const result = await query(sql, params);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener citas de hoy:', error);
        return { success: false, error: error.message || 'Error al obtener citas de hoy' };
    }
}

/**
 * Obtener citas próximas (futuras) para un usuario específico
 */
export async function getUpcomingCitas(cedulaUsuario?: string, limit: number = 10) {
    try {
        const ahora = new Date();

        let sql = `
            SELECT 
                c.*,
                cs.nro_caso,
                cs.sintesis_caso,
                s.nombres || ' ' || s.apellidos as solicitante_nombre
            FROM Citas c
            LEFT JOIN Casos cs ON c.nro_caso = cs.nro_caso
            LEFT JOIN Solicitantes s ON cs.cedula_solicitante = s.cedula_solicitante
            WHERE c.fecha_atencion > $1
        `;

        const params: any[] = [ahora.toISOString()];

        if (cedulaUsuario) {
            sql += ` AND EXISTS (
                SELECT 1 FROM Atienden a 
                WHERE a.id_cita = c.id_cita 
                AND a.nro_caso = c.nro_caso 
                AND a.cedula_usuario = $2
            )`;
            params.push(cedulaUsuario);
        }

        sql += ` ORDER BY c.fecha_atencion ASC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await query(sql, params);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener citas próximas:', error);
        return { success: false, error: error.message || 'Error al obtener citas próximas' };
    }
}

/**
 * Obtener estadísticas de citas por mes
 */
export async function getCitasStats(fechaInicio?: string, fechaFin?: string) {
    try {
        let sql = `
            SELECT 
                DATE_TRUNC('month', fecha_atencion) as mes,
                COUNT(*) as total_citas
            FROM Citas
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (fechaInicio) {
            sql += ` AND fecha_atencion >= $${paramIndex}`;
            params.push(fechaInicio);
            paramIndex++;
        }

        if (fechaFin) {
            sql += ` AND fecha_atencion <= $${paramIndex}`;
            params.push(fechaFin);
            paramIndex++;
        }

        sql += ` GROUP BY DATE_TRUNC('month', fecha_atencion) ORDER BY mes DESC`;

        const result = await query(sql, params);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener estadísticas de citas:', error);
        return { success: false, error: error.message || 'Error al obtener estadísticas' };
    }
}

// ============================================================================
// GESTIÓN DE ATIENDEN (Asignación de usuarios a citas)
// ============================================================================

/**
 * Asignar un usuario a una cita
 */
export async function asignarUsuarioACita(cedulaUsuario: string, idCita: number, nroCaso: number) {
    try {
        // Verificar que la cita existe
        const citaCheck = await query(
            'SELECT * FROM Citas WHERE id_cita = $1 AND nro_caso = $2',
            [idCita, nroCaso]
        );

        if (citaCheck.rows.length === 0) {
            return { success: false, error: 'Cita no encontrada' };
        }

        // Verificar que el usuario existe
        const usuarioCheck = await query(
            'SELECT cedula_usuario FROM Usuarios_Sistema WHERE cedula_usuario = $1',
            [cedulaUsuario]
        );

        if (usuarioCheck.rows.length === 0) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        // Insertar la asignación (ON CONFLICT para evitar duplicados)
        await query(`
            INSERT INTO Atienden (cedula_usuario, nro_caso, id_cita)
            VALUES ($1, $2, $3)
            ON CONFLICT (cedula_usuario, nro_caso, id_cita) DO NOTHING
        `, [cedulaUsuario, nroCaso, idCita]);

        revalidatePath('/citations');
        revalidatePath(`/cases`);
        return { success: true };
    } catch (error: any) {
        console.error('Error al asignar usuario a cita:', error);
        return { success: false, error: error.message || 'Error al asignar usuario' };
    }
}

/**
 * Remover un usuario de una cita
 */
export async function removerUsuarioDeCita(cedulaUsuario: string, idCita: number, nroCaso: number) {
    try {
        await query(`
            DELETE FROM Atienden 
            WHERE cedula_usuario = $1 AND id_cita = $2 AND nro_caso = $3
        `, [cedulaUsuario, idCita, nroCaso]);

        revalidatePath('/citations');
        revalidatePath(`/cases`);
        return { success: true };
    } catch (error: any) {
        console.error('Error al remover usuario de cita:', error);
        return { success: false, error: error.message || 'Error al remover usuario' };
    }
}

/**
 * Obtener usuarios asignados a una cita
 */
export async function getUsuariosAsignadosACita(idCita: number, nroCaso: number) {
    try {
        const result = await query(`
            SELECT 
                u.cedula_usuario,
                u.nombres || ' ' || u.apellidos as nombre_completo,
                u.rol,
                u.correo_electronico,
                a.fecha_registro
            FROM Atienden a
            JOIN Usuarios_Sistema u ON a.cedula_usuario = u.cedula_usuario
            WHERE a.id_cita = $1 AND a.nro_caso = $2
            ORDER BY a.fecha_registro ASC
        `, [idCita, nroCaso]);

        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener usuarios asignados:', error);
        return { success: false, error: error.message || 'Error al obtener usuarios' };
    }
}

