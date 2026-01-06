'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth-utils';
import { createNotificacion } from './notificaciones';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface Caso {
    nro_caso: number;
    cedula_solicitante: string;
    id_nucleo: number;
    id_tramite: number;
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
    sintesis_caso?: string;
    fecha_caso_inicio: string;
    fecha_caso_final?: string;
    cnt_beneficiarios: number;
}

export interface SoporteLegalData {
    descripcion: string;
    documento_url: string;
    observacion?: string;
}

export interface CreateCasoData {
    cedula_solicitante: string;
    id_nucleo: number;
    id_tramite: number;
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
    sintesis_caso?: string;
    fecha_caso_inicio?: string;
    beneficiarios: BeneficiarioData[];
    asignacion?: {
        cedula_alumno?: string;
        cedula_profesor?: string;
        term: string;
    };
    soportes?: SoporteLegalData[];
}

export interface BeneficiarioData {
    cedula_beneficiario: string;
    cedula_es_propia: boolean;
    nombres?: string;
    apellidos?: string;
    sexo?: 'M' | 'F';
    fecha_nacimiento?: string;
    tipo_beneficiario: 'Directo' | 'Indirecto';
    parentesco?: string;
}

// ============================================================================
// CRUD BÁSICO DE CASOS
// ============================================================================

export async function getCasos() {
    try {
        const result = await query(`
      SELECT 
        c.*,
        s.nombres || ' ' || s.apellidos as solicitante_nombre,
        n.nombre as nombre_nucleo,
        t.nombre as nombre_tramite,
        m.nombre_materia,
        cat.nombre_categoria,
        sub.nombre_subcategoria,
        amb.nombre_ambito_legal,
        (
          SELECT e.nombre_estatus 
          FROM Casos_Semestres cs
          JOIN Estatus e ON cs.id_estatus = e.id_estatus
          JOIN Semestres sem ON cs.term = sem.term
          WHERE cs.nro_caso = c.nro_caso
          ORDER BY sem.fecha_inicio DESC
          LIMIT 1
        ) as estatus_actual,
        (
          SELECT STRING_AGG(u.nombres || ' ' || u.apellidos, ', ')
          FROM Se_Asignan sa
          JOIN Usuarios_Sistema u ON sa.cedula_alumno = u.cedula_usuario
          WHERE sa.id_caso = c.nro_caso AND sa.estatus = 'Activo'
        ) as alumno_asignado,
        (
          SELECT u.nombres || ' ' || u.apellidos
          FROM Supervisan sv
          JOIN Usuarios_Sistema u ON sv.cedula_profesor = u.cedula_usuario
          WHERE sv.id_caso = c.nro_caso AND sv.estatus = 'Activo'
          LIMIT 1
        ) as profesor_supervisor
      FROM Casos c
      JOIN Solicitantes s ON c.cedula_solicitante = s.cedula_solicitante
      JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
      JOIN Tramites t ON c.id_tramite = t.id_tramite
      JOIN Materias m ON c.id_materia = m.id_materia
      JOIN Categorias cat ON c.num_categoria = cat.num_categoria AND c.id_materia = cat.id_materia
      JOIN Sub_Categorias sub ON c.num_subcategoria = sub.num_subcategoria 
        AND c.num_categoria = sub.num_categoria AND c.id_materia = sub.id_materia
      JOIN Ambitos_Legales amb ON c.num_ambito_legal = amb.num_ambito_legal 
        AND c.num_subcategoria = amb.num_subcategoria 
        AND c.num_categoria = amb.num_categoria 
        AND c.id_materia = amb.id_materia
      ORDER BY c.nro_caso DESC
    `);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener casos:', error);
        return { success: false, error: error.message || 'Error al obtener casos' };
    }
}

