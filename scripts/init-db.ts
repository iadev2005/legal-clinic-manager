import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../src/lib/db';

async function initDatabase() {
    try {
        console.log('🔌 Conectando a la base de datos Neon...');

        // Leer el archivo schema.sql
        const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        console.log('📄 Ejecutando schema.sql...');

        // Ejecutar el schema completo
        await pool.query(schema);

        console.log('✅ Base de datos inicializada correctamente!');

        // Verificar que las tablas se crearon
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log(`\n📊 Tablas creadas (${result.rows.length}):`);
        result.rows.forEach((row: any) => {
            console.log(`   - ${row.table_name}`);
        });

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initDatabase();
