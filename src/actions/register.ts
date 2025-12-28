'use server';

import { query } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function register(prevState: any, formData: FormData) {
    const cedula = formData.get('cedula') as string;
    const nombres = formData.get('nombres') as string;
    const apellidos = formData.get('apellidos') as string;
    const correo = formData.get('correo') as string;
    const password = formData.get('password') as string;
    const rol = formData.get('rol') as string;

    // Datos Opcionales / Específicos
    const telefono_local = formData.get('telefono_local') as string;
    const telefono_celular = formData.get('telefono_celular') as string;
    const sexo = formData.get('sexo') as string;
    const nrcRaw = formData.get('nrc') as string;
    const nrc = nrcRaw && nrcRaw.trim() !== '' ? nrcRaw.trim() : null;
    const tipo = formData.get('tipo') as string;

    if (!cedula || !nombres || !apellidos || !correo || !password || !rol) {
        return { success: false, error: 'Por favor complete los campos obligatorios' };
    }

    // Validaciones básicas
    if (password.length < 8) {
        return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }

    // Iniciar Transacción
    try {
        await query('BEGIN');

        // 1. Verificar existencia
        const exists = await query(
            'SELECT cedula_usuario FROM Usuarios_Sistema WHERE cedula_usuario = $1 OR correo_electronico = $2',
            [cedula, correo]
        );

        if (exists.rows.length > 0) {
            await query('ROLLBACK');
            return { success: false, error: 'La cédula o el correo ya están registrados' };
        }

        // 2. Insertar Usuario Base
        const hashedPassword = await hashPassword(password);

        await query(
            `INSERT INTO Usuarios_Sistema 
        (cedula_usuario, correo_electronico, contrasena_hash, nombres, apellidos, telefono_local, telefono_celular, rol, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
            [cedula, correo, hashedPassword, nombres, apellidos, telefono_local, telefono_celular, rol]
        );

        // 3. Insertar en tablas específicas según Rol
        // Obtener el Semestre Activo
        const termResult = await query(
            'SELECT term FROM Semestres WHERE CURRENT_DATE BETWEEN fecha_inicio AND fecha_final ORDER BY fecha_inicio DESC LIMIT 1'
        );

        if (termResult.rows.length === 0) {
            await query('ROLLBACK');
            return { success: false, error: 'No hay un periodo académico activo para registrar nuevos usuarios.' };
        }

        const term = termResult.rows[0].term;

        if (rol === 'Estudiante') {
            await query(
                'INSERT INTO Alumnos (cedula_alumno, term, tipo, nrc) VALUES ($1, $2, $3, $4)',
                [cedula, term, tipo || 'Inscrito', nrc]
            );
        } else if (rol === 'Profesor') {
            await query(
                'INSERT INTO Profesores (cedula_profesor, term, tipo, nrc) VALUES ($1, $2, $3, $4)',
                [cedula, term, tipo || 'Titular', nrc]
            );
        } else if (rol === 'Coordinador') {
            const result = await query('SELECT * FROM Coordinadores WHERE term_asignado = $1', [term]);
            // Permitimos coordinadores multiples? Asumamos que si por ahora o que se asigna null
            await query(
                'INSERT INTO Coordinadores (cedula_coordinador, term_asignado) VALUES ($1, $2)',
                [cedula, term]
            );
        }

        await query('COMMIT');

        // 4. Auto-Login
        const token = await signToken({
            cedula: cedula,
            rol: rol,
            nombre: `${nombres} ${apellidos}`
        });

        const cookieStore = await cookies();
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 8, // 8 horas
            path: '/'
        });

    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Registration Error:', error);
        return { success: false, error: 'Error al registrar usuario: ' + error.message };
    }

    redirect('/dashboard');
}
