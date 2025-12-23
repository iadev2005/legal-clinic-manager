'use server';

import { query } from '@/lib/db';
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

export async function createSolicitante(data: Partial<Solicitante>) {
    try {
        const result = await query(
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

        revalidatePath('/dev');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al crear solicitante:', error);
        return {
            success: false,
            error: error.message || 'Error al crear solicitante'
        };
    }
}

export async function deleteSolicitante(cedula: string) {
    try {
        await query(
            'DELETE FROM Solicitantes WHERE cedula_solicitante = $1',
            [cedula]
        );

        revalidatePath('/dev');
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