export async function getCasoById(nroCaso: number) {
    try {
        const result = await query(`
      SELECT 
        c.*,
        s.nombres || ' ' || s.apellidos as solicitante_nombre,
        s.cedula_solicitante,
        n.nombre as nombre_nucleo,
        t.nombre as nombre_tramite,
        m.nombre_materia,
        cat.nombre_categoria,
        sub.nombre_subcategoria,
        amb.nombre_ambito_legal,
        (
          SELECT e.nombre_estatus 
          FROM Casos_Semestres cs
          JOIN Estatus e ON cs.id_estatus = e.id_estatus
          JOIN Semestres sem ON cs.term = sem.term
          WHERE cs.nro_caso = c.nro_caso
          ORDER BY sem.fecha_inicio DESC
          LIMIT 1
        ) as estatus_actual
      FROM Casos c
      JOIN Solicitantes s ON c.cedula_solicitante = s.cedula_solicitante
      JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
      JOIN Tramites t ON c.id_tramite = t.id_tramite
      JOIN Materias m ON c.id_materia = m.id_materia
      JOIN Categorias cat ON c.num_categoria = cat.num_categoria AND c.id_materia = cat.id_materia
      JOIN Sub_Categorias sub ON c.num_subcategoria = sub.num_subcategoria 
        AND c.num_categoria = sub.num_categoria AND c.id_materia = sub.id_materia
      JOIN Ambitos_Legales amb ON c.num_ambito_legal = amb.num_ambito_legal 
        AND c.num_subcategoria = amb.num_subcategoria 
        AND c.num_categoria = amb.num_categoria 
        AND c.id_materia = amb.id_materia
      WHERE c.nro_caso = $1
    `, [nroCaso]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Caso no encontrado' };
        }

        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al obtener caso:', error);
        return { success: false, error: error.message || 'Error al obtener caso' };
    }
}

