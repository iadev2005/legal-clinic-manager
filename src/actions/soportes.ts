'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { verificarPermisoAlumno } from '@/lib/permissions';

export interface SoporteLegalInput {
    nro_caso: number;
    descripcion: string;
    documento_url: string;
    observacion?: string;
}

export async function crearSoporteLegalDirecto(data: SoporteLegalInput) {
    try {
        // Verificar permisos
        const permiso = await verificarPermisoAlumno('crear', 'soporte', { nroCaso: data.nro_caso });
        if (!permiso.allowed) {
            return {
                success: false,
                message: permiso.error || 'No tienes permisos para crear anexos en este caso'
            };
        }
        
        const sql = `
      INSERT INTO Soportes_Legales (nro_caso, descripcion, documento_url, observacion)
      VALUES ($1, $2, $3, $4)
      RETURNING id_soporte, nro_caso
    `;

        const result = await query(sql, [data.nro_caso, data.descripcion, data.documento_url, data.observacion || null]);

        revalidatePath('/cases');
        revalidatePath(`/cases/${data.nro_caso}`);

        return {
            success: true,
            message: 'Soporte registrado correctamente',
            data: result.rows[0]
        };

    } catch (error: any) {
        console.error('Error al crear soporte:', error);

        // Manejo básico de errores de FK
        if (error.code === '23503') { // foreign_key_violation
            return {
                success: false,
                message: `El caso N° ${data.nro_caso} no existe.`
            };
        }

        return {
            success: false,
            message: 'Error de base de datos: ' + error.message,
        };
    }
}

export async function crearSoporteLegal(prevState: any, formData: FormData) {
    const nro_caso = formData.get('nro_caso');
    const descripcion = formData.get('descripcion');
    const documento_url = formData.get('documento_url');
    const observacion = formData.get('observacion');

    if (!nro_caso || !descripcion || !documento_url) {
        return {
            success: false,
            message: 'Faltan campos obligatorios (Caso, Descripción o Documento)',
        };
    }

    try {
        // Verificar permisos
        const permiso = await verificarPermisoAlumno('crear', 'soporte', { nroCaso: parseInt(nro_caso as string) });
        if (!permiso.allowed) {
            return {
                success: false,
                message: permiso.error || 'No tienes permisos para crear anexos en este caso'
            };
        }
        
        const sql = `
      INSERT INTO Soportes_Legales (nro_caso, descripcion, documento_url, observacion)
      VALUES ($1, $2, $3, $4)
      RETURNING id_soporte
    `;

        const result = await query(sql, [nro_caso, descripcion, documento_url, observacion]);

        revalidatePath('/dashboard/casos');
        revalidatePath(`/dashboard/casos/${nro_caso}`);

        return {
            success: true,
            message: 'Soporte registrado correctamente',
            id_soporte: result.rows[0].id_soporte
        };

    } catch (error: any) {
        console.error('Error al crear soporte:', error);

        // Manejo básico de errores de FK
        if (error.code === '23503') { // foreign_key_violation
            return {
                success: false,
                message: `El caso N° ${nro_caso} no existe.`
            };
        }

        return {
            success: false,
            message: 'Error de base de datos: ' + error.message,
        };
    }
}
