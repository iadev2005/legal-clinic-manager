'use server';

import { query } from '@/lib/db';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const cedula = formData.get('cedula') as string;
    const password = formData.get('password') as string;

    if (!cedula || !password) {
        return { success: false, error: 'Por favor complete todos los campos' };
    }

    try {
        // 1. Buscar usuario en BD
        const result = await query(
            'SELECT * FROM Usuarios_Sistema WHERE cedula_usuario = $1',
            [cedula]
        );

        const user = result.rows[0];

        if (!user) {
            return { success: false, error: 'Credenciales inválidas' };
        }

        if (!user.activo) {
            return { success: false, error: 'Usuario inactivo. Contacte al administrador.' };
        }

        // 2. Verificar contraseña
        // Casos especiales para migración o usuarios antiguos sin hash
        const isValid = await verifyPassword(password, user.contrasena_hash);

        if (!isValid) {
            return { success: false, error: 'Credenciales inválidas' };
        }

        // 3. Crear Sesión
        const token = await signToken({
            cedula: user.cedula_usuario,
            rol: user.rol,
            nombre: `${user.nombres} ${user.apellidos}`
        });

        const cookieStore = await cookies();
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 8, // 8 horas
            path: '/'
        });

    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Error interno del servidor' };
    }

    // Redirección fuera del try-catch para evitar que Next.js la capture como error
    redirect('/dashboard');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    redirect('/login');
}

export async function updatePassword(cedula: string, currentPass: string, newPass: string) {
    if (!cedula || !currentPass || !newPass) {
        return { error: 'Faltan datos requeridos' };
    }

    try {
        // 1. Obtener usuario para verificar contraseña actual
        const result = await query(
            'SELECT contrasena_hash FROM Usuarios_Sistema WHERE cedula_usuario = $1',
            [cedula]
        );

        const user = result.rows[0];
        if (!user) return { error: 'Usuario no encontrado' };

        // 2. Verificar contraseña actual
        const isValid = await verifyPassword(currentPass, user.contrasena_hash);
        if (!isValid) return { error: 'Contraseña actual incorrecta' };

        // 3. Hash nueva contraseña
        const newHash = await hashPassword(newPass);

        // 4. Actualizar BD
        await query(
            'UPDATE Usuarios_Sistema SET contrasena_hash = $1 WHERE cedula_usuario = $2',
            [newHash, cedula]
        );

        return { success: true };

    } catch (error) {
        console.error('Update password error:', error);
        return { error: 'Error al actualizar contraseña' };
    }
}