export async function createCaso(data: CreateCasoData) {
    try {
        // Iniciar transacción
        await query('BEGIN');

        // 1. Crear el caso
        const casoResult = await query(`
      INSERT INTO Casos (
        cedula_solicitante, id_nucleo, id_tramite,
        id_materia, num_categoria, num_subcategoria, num_ambito_legal,
        sintesis_caso, fecha_caso_inicio
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
            data.cedula_solicitante,
            data.id_nucleo,
            data.id_tramite,
            data.id_materia,
            data.num_categoria,
            data.num_subcategoria,
            data.num_ambito_legal,
            data.sintesis_caso || null,
            data.fecha_caso_inicio || new Date().toISOString().split('T')[0]
        ]);

        const nroCaso = casoResult.rows[0].nro_caso;

        // 2. Agregar beneficiarios
        for (const beneficiario of data.beneficiarios) {
            await query(`
        INSERT INTO Beneficiarios (
          cedula_beneficiario, nro_caso, cedula_es_propia,
          nombres, apellidos, sexo, fecha_nacimiento,
          tipo_beneficiario, parentesco
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
                beneficiario.cedula_beneficiario,
                nroCaso,
                beneficiario.cedula_es_propia,
                beneficiario.nombres || null,
                beneficiario.apellidos || null,
                beneficiario.sexo || null,
                beneficiario.fecha_nacimiento || null,
                beneficiario.tipo_beneficiario,
                beneficiario.parentesco || null
            ]);
        }

        // 3. Asignar estatus inicial (En proceso)
        const estatusResult = await query(`
      SELECT id_estatus FROM Estatus WHERE nombre_estatus = 'En proceso' LIMIT 1
    `);

        if (estatusResult.rows.length > 0) {
            const session = await getSession();
            await query(`
        INSERT INTO Se_Le_Adjudican (id_caso, id_estatus, cedula_usuario, motivo)
        VALUES ($1, $2, $3, $4)
      `, [nroCaso, estatusResult.rows[0].id_estatus, session?.cedula || null, 'Caso creado']);

            // NUEVO: Vincular automáticamente con el semestre actual (o el indicado en asignación)
            if (data.asignacion?.term) {
                await query(`
                    INSERT INTO Casos_Semestres (nro_caso, term, id_estatus, cedula_usuario)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT DO NOTHING
                `, [nroCaso, data.asignacion.term, estatusResult.rows[0].id_estatus, session?.cedula || null]);
            } else {
                // Intentar buscar semestre activo
                const termResult = await query(
                    'SELECT term FROM Semestres WHERE CURRENT_DATE BETWEEN fecha_inicio AND fecha_final ORDER BY fecha_inicio DESC LIMIT 1'
                );
                if (termResult.rows.length > 0) {
                    await query(`
                        INSERT INTO Casos_Semestres (nro_caso, term, id_estatus, cedula_usuario)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT DO NOTHING
                    `, [nroCaso, termResult.rows[0].term, estatusResult.rows[0].id_estatus, session?.cedula || null]);
                }
            }
        }

        // 4. Asignar alumno/profesor si se proporcionó
        if (data.asignacion) {
            if (data.asignacion.cedula_alumno) {
                await query(`
          INSERT INTO Se_Asignan (id_caso, cedula_alumno, term, estatus)
          VALUES ($1, $2, $3, 'Activo')
        `, [nroCaso, data.asignacion.cedula_alumno, data.asignacion.term]);
            }

            if (data.asignacion.cedula_profesor) {
                await query(`
          INSERT INTO Supervisan (id_caso, cedula_profesor, term, estatus)
          VALUES ($1, $2, $3, 'Activo')
        `, [nroCaso, data.asignacion.cedula_profesor, data.asignacion.term]);

                // Notificar al profesor
                try {
                    await createNotificacion({
                        descripcion: `Se le ha asignado la supervisión del caso #${nroCaso}.`,
                        fecha_notificacion: new Date(),
                        usuarios: [data.asignacion.cedula_profesor]
                    });
                } catch (notifError) {
                    console.error('Error enviando notificación de creación (profesor):', notifError);
                }
            }

            // Notificar al alumno si fue asignado
            if (data.asignacion.cedula_alumno) {
                try {
                    await createNotificacion({
                        descripcion: `Se le ha asignado el caso #${nroCaso}.`,
                        fecha_notificacion: new Date(),
                        usuarios: [data.asignacion.cedula_alumno]
                    });
                } catch (notifError) {
                    console.error('Error enviando notificación de creación (alumno):', notifError);
                }
            }
        }

        // 5. Agregar soportes legales si se proporcionaron
        if (data.soportes && data.soportes.length > 0) {
            for (const soporte of data.soportes) {
                await query(`
          INSERT INTO Soportes_Legales (nro_caso, descripcion, documento_url, observacion)
          VALUES ($1, $2, $3, $4)
        `, [nroCaso, soporte.descripcion, soporte.documento_url, soporte.observacion || null]);
            }
        }

        await query('COMMIT');
        revalidatePath('/cases');
        return { success: true, data: casoResult.rows[0] };
    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Error al crear caso:', error);
        return { success: false, error: error.message || 'Error al crear caso' };
    }
}

export interface UpdateCasoData {
    cedula_solicitante?: string;
    id_nucleo?: number;
    id_tramite?: number;
    id_materia?: number;
    num_categoria?: number;
    num_subcategoria?: number;
    num_ambito_legal?: number;
    sintesis_caso?: string;
    fecha_caso_inicio?: string;
    fecha_caso_final?: string | null;
}

