
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function main() {
    const { query } = await import('../src/lib/db');

    try {
        // 1. Verificar si existe
        const term = '2025-15';
        const result = await query('SELECT * FROM Semestres WHERE term = $1', [term]);

        if (result.rows.length === 0) {
            console.log(`Creando semestre ${term}...`);
            await query(
                'INSERT INTO Semestres (term, fecha_inicio, fecha_final) VALUES ($1, $2, $3)',
                [term, '2024-10-01', '2025-02-28']
            );
            console.log('Semestre creado exitosamente.');
        } else {
            console.log(`El semestre ${term} ya existe.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

main();
