'use server';

import { query } from '@/lib/db';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface Solicitante {
    cedula_solicitante: string;
    nombres: string;
    apellidos: string;
    telefono_local?: string;
    telefono_celular?: string;
    correo_electronico?: string;
    sexo?: 'M' | 'F';
    nacionalidad?: 'V' | 'E';
    estado_civil?: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo';
    en_concubinato?: boolean;
    fecha_nacimiento: string;
    buscando_trabajo?: boolean;
    tipo_periodo_educacion?: string;
    cantidad_tiempo_educacion?: number;
    id_parroquia: number;
    id_actividad_solicitante?: number;
    id_trabajo?: number;
    id_nivel_educativo?: number;
}

export interface Vivienda {
    cedula_solicitante: string;
    tipo_vivienda?: 'Casa' | 'Apartamento' | 'Rancho' | 'Otro';
    cantidad_habitaciones?: number;
    cantidad_banos?: number;
    material_piso?: 'Tierra' | 'Cemento' | 'Cerámica' | 'Granito / Parquet / Mármol' | 'Otro';
    material_paredes?: 'Cartón / Palma / Desechos' | 'Bahareque' | 'Bloque sin frizar' | 'Bloque frizado' | 'Otro';
    material_techo?: 'Madera / Cartón / Palma' | 'Zinc / Acerolit' | 'Platabanda / Tejas' | 'Otro';
    agua_potable?: 'Dentro de la vivienda' | 'Fuera de la vivienda' | 'No tiene servicio';
    eliminacion_aguas?: 'Poceta a cloaca' | 'Pozo séptico' | 'Letrina' | 'No tiene';
    aseo_urbano?: 'Llega a la vivienda' | 'No llega / Container' | 'No tiene';
}

export interface FamiliaHogar {
    cedula_solicitante: string;
    cantidad_personas: number;
    cantidad_trabajadores?: number;
    cantidad_ninos?: number;
    cantidad_ninos_estudiando?: number;
    ingreso_mensual_aprox?: number;
    es_jefe_hogar?: boolean;
    id_nivel_educativo_jefe?: number;
}

export interface Bien {
    id_bien: number;
    descripcion: string;
}

