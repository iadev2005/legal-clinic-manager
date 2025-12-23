import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../src/lib/db';

async function seedBolivar() {
    try {
        console.log('🌱 Cargando datos geográficos del Estado Bolívar...');

        // Leer el archivo seed-bolivar.sql
        const seedPath = join(__dirname, '..', 'database', 'seed-bolivar.sql');
        const seedSQL = readFileSync(seedPath, 'utf-8');

        console.log('📄 Ejecutando seed-bolivar.sql...');

        // Ejecutar el seed
        await pool.query(seedSQL);

        console.log('✅ Datos cargados correctamente!');

        // Verificar los datos insertados
        const estadoResult = await pool.query(`SELECT * FROM Estados WHERE nombre_estado = 'Bolívar'`);
        const municipiosResult = await pool.query(`
      SELECT m.* FROM Municipios m
      JOIN Estados e ON m.id_estado = e.id_estado
      WHERE e.nombre_estado = 'Bolívar'
      ORDER BY m.nombre_municipio
    `);
        const parroquiasResult = await pool.query(`
      SELECT COUNT(*) as total FROM Parroquias p
      JOIN Municipios m ON p.id_municipio = m.id_municipio
      JOIN Estados e ON m.id_estado = e.id_estado
      WHERE e.nombre_estado = 'Bolívar'
    `);

        console.log(`\n📊 Resumen:`);
        console.log(`   - Estado: ${estadoResult.rows[0]?.nombre_estado || 'N/A'}`);
        console.log(`   - Municipios: ${municipiosResult.rows.length}`);
        console.log(`   - Parroquias: ${parroquiasResult.rows[0]?.total || 0}`);

        console.log(`\n📍 Municipios cargados:`);
        municipiosResult.rows.forEach((m: any) => {
            console.log(`   - ${m.nombre_municipio}`);
        });

    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedBolivar();