export async function updateCaso(nroCaso: number, data: UpdateCasoData) {
    try {
        await query('BEGIN');

        // Construir la consulta UPDATE dinámicamente
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.cedula_solicitante !== undefined) {
            updates.push(`cedula_solicitante = $${paramIndex}`);
            values.push(data.cedula_solicitante);
            paramIndex++;
        }
        if (data.id_nucleo !== undefined) {
            updates.push(`id_nucleo = $${paramIndex}`);
            values.push(data.id_nucleo);
            paramIndex++;
        }
        if (data.id_tramite !== undefined) {
            updates.push(`id_tramite = $${paramIndex}`);
            values.push(data.id_tramite);
            paramIndex++;
        }
        if (data.id_materia !== undefined) {
            updates.push(`id_materia = $${paramIndex}`);
            values.push(data.id_materia);
            paramIndex++;
        }
        if (data.num_categoria !== undefined) {
            updates.push(`num_categoria = $${paramIndex}`);
            values.push(data.num_categoria);
            paramIndex++;
        }
        if (data.num_subcategoria !== undefined) {
            updates.push(`num_subcategoria = $${paramIndex}`);
            values.push(data.num_subcategoria);
            paramIndex++;
        }
        if (data.num_ambito_legal !== undefined) {
            updates.push(`num_ambito_legal = $${paramIndex}`);
            values.push(data.num_ambito_legal);
            paramIndex++;
        }
        if (data.sintesis_caso !== undefined) {
            updates.push(`sintesis_caso = $${paramIndex}`);
            values.push(data.sintesis_caso || null);
            paramIndex++;
        }
        if (data.fecha_caso_inicio !== undefined) {
            updates.push(`fecha_caso_inicio = $${paramIndex}`);
            values.push(data.fecha_caso_inicio);
            paramIndex++;
        }
        if (data.fecha_caso_final !== undefined) {
            updates.push(`fecha_caso_final = $${paramIndex}`);
            values.push(data.fecha_caso_final);
            paramIndex++;
        }

        if (updates.length === 0) {
            await query('ROLLBACK');
            return { success: false, error: 'No hay campos para actualizar' };
        }

        // Agregar el nro_caso al final para el WHERE
        values.push(nroCaso);
        const sql = `UPDATE Casos SET ${updates.join(', ')} WHERE nro_caso = $${paramIndex} RETURNING *`;

        const result = await query(sql, values);

        await query('COMMIT');
        revalidatePath('/cases');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Error al actualizar caso:', error);
        return { success: false, error: error.message || 'Error al actualizar caso' };
    }
}

export async function deleteCaso(nroCaso: number) {
    try {
        await query('DELETE FROM Casos WHERE nro_caso = $1', [nroCaso]);
        revalidatePath('/cases');
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar caso:', error);
        return { success: false, error: error.message || 'Error al eliminar caso' };
    }
}

// ============================================================================
// ESTATUS Y HISTORIAL
// ============================================================================

export async function getEstatusActual(nroCaso: number) {
    try {
        const result = await query(`
      SELECT e.*, sla.fecha_registro, sla.motivo,
             u.nombres || ' ' || u.apellidos as usuario_nombre
      FROM Se_Le_Adjudican sla
      JOIN Estatus e ON sla.id_estatus = e.id_estatus
      LEFT JOIN Usuarios_Sistema u ON sla.cedula_usuario = u.cedula_usuario
      WHERE sla.id_caso = $1
      ORDER BY sla.fecha_registro DESC
      LIMIT 1
    `, [nroCaso]);

        return { success: true, data: result.rows[0] || null };
    } catch (error: any) {
        console.error('Error al obtener estatus:', error);
        return { success: false, error: error.message };
    }
}

