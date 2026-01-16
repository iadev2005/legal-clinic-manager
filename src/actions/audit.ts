'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth-utils';

/**
 * Registra cambios en la tabla Auditoria_Usuarios
 */
export async function logUsuarioChange(
    cedulaModificado: string,
    campo: string,
    valorAnterior: any,
    valorNuevo: any
) {
    try {
        const session = await getSession();

        await query(
            `INSERT INTO Auditoria_Usuarios 
            (cedula_usuario_modificado, campo_modificado, valor_anterior, valor_nuevo, cedula_responsable, nombre_responsable) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                cedulaModificado,
                campo,
                valorAnterior?.toString() || null,
                valorNuevo?.toString() || null,
                session?.cedula || 'SISTEMA',
                session?.nombre || 'Sistema'
            ]
        );
    } catch (error) {
        console.error('Error logging usuario change:', error);
    }
}

/**
 * Registra cambios en la tabla Auditoria_Solicitantes
 */
export async function logSolicitanteChange(
    cedulaModificado: string,
    campo: string,
    valorAnterior: any,
    valorNuevo: any
) {
    try {
        const session = await getSession();

        await query(
            `INSERT INTO Auditoria_Solicitantes 
            (cedula_solicitante_modificado, campo_modificado, valor_anterior, valor_nuevo, cedula_responsable, nombre_responsable) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                cedulaModificado,
                campo,
                valorAnterior?.toString() || null,
                valorNuevo?.toString() || null,
                session?.cedula || 'SISTEMA',
                session?.nombre || 'Sistema'
            ]
        );
    } catch (error) {
        console.error('Error logging solicitante change:', error);
    }
}

/**
 * Registra cambios en la tabla Auditoria_Casos
 */
export async function logCasoChange(
    nroCaso: number,
    tipoEntidad: 'Caso' | 'Cita' | 'Accion' | 'Soporte' | 'Beneficiario' | 'Asignacion',
    campo: string,
    valorAnterior: any,
    valorNuevo: any,
    idEntidad?: string
) {
    try {
        const session = await getSession();

        await query(
            `INSERT INTO Auditoria_Casos 
            (nro_caso, tipo_entidad, id_entidad, campo_modificado, valor_anterior, valor_nuevo, cedula_responsable, nombre_responsable) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                nroCaso,
                tipoEntidad,
                idEntidad || null,
                campo,
                valorAnterior?.toString() || null,
                valorNuevo?.toString() || null,
                session?.cedula || 'SISTEMA',
                session?.nombre || 'Sistema'
            ]
        );
    } catch (error) {
        console.error('Error logging caso change:', error);
    }
}

/**
 * Compara dos objetos y registra las diferencias
 */
export function compareAndLogChanges<T extends Record<string, any>>(
    oldData: T,
    newData: T,
    logFunction: (campo: string, valorAnterior: any, valorNuevo: any) => Promise<void>,
    fieldsToTrack?: string[]
) {
    const fields = fieldsToTrack || Object.keys(newData);

    for (const field of fields) {
        const oldValue = oldData[field];
        const newValue = newData[field];

        // Solo registrar si hay cambio real
        if (oldValue !== newValue) {
            logFunction(field, oldValue, newValue);
        }
    }
}
