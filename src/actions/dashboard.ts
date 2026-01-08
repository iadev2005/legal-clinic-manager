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
            WITH UserCases AS (
                SELECT id_caso FROM Se_Asignan WHERE cedula_alumno = $1 AND estatus = 'Activo'
                UNION
                SELECT id_caso FROM Supervisan WHERE cedula_profesor = $1 AND estatus = 'Activo'
            )
            SELECT * FROM (
                -- 1. Acciones
                SELECT 
                    'accion_' || a.nro_accion as unique_id,
                    a.nro_caso,
                    'Acción' as type,
                    a.titulo_accion as description,
                    a.fecha_registro as date,
                    u.nombres as executor_nombres, 
                    u.apellidos as executor_apellidos,
                    u.rol as role
                FROM Acciones a
                JOIN UserCases uc ON a.nro_caso = uc.id_caso
                LEFT JOIN Usuarios_Sistema u ON a.cedula_usuario_ejecutor = u.cedula_usuario

                UNION ALL

                -- 2. Citas (via Atienden)
                SELECT 
                    'cita_' || c.id_cita || '_' || ati.cedula_usuario as unique_id,
                    c.nro_caso,
                    'Cita' as type,
                    'Cita realizada: ' || COALESCE(c.observacion, 'Sin observación') as description,
                    ati.fecha_registro as date,
                    u.nombres as executor_nombres,
                    u.apellidos as executor_apellidos,
                    u.rol as role
                FROM Citas c
                JOIN UserCases uc ON c.nro_caso = uc.id_caso
                JOIN Atienden ati ON c.id_cita = ati.id_cita
                LEFT JOIN Usuarios_Sistema u ON ati.cedula_usuario = u.cedula_usuario

                UNION ALL

                -- 3. Soportes Legales
                SELECT 
                    'soporte_' || s.id_soporte as unique_id,
                    s.nro_caso,
                    'Soporte' as type,
                    'Soporte cargado: ' || COALESCE(s.descripcion, 'Documento') as description,
                    s.fecha_soporte::timestamp as date,
                    'Sistema' as executor_nombres, 
                    '' as executor_apellidos, 
                    'Sistema' as role
                FROM Soportes_Legales s
                JOIN UserCases uc ON s.nro_caso = uc.id_caso

                UNION ALL

                -- 4. Cambios de Estatus
                SELECT 
                    'estatus_' || sla.id_historial as unique_id,
                    sla.id_caso,
                    'Estatus' as type,
                    'Cambio de estatus a ' || e.nombre_estatus as description,
                    sla.fecha_registro as date,
                    u.nombres as executor_nombres,
                    u.apellidos as executor_apellidos,
                    u.rol as role
                FROM Se_Le_Adjudican sla
                JOIN UserCases uc ON sla.id_caso = uc.id_caso
                JOIN Estatus e ON sla.id_estatus = e.id_estatus
                LEFT JOIN Usuarios_Sistema u ON sla.cedula_usuario = u.cedula_usuario
            ) combined_activity
            ORDER BY date DESC
            LIMIT 50
        `, [cedulauser]);

        const formattedData = stats.rows.map(row => ({
            id: row.unique_id,
            user: `${row.executor_nombres || ''} ${row.executor_apellidos || ''}`.trim() || 'Sistema',
            role: row.role || 'Sistema',
            action: row.description || 'Actividad registrada', // Mapped description to action column in UI
            type: row.type, // Added type for potential UI filtering/icons
            date: row.date ? new Date(row.date).toLocaleString('es-ES', {
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