export async function cambiarEstatus(nroCaso: number, idEstatus: number, motivo: string, cedulaUsuario?: string) {
    try {
        await query(`
      INSERT INTO Se_Le_Adjudican (id_caso, id_estatus, cedula_usuario, motivo)
      VALUES ($1, $2, $3, $4)
    `, [nroCaso, idEstatus, cedulaUsuario || null, motivo]);

        // Lógica de notificación para cambio de Estatus
        const statusNameResult = await query('SELECT nombre_estatus FROM Estatus WHERE id_estatus = $1', [idEstatus]);
        if (statusNameResult.rows.length > 0) {
            const nombreEstatus = statusNameResult.rows[0].nombre_estatus;

            const usuariosANotificar: string[] = [];

            // 1. Profesor activo
            const profesorActivo = await query(`
                SELECT cedula_profesor FROM Supervisan 
                WHERE id_caso = $1 AND estatus = 'Activo'
            `, [nroCaso]);

            if (profesorActivo.rows.length > 0) {
                usuariosANotificar.push(...profesorActivo.rows.map((r: any) => r.cedula_profesor));
            }

            // 2. Alumnos activos
            const alumnosActivos = await query(`
                SELECT cedula_alumno FROM Se_Asignan 
                WHERE id_caso = $1 AND estatus = 'Activo'
            `, [nroCaso]);

            if (alumnosActivos.rows.length > 0) {
                usuariosANotificar.push(...alumnosActivos.rows.map((r: any) => r.cedula_alumno));
            }

            // 3. Coordinadores activos
            const coordinadores = await query(`
                SELECT cedula_usuario FROM Usuarios_Sistema 
                WHERE rol = 'Coordinador' AND activo = true
            `);

            if (coordinadores.rows.length > 0) {
                usuariosANotificar.push(...coordinadores.rows.map((c: any) => c.cedula_usuario));
            }

            if (usuariosANotificar.length > 0) {
                await createNotificacion({
                    descripcion: `El caso #${nroCaso} ha cambiado su estatus a ${nombreEstatus}.`,
                    fecha_notificacion: new Date(),
                    usuarios: [...new Set(usuariosANotificar)] // Eliminar duplicados
                });
            }
        }

        revalidatePath('/cases');
        return { success: true };
    } catch (error: any) {
        console.error('Error al cambiar estatus:', error);
        return { success: false, error: error.message };
    }
}

