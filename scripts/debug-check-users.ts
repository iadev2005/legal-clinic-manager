
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.ENV' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const query = (text: string, params?: any[]) => pool.query(text, params);

async function checkUsers() {
    console.log('Checking users for Term: 2025-15');

    // 1. Check Professor Ignacio Aliendres
    // We search by name since we are not 100% sure of the cedula in the User Request text vs DB result
    console.log('\n--- Searching for Professor Ignacio Aliendres ---');
    const professor = await query(`
        SELECT u.cedula_usuario, u.nombres, u.apellidos, p.term 
        FROM Usuarios_Sistema u
        LEFT JOIN Profesores p ON u.cedula_usuario = p.cedula_profesor
        WHERE u.nombres ILIKE '%Ignacio%' AND u.apellidos ILIKE '%Aliendres%'
    `);
    console.log(professor.rows);

    // 2. Check Student Edmond Aliendres
    console.log('\n--- Searching for Student Edmond Aliendres ---');
    const student = await query(`
        SELECT u.cedula_usuario, u.nombres, u.apellidos, a.term 
        FROM Usuarios_Sistema u
        LEFT JOIN Alumnos a ON u.cedula_usuario = a.cedula_alumno
        WHERE u.nombres ILIKE '%Edmond%' AND u.apellidos ILIKE '%Aliendres%'
    `);
    console.log(student.rows);
}

(async () => {
    try {
        await checkUsers();
        alert('Check complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
