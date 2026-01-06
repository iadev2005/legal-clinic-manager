
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.ENV' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const query = (text: string, params?: any[]) => pool.query(text, params);

async function cleanup() {
    console.log('Iniciando limpieza de supervisores duplicados...');

    try {
        // Identificar duplicados: (id_caso, term) con > 1 registro Activo
        const duplicates = await query(`
        SELECT id_caso, term, COUNT(*) as cnt
        FROM Supervisan
        WHERE estatus = 'Activo'
        GROUP BY id_caso, term
        HAVING COUNT(*) > 1
    `);

        console.log(`Casos con duplicados encontrados: ${duplicates.rows.length}`);

        for (const row of duplicates.rows) {
            console.log(`Procesando Caso ${row.id_caso} - Term ${row.term} (${row.cnt} registros)...`);

            // Obtener los ids, ordenados por id_supervision DESC (el más reciente es el mayor id, generalmente)
            // O mejor, borrar todos EXCEPTO el último
            const ids = await query(`
            SELECT id_supervision 
            FROM Supervisan
            WHERE id_caso = $1 AND term = $2 AND estatus = 'Activo'
            ORDER BY id_supervision DESC
        `, [row.id_caso, row.term]);

            // Keep the first one (most recent), delete/deactivate others
            const [keep, ...remove] = ids.rows;

            if (remove.length > 0) {
                const idsToRemove = remove.map(r => r.id_supervision);
                console.log(`Manteniendo ${keep.id_supervision}, desactivando: ${idsToRemove.join(', ')}`);

                await query(`
                UPDATE Supervisan
                SET estatus = 'Inactivo'
                WHERE id_supervision = ANY($1::int[])
            `, [idsToRemove]);
            }
        }

        console.log('Limpieza completada.');

        // Ahora restaurar el UNIQUE INDEX para prevenir futuro caos
        console.log('Creando índice único idx_supervision_unica_activa_term...');
        await query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_supervision_unica_activa_term 
        ON Supervisan (id_caso, term) WHERE (estatus = 'Activo');
    `);
        console.log('✓ Índice creado.');

    } catch (error) {
        console.error('Error durante la limpieza:', error);
        process.exit(1);
    }
}

(async () => {
    try {
        await cleanup();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
