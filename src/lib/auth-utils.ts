
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'secret-key-change-me-in-production';
const KEY = new TextEncoder().encode(SECRET_KEY);

export interface UserSession extends JWTPayload {
    nombre: string;
    rol: string;
    cedula?: string;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h') // Sesión dura 8 horas
        .sign(KEY);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
    try {
        const { payload } = await jwtVerify(token, KEY);
        return payload as UserSession;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    return await verifyToken(session);
}
