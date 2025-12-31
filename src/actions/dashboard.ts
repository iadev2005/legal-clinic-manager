'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ============================================================================
// ESTATUS DE LOS CASOS
// ============================================================================

// Obtiene el conteo de los estatus de todos los casos en el sistema
export async function getCaseStatusStats() {
    try {
        const queryText = `
            SELECT 
                e.nombre_estatus AS name, 
                COUNT(sub.id_caso)::int AS value
            FROM Estatus e
            LEFT JOIN (
                SELECT DISTINCT ON (sla.id_caso) sla.id_caso, sla.id_estatus
                FROM Se_Le_Adjudican sla
                ORDER BY sla.id_caso, sla.fecha_registro DESC
            ) sub ON e.id_estatus = sub.id_estatus
            GROUP BY e.nombre_estatus
            ORDER BY value DESC
        `;

        const stats = await query(queryText);

        return { success: true, data: stats.rows };
    } catch (error) {
        console.error("Error fetching case status stats:", error);
        return { success: false, error: 'Error al obtener estadísticas de estatus de casos' };
    }
}

export async function getHistoryofchanges(cedulauser: string) {
    try {
        const stats = await query(`
            SELECT 
                a.*, 
                u.nombres as executor_nombres, 
                u.apellidos as executor_apellidos,
                u.rol as role
            FROM Acciones a
            INNER JOIN (
                SELECT id_caso FROM Se_Asignan WHERE cedula_alumno = $1 AND estatus = 'Activo'
                UNION
                SELECT id_caso FROM Supervisan WHERE cedula_profesor = $1 AND estatus = 'Activo'
            ) related ON a.nro_caso = related.id_caso
            LEFT JOIN Usuarios_Sistema u ON a.cedula_usuario_ejecutor = u.cedula_usuario
            ORDER BY a.fecha_registro DESC
            LIMIT 50
            `, [cedulauser])

        const formattedData = stats.rows.map(row => ({
            id: row.id_accion,
            user: `${row.executor_nombres || ''} ${row.executor_apellidos || ''}`.trim() || 'Sistema',
            role: row.role || 'Usuario',
            action: row.descripcion || row.tipo_accion || 'Acción realizada',
            date: row.fecha_registro ? new Date(row.fecha_registro).toLocaleString('es-ES', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Recientemente'
        }));

        return { success: true, data: formattedData };
    } catch (error) {
        console.error("Error fetching case history:", error);
        return { success: false, error: 'Error al obtener historial de cambios' };
    }
}

export async function getTotalSolicitantesCount() {
    try {
        const result = await query('SELECT COUNT(*)::int as count FROM Solicitantes');
        return { success: true, count: result.rows[0].count };
    } catch (error) {
        console.error("Error fetching total solicitantes:", error);
        return { success: false, error: 'Error al obtener total de solicitantes' };
    }
}

export async function getTodayAppointmentsCount(cedula: string) {
    try {
        const result = await query(`
            SELECT COUNT(DISTINCT ci.id_cita)::int as count
            FROM Citas ci
            INNER JOIN (
                SELECT id_caso FROM Se_Asignan WHERE cedula_alumno = $1 AND estatus = 'Activo'
                UNION
                SELECT id_caso FROM Supervisan WHERE cedula_profesor = $1 AND estatus = 'Activo'
            ) related ON ci.nro_caso = related.id_caso
            WHERE ci.fecha_atencion::date = CURRENT_DATE
        `, [cedula]);
        return { success: true, count: result.rows[0].count };
    } catch (error) {
        console.error("Error fetching today appointments count:", error);
        return { success: false, error: 'Error al obtener citas de hoy' };
    }
}