export async function getSolicitantes() {
    try {
        const result = await query(`
      SELECT 
        s.*,
        p.nombre_parroquia,
        m.nombre_municipio,
        e.nombre_estado
      FROM Solicitantes s
      LEFT JOIN Parroquias p ON s.id_parroquia = p.id_parroquia
      LEFT JOIN Municipios m ON p.id_municipio = m.id_municipio
      LEFT JOIN Estados e ON m.id_estado = e.id_estado
      ORDER BY s.nombres, s.apellidos
    `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener solicitantes:', error);
        return { success: false, error: 'Error al obtener solicitantes' };
    }
}

export async function createSolicitante(data: Partial<Solicitante> & {
    vivienda?: Partial<Vivienda>;
    familia?: Partial<FamiliaHogar>;
    bienes?: number[];
}) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Validar constraint de familia antes de insertar
        if (data.familia) {
            const cantidadPersonas = data.familia.cantidad_personas || 1;
            const cantidadTrabajadores = data.familia.cantidad_trabajadores || 0;
            const cantidadNinos = data.familia.cantidad_ninos || 0;
            
            if (cantidadTrabajadores + cantidadNinos > cantidadPersonas) {
                throw new Error(
                    `La suma de trabajadores (${cantidadTrabajadores}) y niños (${cantidadNinos}) ` +
                    `no puede ser mayor que la cantidad de personas (${cantidadPersonas})`
                );
            }
        }
        
        // 1. Crear el solicitante
        const result = await client.query(
            `INSERT INTO Solicitantes (
        cedula_solicitante, nombres, apellidos, telefono_local, telefono_celular,
        correo_electronico, sexo, nacionalidad, estado_civil, en_concubinato,
        fecha_nacimiento, buscando_trabajo, tipo_periodo_educacion,
        cantidad_tiempo_educacion, id_parroquia, id_actividad_solicitante,
        id_trabajo, id_nivel_educativo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
            [
                data.cedula_solicitante,
                data.nombres,
                data.apellidos,
                data.telefono_local || null,
                data.telefono_celular || null,
                data.correo_electronico || null,
                data.sexo || null,
                data.nacionalidad || 'V',
                data.estado_civil || null,
                data.en_concubinato || false,
                data.fecha_nacimiento,
                data.buscando_trabajo || false,
                data.tipo_periodo_educacion || null,
                data.cantidad_tiempo_educacion || null,
                data.id_parroquia,
                data.id_actividad_solicitante || null,
                data.id_trabajo || null,
                data.id_nivel_educativo || null,
            ]
        );

        const cedula = result.rows[0].cedula_solicitante;

        // 2. Crear vivienda si se proporcionó
        if (data.vivienda) {
            await client.query(
                `INSERT INTO Viviendas (
                    cedula_solicitante, tipo_vivienda, cantidad_habitaciones, cantidad_banos,
                    material_piso, material_paredes, material_techo,
                    agua_potable, eliminacion_aguas, aseo_urbano
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (cedula_solicitante) 
                DO UPDATE SET
                    tipo_vivienda = EXCLUDED.tipo_vivienda,
                    cantidad_habitaciones = EXCLUDED.cantidad_habitaciones,
                    cantidad_banos = EXCLUDED.cantidad_banos,
                    material_piso = EXCLUDED.material_piso,
                    material_paredes = EXCLUDED.material_paredes,
                    material_techo = EXCLUDED.material_techo,
                    agua_potable = EXCLUDED.agua_potable,
                    eliminacion_aguas = EXCLUDED.eliminacion_aguas,
                    aseo_urbano = EXCLUDED.aseo_urbano`,
                [
                    cedula,
                    data.vivienda.tipo_vivienda || null,
                    data.vivienda.cantidad_habitaciones || null,
                    data.vivienda.cantidad_banos || null,
                    data.vivienda.material_piso || null,
                    data.vivienda.material_paredes || null,
                    data.vivienda.material_techo || null,
                    data.vivienda.agua_potable || null,
                    data.vivienda.eliminacion_aguas || null,
                    data.vivienda.aseo_urbano || null,
                ]
            );
        }

        // 3. Crear familia/hogar si se proporcionó
        if (data.familia) {
            await client.query(
                `INSERT INTO Familias_Hogares (
                    cedula_solicitante, cantidad_personas, cantidad_trabajadores,
                    cantidad_ninos, cantidad_ninos_estudiando, ingreso_mensual_aprox,
                    es_jefe_hogar, id_nivel_educativo_jefe
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (cedula_solicitante) 
                DO UPDATE SET
                    cantidad_personas = EXCLUDED.cantidad_personas,
                    cantidad_trabajadores = EXCLUDED.cantidad_trabajadores,
                    cantidad_ninos = EXCLUDED.cantidad_ninos,
                    cantidad_ninos_estudiando = EXCLUDED.cantidad_ninos_estudiando,
                    ingreso_mensual_aprox = EXCLUDED.ingreso_mensual_aprox,
                    es_jefe_hogar = EXCLUDED.es_jefe_hogar,
                    id_nivel_educativo_jefe = EXCLUDED.id_nivel_educativo_jefe`,
                [
                    cedula,
                    data.familia.cantidad_personas || 1,
                    data.familia.cantidad_trabajadores || 0,
                    data.familia.cantidad_ninos || 0,
                    data.familia.cantidad_ninos_estudiando || 0,
                    data.familia.ingreso_mensual_aprox || null,
                    data.familia.es_jefe_hogar || false,
                    data.familia.id_nivel_educativo_jefe || null,
                ]
            );
        }

        // 4. Asignar bienes si se proporcionaron
        if (data.bienes && data.bienes.length > 0) {
            // Eliminar todos los bienes actuales
            await client.query(
                'DELETE FROM Almacenan WHERE cedula_solicitante = $1',
                [cedula]
            );
            
            // Insertar los nuevos bienes
            for (const idBien of data.bienes) {
                await client.query(
                    'INSERT INTO Almacenan (cedula_solicitante, id_bien) VALUES ($1, $2)',
                    [cedula, idBien]
                );
            }
        }

        await client.query('COMMIT');
        revalidatePath('/dev');
        revalidatePath('/applicants');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error al crear solicitante:', error);
        return {
            success: false,
            error: error.message || 'Error al crear solicitante'
        };
    } finally {
        client.release();
    }
}

export async function updateSolicitante(cedula: string, data: Partial<Solicitante> & {
    vivienda?: Partial<Vivienda>;
    familia?: Partial<FamiliaHogar>;
    bienes?: number[];
}) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Validar constraint de familia antes de actualizar
        if (data.familia !== undefined) {
            const cantidadPersonas = data.familia.cantidad_personas || 1;
            const cantidadTrabajadores = data.familia.cantidad_trabajadores || 0;
            const cantidadNinos = data.familia.cantidad_ninos || 0;
            
            if (cantidadTrabajadores + cantidadNinos > cantidadPersonas) {
                throw new Error(
                    `La suma de trabajadores (${cantidadTrabajadores}) y niños (${cantidadNinos}) ` +
                    `no puede ser mayor que la cantidad de personas (${cantidadPersonas})`
                );
            }
        }
        
        // 1. Actualizar el solicitante
        const result = await client.query(
            `UPDATE Solicitantes SET
        nombres = $1,
        apellidos = $2,
        telefono_local = $3,
        telefono_celular = $4,
        correo_electronico = $5,
        sexo = $6,
        nacionalidad = $7,
        estado_civil = $8,
        en_concubinato = $9,
        fecha_nacimiento = $10,
        buscando_trabajo = $11,
        tipo_periodo_educacion = $12,
        cantidad_tiempo_educacion = $13,
        id_parroquia = $14,
        id_actividad_solicitante = $15,
        id_trabajo = $16,
        id_nivel_educativo = $17
      WHERE cedula_solicitante = $18
      RETURNING *`,
            [
                data.nombres,
                data.apellidos,
                data.telefono_local || null,
                data.telefono_celular || null,
                data.correo_electronico || null,
                data.sexo || null,
                data.nacionalidad || 'V',
                data.estado_civil || null,
                data.en_concubinato || false,
                data.fecha_nacimiento,
                data.buscando_trabajo || false,
                data.tipo_periodo_educacion || null,
                data.cantidad_tiempo_educacion || null,
                data.id_parroquia,
                data.id_actividad_solicitante || null,
                data.id_trabajo || null,
                data.id_nivel_educativo || null,
                cedula
            ]
        );

        if (result.rows.length === 0) {
            throw new Error('Solicitante no encontrado');
        }

        // 2. Actualizar vivienda si se proporcionó
        if (data.vivienda !== undefined) {
            await client.query(
                `INSERT INTO Viviendas (
                    cedula_solicitante, tipo_vivienda, cantidad_habitaciones, cantidad_banos,
                    material_piso, material_paredes, material_techo,
                    agua_potable, eliminacion_aguas, aseo_urbano
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (cedula_solicitante) 
                DO UPDATE SET
                    tipo_vivienda = EXCLUDED.tipo_vivienda,
                    cantidad_habitaciones = EXCLUDED.cantidad_habitaciones,
                    cantidad_banos = EXCLUDED.cantidad_banos,
                    material_piso = EXCLUDED.material_piso,
                    material_paredes = EXCLUDED.material_paredes,
                    material_techo = EXCLUDED.material_techo,
                    agua_potable = EXCLUDED.agua_potable,
                    eliminacion_aguas = EXCLUDED.eliminacion_aguas,
                    aseo_urbano = EXCLUDED.aseo_urbano`,
                [
                    cedula,
                    data.vivienda.tipo_vivienda || null,
                    data.vivienda.cantidad_habitaciones || null,
                    data.vivienda.cantidad_banos || null,
                    data.vivienda.material_piso || null,
                    data.vivienda.material_paredes || null,
                    data.vivienda.material_techo || null,
                    data.vivienda.agua_potable || null,
                    data.vivienda.eliminacion_aguas || null,
                    data.vivienda.aseo_urbano || null,
                ]
            );
        }

        // 3. Actualizar familia/hogar si se proporcionó
        if (data.familia !== undefined) {
            await client.query(
                `INSERT INTO Familias_Hogares (
                    cedula_solicitante, cantidad_personas, cantidad_trabajadores,
                    cantidad_ninos, cantidad_ninos_estudiando, ingreso_mensual_aprox,
                    es_jefe_hogar, id_nivel_educativo_jefe
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (cedula_solicitante) 
                DO UPDATE SET
                    cantidad_personas = EXCLUDED.cantidad_personas,
                    cantidad_trabajadores = EXCLUDED.cantidad_trabajadores,
                    cantidad_ninos = EXCLUDED.cantidad_ninos,
                    cantidad_ninos_estudiando = EXCLUDED.cantidad_ninos_estudiando,
                    ingreso_mensual_aprox = EXCLUDED.ingreso_mensual_aprox,
                    es_jefe_hogar = EXCLUDED.es_jefe_hogar,
                    id_nivel_educativo_jefe = EXCLUDED.id_nivel_educativo_jefe`,
                [
                    cedula,
                    data.familia.cantidad_personas || 1,
                    data.familia.cantidad_trabajadores || 0,
                    data.familia.cantidad_ninos || 0,
                    data.familia.cantidad_ninos_estudiando || 0,
                    data.familia.ingreso_mensual_aprox || null,
                    data.familia.es_jefe_hogar || false,
                    data.familia.id_nivel_educativo_jefe || null,
                ]
            );
        }

        // 4. Actualizar bienes si se proporcionaron
        if (data.bienes !== undefined) {
            // Eliminar todos los bienes actuales
            await client.query(
                'DELETE FROM Almacenan WHERE cedula_solicitante = $1',
                [cedula]
            );
            
            // Insertar los nuevos bienes
            if (data.bienes.length > 0) {
                for (const idBien of data.bienes) {
                    await client.query(
                        'INSERT INTO Almacenan (cedula_solicitante, id_bien) VALUES ($1, $2)',
                        [cedula, idBien]
                    );
                }
            }
        }

        await client.query('COMMIT');
        revalidatePath('/dev');
        revalidatePath('/applicants');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar solicitante:', error);
        return {
            success: false,
            error: error.message || 'Error al actualizar solicitante'
        };
    } finally {
        client.release();
    }
}

export async function deleteSolicitante(cedula: string) {
    try {
        await query(
            'DELETE FROM Solicitantes WHERE cedula_solicitante = $1',
            [cedula]
        );

        revalidatePath('/dev');
        revalidatePath('/applicants');
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar solicitante:', error);
        return {
            success: false,
            error: error.message || 'Error al eliminar solicitante'
        };
    }
}

// Helper: Obtener catálogos para formularios
export async function getEstados() {
    try {
        const result = await query(`
      SELECT id_estado, nombre_estado
      FROM Estados
      ORDER BY nombre_estado
    `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener estados:', error);
        return { success: false, error: 'Error al obtener estados' };
    }
}

export async function getMunicipiosByEstado(idEstado: number) {
    try {
        const result = await query(`
      SELECT id_municipio, nombre_municipio
      FROM Municipios
      WHERE id_estado = $1
      ORDER BY nombre_municipio
    `, [idEstado]);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener municipios:', error);
        return { success: false, error: 'Error al obtener municipios' };
    }
}

export async function getParroquiasByMunicipio(idMunicipio: number) {
    try {
        const result = await query(`
      SELECT id_parroquia, nombre_parroquia
      FROM Parroquias
      WHERE id_municipio = $1
      ORDER BY nombre_parroquia
    `, [idMunicipio]);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener parroquias:', error);
        return { success: false, error: 'Error al obtener parroquias' };
    }
}

export async function getParroquias() {
    try {
        const result = await query(`
      SELECT 
        p.id_parroquia,
        p.nombre_parroquia,
        m.nombre_municipio,
        e.nombre_estado
      FROM Parroquias p
      JOIN Municipios m ON p.id_municipio = m.id_municipio
      JOIN Estados e ON m.id_estado = e.id_estado
      ORDER BY e.nombre_estado, m.nombre_municipio, p.nombre_parroquia
    `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener parroquias:', error);
        return { success: false, error: 'Error al obtener parroquias' };
    }
}

export async function getNivelesEducativos() {
    try {
        const result = await query(`
      SELECT id_nivel_educativo, descripcion
      FROM Niveles_Educativos
      ORDER BY id_nivel_educativo
    `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener niveles educativos:', error);
        return { success: false, error: 'Error al obtener niveles educativos' };
    }
}

export async function getTrabajos() {
    try {
        const result = await query(`
      SELECT id_trabajo, condicion_trabajo
      FROM Trabajos
      ORDER BY id_trabajo
    `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener trabajos:', error);
        return { success: false, error: 'Error al obtener trabajos' };
    }
}

export async function getActividadesSolicitantes() {
    try {
        const result = await query(`
      SELECT id_actividad_solicitante, condicion_actividad
      FROM Actividades_Solicitantes
      ORDER BY id_actividad_solicitante
    `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        return { success: false, error: 'Error al obtener actividades' };
    }
}

// ============================================================================
// VIVIENDAS
// ============================================================================

export async function getVivienda(cedulaSolicitante: string) {
    try {
        const result = await query(
            'SELECT * FROM Viviendas WHERE cedula_solicitante = $1',
            [cedulaSolicitante]
        );
        return { success: true, data: result.rows[0] || null };
    } catch (error: any) {
        console.error('Error al obtener vivienda:', error);
        return { success: false, error: error.message };
    }
}

export async function createOrUpdateVivienda(data: Vivienda) {
    try {
        const result = await query(
            `INSERT INTO Viviendas (
                cedula_solicitante, tipo_vivienda, cantidad_habitaciones, cantidad_banos,
                material_piso, material_paredes, material_techo,
                agua_potable, eliminacion_aguas, aseo_urbano
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (cedula_solicitante) 
            DO UPDATE SET
                tipo_vivienda = EXCLUDED.tipo_vivienda,
                cantidad_habitaciones = EXCLUDED.cantidad_habitaciones,
                cantidad_banos = EXCLUDED.cantidad_banos,
                material_piso = EXCLUDED.material_piso,
                material_paredes = EXCLUDED.material_paredes,
                material_techo = EXCLUDED.material_techo,
                agua_potable = EXCLUDED.agua_potable,
                eliminacion_aguas = EXCLUDED.eliminacion_aguas,
                aseo_urbano = EXCLUDED.aseo_urbano
            RETURNING *`,
            [
                data.cedula_solicitante,
                data.tipo_vivienda || null,
                data.cantidad_habitaciones || null,
                data.cantidad_banos || null,
                data.material_piso || null,
                data.material_paredes || null,
                data.material_techo || null,
                data.agua_potable || null,
                data.eliminacion_aguas || null,
                data.aseo_urbano || null,
            ]
        );
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al guardar vivienda:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// FAMILIAS_HOGARES
// ============================================================================

export async function getFamiliaHogar(cedulaSolicitante: string) {
    try {
        const result = await query(
            'SELECT * FROM Familias_Hogares WHERE cedula_solicitante = $1',
            [cedulaSolicitante]
        );
        return { success: true, data: result.rows[0] || null };
    } catch (error: any) {
        console.error('Error al obtener familia/hogar:', error);
        return { success: false, error: error.message };
    }
}

export async function createOrUpdateFamiliaHogar(data: FamiliaHogar) {
    try {
        const result = await query(
            `INSERT INTO Familias_Hogares (
                cedula_solicitante, cantidad_personas, cantidad_trabajadores,
                cantidad_ninos, cantidad_ninos_estudiando, ingreso_mensual_aprox,
                es_jefe_hogar, id_nivel_educativo_jefe
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (cedula_solicitante) 
            DO UPDATE SET
                cantidad_personas = EXCLUDED.cantidad_personas,
                cantidad_trabajadores = EXCLUDED.cantidad_trabajadores,
                cantidad_ninos = EXCLUDED.cantidad_ninos,
                cantidad_ninos_estudiando = EXCLUDED.cantidad_ninos_estudiando,
                ingreso_mensual_aprox = EXCLUDED.ingreso_mensual_aprox,
                es_jefe_hogar = EXCLUDED.es_jefe_hogar,
                id_nivel_educativo_jefe = EXCLUDED.id_nivel_educativo_jefe
            RETURNING *`,
            [
                data.cedula_solicitante,
                data.cantidad_personas,
                data.cantidad_trabajadores || 0,
                data.cantidad_ninos || 0,
                data.cantidad_ninos_estudiando || 0,
                data.ingreso_mensual_aprox || null,
                data.es_jefe_hogar || false,
                data.id_nivel_educativo_jefe || null,
            ]
        );
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al guardar familia/hogar:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// BIENES (Almacenan)
// ============================================================================

export async function getBienes() {
    try {
        const result = await query('SELECT * FROM Bienes ORDER BY descripcion');
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener bienes:', error);
        return { success: false, error: error.message };
    }
}

export async function getBienesSolicitante(cedulaSolicitante: string) {
    try {
        const result = await query(
            `SELECT b.* FROM Bienes b
             INNER JOIN Almacenan a ON b.id_bien = a.id_bien
             WHERE a.cedula_solicitante = $1
             ORDER BY b.descripcion`,
            [cedulaSolicitante]
        );
        return { success: true, data: result.rows };
    } catch (error: any) {
        console.error('Error al obtener bienes del solicitante:', error);
        return { success: false, error: error.message };
    }
}

export async function updateBienesSolicitante(cedulaSolicitante: string, bienesIds: number[]) {
    try {
        // Eliminar todos los bienes actuales
        await query(
            'DELETE FROM Almacenan WHERE cedula_solicitante = $1',
            [cedulaSolicitante]
        );
        
        // Insertar los nuevos bienes
        if (bienesIds.length > 0) {
            const values = bienesIds.map((_, index) => 
                `($1, $${index + 2})`
            ).join(', ');
            
            await query(
                `INSERT INTO Almacenan (cedula_solicitante, id_bien) VALUES ${values}`,
                [cedulaSolicitante, ...bienesIds]
            );
        }
        
        return { success: true };
    } catch (error: any) {
        console.error('Error al actualizar bienes:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// OBTENER SOLICITANTE COMPLETO
// ============================================================================

export async function getSolicitanteCompleto(cedulaSolicitante: string) {
    try {
        const [solicitante, vivienda, familia, bienes] = await Promise.all([
            query('SELECT * FROM Solicitantes WHERE cedula_solicitante = $1', [cedulaSolicitante]),
            getVivienda(cedulaSolicitante),
            getFamiliaHogar(cedulaSolicitante),
            getBienesSolicitante(cedulaSolicitante),
        ]);

        if (solicitante.rows.length === 0) {
            return { success: false, error: 'Solicitante no encontrado' };
        }

        return {
            success: true,
            data: {
                ...solicitante.rows[0],
                vivienda: vivienda.data,
                familia: familia.data,
                bienes: bienes.data || [],
            }
        };
    } catch (error: any) {
        console.error('Error al obtener solicitante completo:', error);
        return { success: false, error: error.message };
    }
}
