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
            // Eliminar duplicados si los hay
            const usuariosUnicos = [...new Set(data.usuarios)];

            for (const cedula of usuariosUnicos) {
                await client.query(`
                    INSERT INTO Notificaciones_Usuarios (id_notificacion, cedula_usuario)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
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

// ============================================================================
// ALERTAS ESPECIALES
// ============================================================================

/**
 * Verificar si hay casos pausados por más de 2 semestres consecutivos y notificar
 * A Profesores y Coordinadores
 */
export async function verificarCasosPausados() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("Iniciando verificación de casos pausados...");

        // 1. Obtener la fecha límite (Inicio del antepenúltimo semestre completado o similar)
        // Buscamos los semestres cerrados (fecha_final < NOW)
        // Ordenamos descendente.
        // El index 0 es el último cerrado.
        // El index 1 es el penúltimo cerrado.
        // Si el caso estaba pausado ANTES de que empezara el index 0 (último cerrado),
        // Significa que estuvo pausado todo el index 0 y todo el actual (si estamos en uno) ?
        // Regla: "2 semestres enteros seguidos con el estado de Pausado"
        // Interpretación: El caso debe tener el estado 'Pausado' (u otro equivalente) sin cambios
        // desde una fecha ANTERIOR al inicio del semestre pasado.

        // Vamos a buscar los últimos 2 semestres cerrados.
        const semestresResult = await client.query(`
            SELECT term, fecha_inicio, fecha_final 
            FROM Semestres 
            WHERE fecha_final < CURRENT_DATE 
            ORDER BY fecha_final DESC 
            LIMIT 2
        `);

        // Si no hay 2 semestres cerrados, es difícil calcular "2 semestres enteros".
        // Asumiremos que necesitamos al menos 2 semestres históricos.
        if (semestresResult.rows.length < 2) {
            console.log("No hay suficientes semestres históricos para validar.");
            await client.query('ROLLBACK');
            return { success: false, error: "No hay suficiente historial de semestres." };
        }

        // El semestre más reciente cerrado es rows[0].
        // El semestre anterior a ese es rows[1].
        // Si quiero que haya pasado "2 semestres enteros", el estado de pausa debe haber comenzado
        // ANTES de la fecha de inicio del rows[0] (el último cerrado).
        // Espera, si pasó TODO el rows[0] pausado, es 1 semestre.
        // Si pasó TODO el rows[1] pausado, son 2 semestres.
        // Entonces la fecha de pausa debe ser MENOR a la fecha de inicio de rows[0].
        // NO, debe ser menor a la fecha de inicio de rows[1] ?
        // A ver:
        // Hoy es Enero 2026.
        // Semestre actual: 2026-X (Running).
        // Rows[0]: 2025-25 (Cerrado Dic 2025).
        // Rows[1]: 2025-15 (Cerrado Jul 2025).
        // Si se pausó en Junio 2025 (durante 2025-15), entonces estuvo pausado el resto de 2025-15 (no entero) y todo 2025-25 (1 entero). No cumple "2 enteros".
        // Si se pausó en Enero 2025 (Inicio de 2025-15), entonces estuvo pausado todo 2025-15 y todo 2025-25. Cumple "2 enteros".
        // Entonces la fecha de inicio del estado 'Pausado' debe ser <= Fecha Inicio de rows[0] (2025-25)?
        // No, si es <= Fecha Inicio de 2025-25, solo garantiza que estuvo pausado todo 2025-25.
        // Debe ser <= Fecha Inicio de rows[1] (2025-15).

        // Definamos la fecha umbral
        const fechaUmbral = semestresResult.rows[0].fecha_inicio; // El inicio del ÚLTIMO semestre cerrado.
        // Si la pausa es anterior a esto, lleva al menos 1 semestre entero (el último cerrado) + lo que lleve del actual.
        // El requerimiento dice "2 semestres enteros seguidos".
        // Si estamos en un semestre activo, y el anterior (cerrado) fue pausado entero, y el tras-anterior (cerrado) fue pausado entero.
        // Entonces la fecha de pausa debe ser < Fecha Inicio del TRAS-ANTERIOR.
        // O sea, rows[1].

        const ultimoSemestreCerrado = semestresResult.rows[0];
        // const penultimoSemestreCerrado = semestresResult.rows[1]; // Si queremos ser estrictos con 2 cerrados.

        // Pero el requerimiento puede referirse a que lleva *mucho tiempo*.
        // Usaremos la fecha de inicio del ÚLTIMO semestre cerrado como referencia MINIMA conservadora para "revisar".
        // Pero para garantizar 2 semestres completos, deberíamos ir más atrás.
        // Vamos a usar la fecha de inicio del semestre rows[0] como "1 semestre completo".
        // Si queremos 2, usamos rows[1].

        const fechaLimite = semestresResult.rows[1] ? semestresResult.rows[1].fecha_inicio : semestresResult.rows[0].fecha_inicio;

        console.log(`Fecha límite para considerar 'Pausado largo': ${fechaLimite}`);

        // 2. Buscar casos cuyo estado actual sea 'Pausado' (o 'Archivado'? El usuario dijo 'Pausado' pero en DB dice 'Archivado' o 'Asesoria'?)
        // Voy a buscar el ID del estatus 'Pausado'. Si no existe, buscaré 'Archivado' como fallback o daré error.

        let estatusResult = await client.query("SELECT id_estatus FROM Estatus WHERE nombre_estatus ILIKE '%Pausado%'");
        if (estatusResult.rows.length === 0) {
            // Fallback: Check if 'Archivado' might be what they mean, but better to be safe.
            // Usually 'Pausado' might not exist in the initial seed I saw. The seed had: 'En proceso', 'Archivado', 'Entregado', 'Asesoría'.
            // I will try to find 'Archivado' assuming that's what might be used, OR fail gracefully if strict 'Pausado' is needed.
            // But the user specifically said "estado de Pausado". Maybe they added it manually or expecting me to support it.
            // I will assume it creates it or I should look for it.
            // Let's create it if it doesn't exist? No, read-only logic usually.
            // I'll search for it.
            console.log("No se encontró estatus 'Pausado', buscando 'Detenido' o similar, sino usando 'Archivado'?");
            // I will STRICTLY look for 'Pausado' as requested. If not found, I will try to insert it? No.
            // The user query implies this state exists for them.

            // UPDATE: I will assume the system might use 'Archivado' as paused? Or maybe the user *added* 'Pausado'.
            // I'll stick to searching 'Pausado'. If not found, I return success with warning.
            // Actually, the seed was just initial. The user might have added 'Pausado'.
        }

        let idEstatusPausado = estatusResult.rows.length > 0 ? estatusResult.rows[0].id_estatus : null;

        if (!idEstatusPausado) {
            // Try to find ANY status that looks like paused
            console.log("Advertencia: No existe estatus 'Pausado'.");
            await client.query('ROLLBACK');
            return { success: false, error: "No existe el estado 'Pausado' en el sistema." };
        }

        // 3. Buscar casos
        // La consulta debe:
        // - Unir Casos con su ÚLTIMO historial de estatus.
        // - Verificar que ese último historial sea 'Pausado'.
        // - Verificar que la fecha de ese historial sea < fechaLimite.

        // Subquery para obtener el último historial por caso
        const casosPausadosQuery = `
            WITH UltimoHistorial AS (
                SELECT DISTINCT ON (id_caso) 
                    id_caso, 
                    id_estatus, 
                    fecha_registro
                FROM Se_Le_Adjudican
                ORDER BY id_caso, fecha_registro DESC
            ),
            CoordinadoresActivos AS (
                SELECT u.cedula_usuario 
                FROM Usuarios_Sistema u 
                WHERE u.rol = 'Coordinador' AND u.activo = TRUE 
            )
            SELECT 
                uh.id_caso,
                uh.fecha_registro as fecha_pausa
            FROM UltimoHistorial uh
            WHERE uh.id_estatus = $1
              AND uh.fecha_registro < $2
        `;

        const casosResult = await client.query(casosPausadosQuery, [idEstatusPausado, fechaLimite]);
        const casos = casosResult.rows;

        console.log(`Encontrados ${casos.length} casos pausados desde antes de ${fechaLimite}`);

        let notificacionesEnviadas = 0;

        for (const caso of casos) {
            const nroCaso = caso.id_caso;

            // 4. Identificar destinatarios
            const destinatarios = new Set<string>();

            // a) Coordinadores (Todos los activos)
            const coordsNodes = await client.query("SELECT cedula_usuario FROM Usuarios_Sistema WHERE rol = 'Coordinador' AND activo = TRUE");
            coordsNodes.rows.forEach(r => destinatarios.add(r.cedula_usuario));

            // b) Profesores asignados al caso (Activos en supervision)
            // Usamos tabla Supervisan
            const profesNodes = await client.query(`
                SELECT cedula_profesor 
                FROM Supervisan 
                WHERE id_caso = $1 AND estatus = 'Activo'
            `, [nroCaso]);
            profesNodes.rows.forEach(r => destinatarios.add(r.cedula_profesor));

            if (destinatarios.size === 0) continue;

            // 5. Verificar si ya se envió notificación RECIENTE (ej. en el último mes) para este mismo motivo
            // Para no spammear cada vez que alguien entre al dashboard.
            // Buscamos en Notificaciones si hay alguna con descripcion similar y fecha reciente.
            const mensaje = `Atención: El caso Nro ${nroCaso} ha estado en estado 'Pausado' por más de 2 semestres consecutivos.`;

            const existeNotif = await client.query(`
                SELECT 1 FROM Notificaciones 
                WHERE descripcion = $1 
                  AND fecha_notificacion > (CURRENT_DATE - INTERVAL '30 days')
            `, [mensaje]);

            if (existeNotif.rows.length > 0) {
                // Ya se notificó recientemente
                continue;
            }

            // 6. Crear notificación
            // Insertar Notificacion
            const insertNotifInfo = await client.query(`
                INSERT INTO Notificaciones (descripcion, fecha_notificacion)
                VALUES ($1, NOW())
                RETURNING id_notificacion
            `, [mensaje]);

            const newIdNotif = insertNotifInfo.rows[0].id_notificacion;

            // Asociar usuarios
            for (const cedula of Array.from(destinatarios)) {
                await client.query(`
                    INSERT INTO Notificaciones_Usuarios (id_notificacion, cedula_usuario)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `, [newIdNotif, cedula]);
            }

            notificacionesEnviadas++;
        }

        await client.query('COMMIT');

        console.log(`Proceso finalizado. ${notificacionesEnviadas} notificaciones creadas.`);

        return {
            success: true,
            message: `Verificación completada. ${notificacionesEnviadas} casos reportados.`,
            data: { notificacionesGeneradas: notificacionesEnviadas }
        };

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error al verificar casos pausados:', error);
        return { success: false, error: 'Error interno al verificar casos.' };
    } finally {
        client.release();
    }
}
