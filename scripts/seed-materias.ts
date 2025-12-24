const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function seed() {
    try {
        console.log('🌱 Iniciando seed de Materias y Categorías...');

        const seedPath = path.join(__dirname, '../database/seed-materias.sql');
        const sql = fs.readFileSync(seedPath, 'utf8');

        console.log('📖 Leyendo archivo SQL...');

        await pool.query('BEGIN');

        // Ejecutar el script SQL
        await pool.query(sql);

        await pool.query('COMMIT');

        console.log('✅ Base de datos poblada exitosamente con Materias y Ámbitos.');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error al ejecutar el seed:', error);
    } finally {
        await pool.end();
    }
}

seed();
