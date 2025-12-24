/**
 * Script to populate Se_Le_Adjudican table with initial status for existing cases
 * Run with: pnpm tsx scripts/populate-case-status.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const query = (text: string, params?: any[]) => pool.query(text, params);

async function populateCaseStatus() {
    try {
        console.log('🔍 Checking current state...\n');

        // Check how many cases exist
        const casesResult = await query('SELECT COUNT(*) as total FROM Casos');
        const totalCases = parseInt(casesResult.rows[0].total);
        console.log(`📊 Total cases in database: ${totalCases}`);

        // Check how many status records exist
        const statusResult = await query('SELECT COUNT(*) as total FROM Se_Le_Adjudican');
        const totalStatusRecords = parseInt(statusResult.rows[0].total);
        console.log(`📊 Total status records: ${totalStatusRecords}\n`);

        if (totalCases === 0) {
            console.log('⚠️  No cases found in database. Nothing to populate.');
            return;
        }

        console.log('🚀 Starting population process...\n');

        // Execute the population script
        const result = await query(`
            DO $$
            DECLARE
                id_estatus_proceso INTEGER;
                id_usuario_sistema VARCHAR(20);
                casos_actualizados INTEGER := 0;
            BEGIN
                -- Get "En proceso" status ID
                SELECT id_estatus INTO id_estatus_proceso 
                FROM Estatus 
                WHERE nombre_estatus = 'En proceso' 
                LIMIT 1;

                -- Get a system user (coordinator or admin)
                SELECT cedula_usuario INTO id_usuario_sistema 
                FROM Usuarios_Sistema 
                WHERE rol IN ('Coordinador', 'Administrador') 
                LIMIT 1;

                -- Insert status records for cases without status
                INSERT INTO Se_Le_Adjudican (id_caso, id_estatus, cedula_usuario, motivo, fecha_registro)
                SELECT 
                    c.nro_caso,
                    id_estatus_proceso,
                    id_usuario_sistema,
                    'Estado inicial asignado automáticamente',
                    c.fecha_caso_inicio
                FROM Casos c
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM Se_Le_Adjudican sla 
                    WHERE sla.id_caso = c.nro_caso
                );

                GET DIAGNOSTICS casos_actualizados = ROW_COUNT;
                RAISE NOTICE 'Casos actualizados: %', casos_actualizados;
            END $$;
        `);

        console.log('✅ Population completed!\n');

        // Verify results
        console.log('📊 Verification - Status distribution:\n');
        const verification = await query(`
            SELECT 
                e.nombre_estatus as status, 
                COUNT(*)::int as count
            FROM Se_Le_Adjudican sla
            JOIN Estatus e ON sla.id_estatus = e.id_estatus
            GROUP BY e.nombre_estatus
            ORDER BY count DESC
        `);

        verification.rows.forEach(row => {
            console.log(`   ${row.status}: ${row.count} cases`);
        });

        console.log('\n✨ Done! The case status chart should now display data.');
        console.log('   Refresh http://localhost:3000/statistics to see the changes.\n');

    } catch (error) {
        console.error('❌ Error populating case status:', error);
        throw error;
    } finally {
        await pool.end();
        process.exit(0);
    }
}

// Run the script
populateCaseStatus();
