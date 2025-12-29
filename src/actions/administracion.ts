'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ============================================================================
// USUARIOS
// ============================================================================

export interface Usuario {
    id: string; // cedula_usuario
    user: string; // nombres + apellidos
    role: string;
    cedulaPrefix: string;
    cedulaNumber: string;
    nombres: string;
    apellidos: string;
    correo: string;
    sexo: 'M' | 'F';
    telefonoLocal?: string;
    telefonoCelular?: string;
    status: string; // activo
}

export async function getUsuarios() {
    try {
        const result = await query(`
            SELECT 
                cedula_usuario as id,
                nombres || ' ' || apellidos as user,
                rol as role,
                CASE 
                    WHEN SUBSTRING(cedula_usuario, 1, 1) = 'V' THEN 'V'
                    WHEN SUBSTRING(cedula_usuario, 1, 1) = 'E' THEN 'E'
                    ELSE 'V'
                END as "cedulaPrefix",
                CASE 
                    WHEN POSITION('-' IN cedula_usuario) > 0 
                    THEN SUBSTRING(cedula_usuario FROM POSITION('-' IN cedula_usuario) + 1)
                    ELSE SUBSTRING(cedula_usuario FROM 2)
                END as "cedulaNumber",
                nombres,
                apellidos,
                correo_electronico as correo,
                'M' as sexo,
                telefono_local as "telefonoLocal",
                telefono_celular as "telefonoCelular",
                CASE WHEN activo THEN 'Activo' ELSE 'Inactivo' END as status
            FROM Usuarios_Sistema
            ORDER BY activo, nombres, apellidos
        `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return { success: false, error: 'Error al obtener usuarios' };
    }
}

export async function createUsuario(data: Partial<Usuario> & { password: string }) {
    try {
        const cedula = `${data.cedulaPrefix}-${data.cedulaNumber}`;
        
        // Hash simple de contraseña usando crypto nativo
        const crypto = await import('crypto');
        const contrasena_hash = crypto.createHash('sha256').update(data.password).digest('hex');

        const result = await query(`
            INSERT INTO Usuarios_Sistema (
                cedula_usuario, correo_electronico, contrasena_hash,
                nombres, apellidos, telefono_celular, telefono_local,
                rol, activo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            cedula,
            data.correo,
            contrasena_hash,
            data.nombres,
            data.apellidos,
            data.telefonoCelular || null,
            data.telefonoLocal || null,
            data.role || 'Estudiante',
            true
        ]);

        revalidatePath('/administration');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al crear usuario:', error);
        if (error.code === '23505') { // unique_violation
            return { success: false, error: 'El correo o cédula ya existe' };
        }
        return { success: false, error: error.message || 'Error al crear usuario' };
    }
}

export async function updateUsuario(id: string, data: Partial<Usuario> & { password?: string }) {
    try {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.nombres) {
            updates.push(`nombres = $${paramCount++}`);
            values.push(data.nombres);
        }
        if (data.apellidos) {
            updates.push(`apellidos = $${paramCount++}`);
            values.push(data.apellidos);
        }
        if (data.correo) {
            updates.push(`correo_electronico = $${paramCount++}`);
            values.push(data.correo);
        }
        if (data.telefonoCelular !== undefined) {
            updates.push(`telefono_celular = $${paramCount++}`);
            values.push(data.telefonoCelular || null);
        }
        if (data.telefonoLocal !== undefined) {
            updates.push(`telefono_local = $${paramCount++}`);
            values.push(data.telefonoLocal || null);
        }
        if (data.role) {
            updates.push(`rol = $${paramCount++}`);
            values.push(data.role);
        }
        if (data.status !== undefined) {
            updates.push(`activo = $${paramCount++}`);
            values.push(data.status === 'Activo');
        }
        if (data.password) {
            const crypto = await import('crypto');
            const contrasena_hash = crypto.createHash('sha256').update(data.password).digest('hex');
            updates.push(`contrasena_hash = $${paramCount++}`);
            values.push(contrasena_hash);
        }

        if (updates.length === 0) {
            return { success: false, error: 'No hay campos para actualizar' };
        }

        values.push(id);
        const result = await query(`
            UPDATE Usuarios_Sistema 
            SET ${updates.join(', ')}
            WHERE cedula_usuario = $${paramCount}
            RETURNING *
        `, values);

        revalidatePath('/administration');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al actualizar usuario:', error);
        return { success: false, error: error.message || 'Error al actualizar usuario' };
    }
}

export async function deleteUsuario(id: string) {
    try {
        await query('DELETE FROM Usuarios_Sistema WHERE cedula_usuario = $1', [id]);
        revalidatePath('/administration');
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        return { success: false, error: error.message || 'Error al eliminar usuario' };
    }
}

// Obtener participaciones (Alumnos/Profesores) de un usuario
export async function getParticipacionesUsuario(cedula: string) {
    try {
        const alumnos = await query(`
            SELECT term as semestre, nrc, tipo
            FROM Alumnos
            WHERE cedula_alumno = $1
            ORDER BY term DESC
        `, [cedula]);

        const profesores = await query(`
            SELECT term as semestre, nrc, tipo
            FROM Profesores
            WHERE cedula_profesor = $1
            ORDER BY term DESC
        `, [cedula]);

        return {
            success: true,
            data: [
                ...alumnos.rows.map((r: any) => ({ ...r, id: cedula })),
                ...profesores.rows.map((r: any) => ({ ...r, id: cedula }))
            ]
        };
    } catch (error) {
        console.error('Error al obtener participaciones:', error);
        return { success: false, error: 'Error al obtener participaciones', data: [] };
    }
}

// ============================================================================
// CATEGORÍAS
// ============================================================================

export interface Categoria {
    id: string; // num_categoria-id_materia
    nombre: string;
    legalfieldid: string; // id_materia
    num_categoria?: number;
    id_materia?: number;
}

export async function getCategorias() {
    try {
        const result = await query(`
            SELECT 
                num_categoria || '-' || id_materia as id,
                nombre_categoria as nombre,
                id_materia::text as "legalfieldid",
                num_categoria,
                id_materia
            FROM Categorias
            ORDER BY id_materia, num_categoria
        `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return { success: false, error: 'Error al obtener categorías' };
    }
}

export async function createCategoria(data: Partial<Categoria>) {
    try {
        if (!data.legalfieldid || String(data.legalfieldid).trim() === '') {
            return { success: false, error: 'Se requiere id_materia' };
        }

        const idMateriaStr = String(data.legalfieldid).trim();
        const idMateria = parseInt(idMateriaStr);
        
        if (isNaN(idMateria) || idMateria <= 0) {
            console.error('ID materia inválido:', data.legalfieldid, 'Tipo:', typeof data.legalfieldid);
            return { success: false, error: `El id_materia no es válido: "${data.legalfieldid}"` };
        }

        const result = await query(`
            INSERT INTO Categorias (id_materia, nombre_categoria)
            VALUES ($1, $2)
            RETURNING num_categoria, id_materia, nombre_categoria
        `, [idMateria, data.nombre]);

        revalidatePath('/administration');
        return {
            success: true,
            data: {
                id: `${result.rows[0].num_categoria}-${result.rows[0].id_materia}`,
                nombre: result.rows[0].nombre_categoria,
                legalfieldid: result.rows[0].id_materia.toString()
            }
        };
    } catch (error: any) {
        console.error('Error al crear categoría:', error);
        return { success: false, error: error.message || 'Error al crear categoría' };
    }
}

export async function updateCategoria(id: string, data: Partial<Categoria>) {
    try {
        const parts = id.split('-');
        if (parts.length !== 2) {
            return { success: false, error: 'El ID no tiene el formato correcto' };
        }

        const num_categoria = parseInt(parts[0]);
        const id_materia = parseInt(parts[1]);

        if (isNaN(num_categoria) || isNaN(id_materia)) {
            return { success: false, error: 'Los valores del ID no son válidos' };
        }
        
        const result = await query(`
            UPDATE Categorias
            SET nombre_categoria = $1
            WHERE num_categoria = $2 AND id_materia = $3
            RETURNING *
        `, [data.nombre, num_categoria, id_materia]);

        revalidatePath('/administration');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al actualizar categoría:', error);
        return { success: false, error: error.message || 'Error al actualizar categoría' };
    }
}

export async function deleteCategoria(id: string) {
    try {
        const parts = id.split('-');
        if (parts.length !== 2) {
            return { success: false, error: 'El ID no tiene el formato correcto' };
        }

        const num_categoria = parseInt(parts[0]);
        const id_materia = parseInt(parts[1]);

        if (isNaN(num_categoria) || isNaN(id_materia)) {
            return { success: false, error: 'Los valores del ID no son válidos' };
        }

        await query(`
            DELETE FROM Categorias
            WHERE num_categoria = $1 AND id_materia = $2
        `, [num_categoria, id_materia]);
        revalidatePath('/administration');
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar categoría:', error);
        return { success: false, error: error.message || 'Error al eliminar categoría' };
    }
}

// ============================================================================
// SUBCATEGORÍAS
// ============================================================================

export interface SubCategoria {
    id: string; // num_subcategoria-num_categoria-id_materia
    nombre: string;
    categorylegalfieldid: string; // num_categoria-id_materia
    num_subcategoria?: number;
    num_categoria?: number;
    id_materia?: number;
}

export async function getSubCategorias() {
    try {
        const result = await query(`
            SELECT 
                num_subcategoria || '-' || num_categoria || '-' || id_materia as id,
                nombre_subcategoria as nombre,
                num_categoria || '-' || id_materia as "categorylegalfieldid",
                num_subcategoria,
                num_categoria,
                id_materia
            FROM Sub_Categorias
            ORDER BY id_materia, num_categoria, num_subcategoria
        `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener subcategorías:', error);
        return { success: false, error: 'Error al obtener subcategorías' };
    }
}

export async function createSubCategoria(data: Partial<SubCategoria>) {
    try {
        if (!data.categorylegalfieldid) {
            return { success: false, error: 'Se requiere categorylegalfieldid' };
        }

        const parts = data.categorylegalfieldid.split('-');
        if (parts.length !== 2) {
            return { success: false, error: 'El categorylegalfieldid no tiene el formato correcto' };
        }

        const num_categoria = parseInt(parts[0]);
        const id_materia = parseInt(parts[1]);

        if (isNaN(num_categoria) || isNaN(id_materia)) {
            return { success: false, error: 'Los valores de categoría o materia no son válidos' };
        }

        // Calcular el siguiente num_subcategoria disponible para esta combinación
        const maxResult = await query(`
            SELECT COALESCE(MAX(num_subcategoria), 0) as max_num
            FROM Sub_Categorias
            WHERE num_categoria = $1 AND id_materia = $2
        `, [num_categoria, id_materia]);

        const nextNumSubcategoria = (maxResult.rows[0]?.max_num || 0) + 1;

        const result = await query(`
            INSERT INTO Sub_Categorias (num_subcategoria, num_categoria, id_materia, nombre_subcategoria)
            VALUES ($1, $2, $3, $4)
            RETURNING num_subcategoria, num_categoria, id_materia, nombre_subcategoria
        `, [nextNumSubcategoria, num_categoria, id_materia, data.nombre]);

        revalidatePath('/administration');
        return {
            success: true,
            data: {
                id: `${result.rows[0].num_subcategoria}-${result.rows[0].num_categoria}-${result.rows[0].id_materia}`,
                nombre: result.rows[0].nombre_subcategoria,
                categorylegalfieldid: data.categorylegalfieldid
            }
        };
    } catch (error: any) {
        console.error('Error al crear subcategoría:', error);
        if (error.code === '23505') { // unique_violation
            return { success: false, error: 'Ya existe una subcategoría con ese identificador' };
        }
        return { success: false, error: error.message || 'Error al crear subcategoría' };
    }
}

export async function updateSubCategoria(id: string, data: Partial<SubCategoria>) {
    try {
        const parts = id.split('-');
        if (parts.length !== 3) {
            return { success: false, error: 'El ID no tiene el formato correcto' };
        }

        const num_subcategoria = parseInt(parts[0]);
        const num_categoria = parseInt(parts[1]);
        const id_materia = parseInt(parts[2]);

        if (isNaN(num_subcategoria) || isNaN(num_categoria) || isNaN(id_materia)) {
            return { success: false, error: 'Los valores del ID no son válidos' };
        }
        
        const result = await query(`
            UPDATE Sub_Categorias
            SET nombre_subcategoria = $1
            WHERE num_subcategoria = $2 AND num_categoria = $3 AND id_materia = $4
            RETURNING *
        `, [data.nombre, num_subcategoria, num_categoria, id_materia]);

        revalidatePath('/administration');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al actualizar subcategoría:', error);
        return { success: false, error: error.message || 'Error al actualizar subcategoría' };
    }
}

export async function deleteSubCategoria(id: string) {
    try {
        const parts = id.split('-');
        if (parts.length !== 3) {
            return { success: false, error: 'El ID no tiene el formato correcto' };
        }

        const num_subcategoria = parseInt(parts[0]);
        const num_categoria = parseInt(parts[1]);
        const id_materia = parseInt(parts[2]);

        if (isNaN(num_subcategoria) || isNaN(num_categoria) || isNaN(id_materia)) {
            return { success: false, error: 'Los valores del ID no son válidos' };
        }

        await query(`
            DELETE FROM Sub_Categorias
            WHERE num_subcategoria = $1 AND num_categoria = $2 AND id_materia = $3
        `, [num_subcategoria, num_categoria, id_materia]);
        revalidatePath('/administration');
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar subcategoría:', error);
        return { success: false, error: error.message || 'Error al eliminar subcategoría' };
    }
}

// ============================================================================
// NÚCLEOS
// ============================================================================

export interface Nucleo {
    id: string;
    nombre: string;
    id_parroquia?: number;
}

export async function getNucleos() {
    try {
        const result = await query(`
            SELECT 
                n.id_nucleo::text as id,
                n.nombre,
                n.id_parroquia,
                p.nombre_parroquia,
                m.id_municipio,
                m.nombre_municipio,
                e.id_estado,
                e.nombre_estado
            FROM Nucleos n
            LEFT JOIN Parroquias p ON n.id_parroquia = p.id_parroquia
            LEFT JOIN Municipios m ON p.id_municipio = m.id_municipio
            LEFT JOIN Estados e ON m.id_estado = e.id_estado
            ORDER BY e.nombre_estado, m.nombre_municipio, n.nombre
        `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener núcleos:', error);
        return { success: false, error: 'Error al obtener núcleos' };
    }
}

export async function createNucleo(data: Partial<Nucleo>) {
    try {
        let id_parroquia: number | null = null;
        if (data.id_parroquia) {
            const parsed = parseInt(String(data.id_parroquia));
            id_parroquia = isNaN(parsed) ? null : parsed;
        }
        const result = await query(`
            INSERT INTO Nucleos (nombre, id_parroquia)
            VALUES ($1, $2)
            RETURNING id_nucleo, nombre
        `, [data.nombre, id_parroquia]);

        revalidatePath('/administration');
        return {
            success: true,
            data: {
                id: result.rows[0].id_nucleo.toString(),
                nombre: result.rows[0].nombre
            }
        };
    } catch (error: any) {
        console.error('Error al crear núcleo:', error);
        return { success: false, error: error.message || 'Error al crear núcleo' };
    }
}

export async function updateNucleo(id: string, data: Partial<Nucleo>) {
    try {
        let id_parroquia: number | null = null;
        if (data.id_parroquia) {
            const parsed = parseInt(String(data.id_parroquia));
            id_parroquia = isNaN(parsed) ? null : parsed;
        }

        const idNucleo = parseInt(id);
        if (isNaN(idNucleo)) {
            return { success: false, error: 'El ID del núcleo no es válido' };
        }

        const result = await query(`
            UPDATE Nucleos
            SET nombre = $1, id_parroquia = $2
            WHERE id_nucleo = $3
            RETURNING *
        `, [data.nombre, id_parroquia, idNucleo]);

        revalidatePath('/administration');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        console.error('Error al actualizar núcleo:', error);
        return { success: false, error: error.message || 'Error al actualizar núcleo' };
    }
}

export async function deleteNucleo(id: string) {
    try {
        const idNucleo = parseInt(id);
        if (isNaN(idNucleo)) {
            return { success: false, error: 'El ID del núcleo no es válido' };
        }
        await query('DELETE FROM Nucleos WHERE id_nucleo = $1', [idNucleo]);
        revalidatePath('/administration');
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar núcleo:', error);
        return { success: false, error: error.message || 'Error al eliminar núcleo' };
    }
}

// ============================================================================
// HELPERS: Obtener catálogos para formularios
// ============================================================================

export async function getMaterias() {
    try {
        const result = await query(`
            SELECT id_materia::text as id, nombre_materia as nombre
            FROM Materias
            ORDER BY nombre_materia
        `);
        return { success: true, data: result.rows };
    } catch (error) {
        console.error('Error al obtener materias:', error);
        return { success: false, error: 'Error al obtener materias' };
    }
}

