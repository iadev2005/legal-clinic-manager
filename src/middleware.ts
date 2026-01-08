
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';

const protectedRoutes = ['/dashboard', '/cases', '/applicants', '/citations', '/statistics', '/administration'];
const adminRoles = ['Profesor', 'Coordinador', 'Administrador'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Verificar si la ruta es protegida (empieza con...)
    const isProtected = protectedRoutes.some((route) => path.startsWith(route));

    if (isProtected) {
        const cookie = request.cookies.get('session')?.value;

        if (!cookie) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const session = await verifyToken(cookie);
        if (!session) {
            // Token inválido o expirado
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session');
            return response;
        }

        // Restricción de acceso a administración
        if (path.startsWith('/administration')) {
            if (!adminRoles.includes(session.rol)) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    // Redirigir al dashboard si ya está logueado e intenta ir al login
    if (path === '/login') {
        const cookie = request.cookies.get('session')?.value;
        if (cookie) {
            const session = await verifyToken(cookie);
            if (session) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/cases/:path*',
        '/applicants/:path*',
        '/citations/:path*',
        '/statistics/:path*',
        '/administration/:path*',
        '/login'
    ],
};