export async function getHistorialEstatus(nroCaso: number) {
    try {
        const result = await query(`
      SELECT 
        sla.*,
        e.nombre_estatus,
        u.nombres || ' ' || u.apellidos as usuario_nombre
      FROM Se_Le_Adjudican sla
      JOIN Estatus e ON sla.id_estatus = e.id_estatus
      LEFT JOIN Usuarios_Sistema u ON sla.cedula_usuario = u.cedula_usuario
      WHERE sla.id_caso = $1
      ORDER BY sla.fecha_registro DESC
    `, [nroCaso]);

        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener historial:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// ASIGNACIONES
// ============================================================================

export async function getAsignacionesActivas(nroCaso: number) {
    try {
        const [alumnos, profesores] = await Promise.all([
            query(`
        SELECT 
          sa.*,
          u.nombres || ' ' || u.apellidos as alumno_nombre,
          u.correo_electronico
        FROM Se_Asignan sa
        JOIN Usuarios_Sistema u ON sa.cedula_alumno = u.cedula_usuario
        WHERE sa.id_caso = $1 AND sa.estatus = 'Activo'
      `, [nroCaso]),
            query(`
        SELECT 
          sv.*,
          u.nombres || ' ' || u.apellidos as profesor_nombre,
          u.correo_electronico
        FROM Supervisan sv
        JOIN Usuarios_Sistema u ON sv.cedula_profesor = u.cedula_usuario
        WHERE sv.id_caso = $1 AND sv.estatus = 'Activo'
      `, [nroCaso])
        ]);

        return {
            success: true,
            data: {
                alumnos: alumnos.rows,
                profesores: profesores.rows
            }
        };
    } catch (error: any) {
        console.error('Error al obtener asignaciones:', error);
        return { success: false, error: error.message };
    }
}

export async function asignarAlumno(nroCaso: number, cedulaAlumno: string, term: string) {
    try {
        await query('BEGIN');

        // Verificar si ya está asignado
        const existing = await query(`
            SELECT id_asignacion FROM Se_Asignan 
            WHERE id_caso = $1 AND cedula_alumno = $2 AND estatus = 'Activo'
        `, [nroCaso, cedulaAlumno]);

        if (existing.rows.length > 0) {
            await query('ROLLBACK');
            return { success: true, message: 'El alumno ya está asignado a este caso.' };
        }

        // Insertar la nueva asignación activa (permitiendo múltiples)
        await query(`
      INSERT INTO Se_Asignan (id_caso, cedula_alumno, term, estatus)
      VALUES ($1, $2, $3, 'Activo')
    `, [nroCaso, cedulaAlumno, term]);

        // Notificar al alumno
        try {
            await createNotificacion({
                descripcion: `Se le ha asignado el caso #${nroCaso}.`,
                fecha_notificacion: new Date(),
                usuarios: [cedulaAlumno]
            });
        } catch (notifError) {
            console.error('Error enviando notificación (asignar alumno):', notifError);
        }

        await query('COMMIT');
        revalidatePath('/cases');
        return { success: true };
    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Error al asignar alumno:', error);
        return { success: false, error: error.message };
    }
}

export async function asignarProfesor(nroCaso: number, cedulaProfesor: string, term: string) {
    try {
        await query('BEGIN');

        // 1. Desactivar cualquier supervisión activa previa para este caso
        await query(`
      UPDATE Supervisan
      SET estatus = 'Inactivo'
      WHERE id_caso = $1 AND estatus = 'Activo'
    `, [nroCaso]);

        // 2. Insertar la nueva supervisión activa
        await query(`
      INSERT INTO Supervisan (id_caso, cedula_profesor, term, estatus)
      VALUES ($1, $2, $3, 'Activo')
    `, [nroCaso, cedulaProfesor, term]);

        // Notificar al profesor
        try {
            await createNotificacion({
                descripcion: `Se le ha asignado la supervisión del caso #${nroCaso}.`,
                fecha_notificacion: new Date(),
                usuarios: [cedulaProfesor]
            });
        } catch (notifError) {
            console.error('Error enviando notificación (asignar profesor):', notifError);
        }

        await query('COMMIT');
        revalidatePath('/cases');
        return { success: true };
    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Error al asignar profesor:', error);
        return { success: false, error: error.message };
    }
}

export async function desactivarAsignacion(idAsignacion: number, tipo: 'alumno' | 'profesor') {
    try {
        const tabla = tipo === 'alumno' ? 'Se_Asignan' : 'Supervisan';
        const idColumn = tipo === 'alumno' ? 'id_asignacion' : 'id_supervision';

        await query(`
      UPDATE ${tabla}
      SET estatus = 'Inactivo'
      WHERE ${idColumn} = $1
    `, [idAsignacion]);

        revalidatePath('/cases');
        return { success: true };
    } catch (error: any) {
        console.error('Error al desactivar asignación:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// BENEFICIARIOS
// ============================================================================

export async function getBeneficiariosCaso(nroCaso: number) {
    try {
        const result = await query(`
      SELECT * FROM Beneficiarios
      WHERE nro_caso = $1
      ORDER BY tipo_beneficiario, nombres
    `, [nroCaso]);

        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener beneficiarios:', error);
        return { success: false, error: error.message };
    }
}

export async function addBeneficiario(nroCaso: number, data: BeneficiarioData) {
    try {
        await query(`
      INSERT INTO Beneficiarios (
        cedula_beneficiario, nro_caso, cedula_es_propia,
        nombres, apellidos, sexo, fecha_nacimiento,
        tipo_beneficiario, parentesco
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
            data.cedula_beneficiario,
            nroCaso,
            data.cedula_es_propia,
            data.nombres || null,
            data.apellidos || null,
            data.sexo || null,
            data.fecha_nacimiento || null,
            data.tipo_beneficiario,
            data.parentesco || null
        ]);

        revalidatePath('/cases');
        return { success: true };
    } catch (error: any) {
        console.error('Error al agregar beneficiario:', error);
        return { success: false, error: error.message };
    }
}

export async function removeBeneficiario(cedulaBeneficiario: string, nroCaso: number) {
    try {
        await query(`
      DELETE FROM Beneficiarios
      WHERE cedula_beneficiario = $1 AND nro_caso = $2
    `, [cedulaBeneficiario, nroCaso]);

        revalidatePath('/cases');
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar beneficiario:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// GESTIÓN DE SEMESTRES (NUEVO)
// ============================================================================

export async function vincularCasoSemestre(nroCaso: number, term: string, idEstatus: number) {
    try {
        const session = await getSession();

        await query(`
            INSERT INTO Casos_Semestres (nro_caso, term, id_estatus, cedula_usuario)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (nro_caso, term) 
            DO UPDATE SET 
                id_estatus = EXCLUDED.id_estatus,
                cedula_usuario = EXCLUDED.cedula_usuario,
                fecha_registro = CURRENT_TIMESTAMP
        `, [nroCaso, term, idEstatus, session?.cedula || null]);

        revalidatePath('/cases');
        return { success: true };
    } catch (error: any) {
        console.error('Error al vincular caso con semestre:', error);
        return { success: false, error: error.message };
    }
}

export async function getCasoSemestre(nroCaso: number, term: string) {
    try {
        const result = await query(`
            SELECT cs.*, e.nombre_estatus
            FROM Casos_Semestres cs
            JOIN Estatus e ON cs.id_estatus = e.id_estatus
            WHERE cs.nro_caso = $1 AND cs.term = $2
        `, [nroCaso, term]);

        if (result.rows.length > 0) {
            return { success: true, data: result.rows[0] };
        } else {
            return { success: true, data: null };
        }
    } catch (error: any) {
        console.error('Error al obtener estado de caso en semestre:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// CATÁLOGOS PARA JERARQUÍA LEGAL
// ============================================================================

export async function getMaterias() {
    try {
        const result = await query(`
      SELECT id_materia, nombre_materia
      FROM Materias
      ORDER BY nombre_materia
    `);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener materias:', error);
        return { success: false, error: error.message };
    }
}

export async function getCategoriasByMateria(idMateria: number) {
    try {
        const result = await query(`
      SELECT num_categoria, id_materia, nombre_categoria
      FROM Categorias
      WHERE id_materia = $1
      ORDER BY nombre_categoria
    `, [idMateria]);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener categorías:', error);
        return { success: false, error: error.message };
    }
}

export async function getSubCategoriasByCategoria(numCategoria: number, idMateria: number) {
    try {
        const result = await query(`
      SELECT num_subcategoria, num_categoria, id_materia, nombre_subcategoria
      FROM Sub_Categorias
      WHERE num_categoria = $1 AND id_materia = $2
      ORDER BY nombre_subcategoria
    `, [numCategoria, idMateria]);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener subcategorías:', error);
        return { success: false, error: error.message };
    }
}

export async function getAmbitosBySubCategoria(numSubcategoria: number, numCategoria: number, idMateria: number) {
    try {
        const result = await query(`
      SELECT num_ambito_legal, num_subcategoria, num_categoria, id_materia, nombre_ambito_legal
      FROM Ambitos_Legales
      WHERE num_subcategoria = $1 AND num_categoria = $2 AND id_materia = $3
      ORDER BY nombre_ambito_legal
    `, [numSubcategoria, numCategoria, idMateria]);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener ámbitos legales:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// OTROS CATÁLOGOS
// ============================================================================

export async function getTramites() {
    try {
        const result = await query(`
      SELECT id_tramite, nombre
      FROM Tramites
      ORDER BY nombre
    `);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener trámites:', error);
        return { success: false, error: error.message };
    }
}

export async function getEstatus() {
    try {
        const result = await query(`
      SELECT id_estatus, nombre_estatus
      FROM Estatus
      ORDER BY id_estatus
    `);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener estatus:', error);
        return { success: false, error: error.message };
    }
}

export async function getNucleos() {
    try {
        const result = await query(`
      SELECT id_nucleo, nombre
      FROM Nucleos
      ORDER BY nombre
    `);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener núcleos:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// RELACIONES
// ============================================================================

export async function getCasosBySolicitante(cedulaSolicitante: string) {
    try {
        const result = await query(`
      SELECT 
        c.*,
        n.nombre as nombre_nucleo,
        t.nombre as nombre_tramite,
        m.nombre_materia,
        (
          SELECT nombre_estatus 
          FROM Se_Le_Adjudican sla
          JOIN Estatus e ON sla.id_estatus = e.id_estatus
          WHERE sla.id_caso = c.nro_caso
          ORDER BY sla.fecha_registro DESC
          LIMIT 1
        ) as estatus_actual
      FROM Casos c
      JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
      JOIN Tramites t ON c.id_tramite = t.id_tramite
      JOIN Materias m ON c.id_materia = m.id_materia
      WHERE c.cedula_solicitante = $1
      ORDER BY c.nro_caso DESC
    `, [cedulaSolicitante]);

        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener casos del solicitante:', error);
        return { success: false, error: error.message };
    }
}

export async function getSoportesCaso(nroCaso: number) {
    try {
        const result = await query(`
      SELECT * FROM Soportes_Legales
      WHERE nro_caso = $1
      ORDER BY fecha_soporte DESC
    `, [nroCaso]);

        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener soportes:', error);
        return { success: false, error: error.message };
    }
}

export async function getCitasCaso(nroCaso: number) {
    try {
        const result = await query(`
      SELECT * FROM Citas
      WHERE nro_caso = $1
      ORDER BY fecha_atencion DESC
    `, [nroCaso]);

        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener citas:', error);
        return { success: false, error: error.message };
    }
}

export async function getAccionesCaso(nroCaso: number) {
    try {
        const result = await query(`
      SELECT 
        a.*,
        u.nombres || ' ' || u.apellidos as usuario_nombre
      FROM Acciones a
      LEFT JOIN Usuarios_Sistema u ON a.cedula_usuario_ejecutor = u.cedula_usuario
      WHERE a.nro_caso = $1
      ORDER BY a.fecha_registro DESC
    `, [nroCaso]);

        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener acciones:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// OBTENER ALUMNOS Y PROFESORES DISPONIBLES
// ============================================================================

export async function getAlumnosDisponibles(term?: string) {
    try {
        let queryStr = `
      SELECT DISTINCT
        u.cedula_usuario,
        u.nombres || ' ' || u.apellidos as nombre_completo,
        u.nombres,
        u.apellidos,
        a.term,
        a.tipo
      FROM Usuarios_Sistema u
      INNER JOIN Alumnos a ON u.cedula_usuario = a.cedula_alumno
      WHERE u.rol = 'Estudiante' AND u.activo = TRUE
    `;

        const params: any[] = [];
        if (term) {
            queryStr += ` AND a.term = $1`;
            params.push(term);
        }

        queryStr += ` ORDER BY u.nombres, u.apellidos`;

        const result = await query(queryStr, params);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener alumnos:', error);
        return { success: false, error: error.message };
    }
}

export async function getProfesoresDisponibles(term?: string) {
    try {
        let queryStr = `
      SELECT DISTINCT
        u.cedula_usuario,
        u.nombres || ' ' || u.apellidos as nombre_completo,
        u.nombres,
        u.apellidos,
        p.term,
        p.tipo
      FROM Usuarios_Sistema u
      INNER JOIN Profesores p ON u.cedula_usuario = p.cedula_profesor
      WHERE u.rol = 'Profesor' AND u.activo = TRUE
    `;

        const params: any[] = [];
        if (term) {
            queryStr += ` AND p.term = $1`;
            params.push(term);
        }

        queryStr += ` ORDER BY u.nombres, u.apellidos`;

        const result = await query(queryStr, params);
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener profesores:', error);
        return { success: false, error: error.message };
    }
}
