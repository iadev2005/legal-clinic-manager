
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function main() {
    const { query } = await import('../src/lib/db');

    try {
        const result = await query('SELECT * FROM Semestres');
        console.log('Semestres encontrados:', result.rows.length);
        console.table(result.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

main();
