'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
