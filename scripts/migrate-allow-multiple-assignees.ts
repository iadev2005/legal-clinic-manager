import { Pool } from 'pg';
import dotenv from 'dotenv';
// Cargar variables de entorno explícitamente desde la raíz
dotenv.config({ path: '.ENV' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const query = (text: string, params?: any[]) => pool.query(text, params);

/**
 * Migration: Allow Multiple Assignees
 * 
 * This script drops the unique indexes that restrict cases to having only 
 * one active student and one active professor at a time.
 * 
 * Indexes to drop:
 * - idx_asignacion_unica_activa (Table: Se_Asignan)
 * - idx_supervision_unica_activa (Table: Supervisan)
 */

async function migrate() {
    console.log('Iniciando migración para permitir múltiples asignaciones...');

    // Test connection
    try {
        await query('SELECT NOW()');
        console.log('Conexión a BD exitosa.');
    } catch (e) {
        console.error('Error conectando a BD:', e);
        process.exit(1);
    }

    try {
        // 1. Eliminar restricción de único estudiante activo
        console.log('Eliminando índice idx_asignacion_unica_activa...');
        await query('DROP INDEX IF EXISTS idx_asignacion_unica_activa');
        console.log('✓ Índice idx_asignacion_unica_activa eliminado.');

        // 2. Eliminar restricción de único profesor activo (opcional, pero consistente)
        console.log('Eliminando índice idx_supervision_unica_activa...');
        await query('DROP INDEX IF EXISTS idx_supervision_unica_activa');
        console.log('✓ Índice idx_supervision_unica_activa eliminado.');

        console.log('Migración completada exitosamente.');
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

// Ejecutar migración
// Import dinámico de db para asegurar que dotenv cargue primero si es necesario
// aunque aquí ya lo importé arriba, el patrón seguro es este:
(async () => {
    try {
        await migrate();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
