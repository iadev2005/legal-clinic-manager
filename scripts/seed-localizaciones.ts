const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function seed() {
    try {
        console.log('🌱 Iniciando seed de Localizaciones (Estados, Municipios, Parroquias)...');

        const seedPath = path.join(__dirname, '../database/seed-localizaciones.sql');

        // Check if file exists
        if (!fs.existsSync(seedPath)) {
            console.error('❌ No se encontró el archivo seed-localizaciones.sql');
            return;
        }

        const sql = fs.readFileSync(seedPath, 'utf-8');

        console.log('📖 Leyendo archivo SQL (esto puede tardar un poco)...');

        await pool.query('BEGIN');
        await pool.query(sql);
        await pool.query('COMMIT');

        console.log('✅ Localizaciones cargadas exitosamente.');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error al ejecutar el seed:', error);
    } finally {
        await pool.end();
    }
}

seed();
