const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function updateSchema() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Update Parentesco Constraint
        console.log('Updating parentesco constraint...');
        // First, check if there are invalid values and specificy what to do? 
        // Assuming development or empty/compliant DB. If data exists with other values, this will fail.
        // The user said "subir al server...".

        // We try to drop if exists first (though schema.sql didn't have it before, maybe manual edits did?)
        // Actually, schema.sql had no constraint. So we just add it.
        // But if we run this multiple times, it fails. So DROP IF EXISTS is good.
        await client.query(`
      ALTER TABLE Beneficiarios DROP CONSTRAINT IF EXISTS chk_parentesco;
    `);

        // To be safe against existing data violation, we could update invalid values to 'N' or similar, 
        // but that's destructive. I'll let it fail if there's data violation and log it.
        await client.query(`
      ALTER TABLE Beneficiarios 
      ADD CONSTRAINT chk_parentesco CHECK (parentesco IN ('S', 'N'));
    `);
        console.log('Parentesco constraint updated.');

        // 2. Update Not Nulls in Viviendas
        const notNullColumns = [
            'material_piso',
            'material_paredes',
            'material_techo',
            'agua_potable',
            'eliminacion_aguas',
            'aseo_urbano'
        ];

        console.log('Updating Not Null constraints in Viviendas...');
        for (const col of notNullColumns) {
            // SET NOT NULL
            await client.query(`
        ALTER TABLE Viviendas ALTER COLUMN ${col} SET NOT NULL;
      `);
            console.log(`Set ${col} to NOT NULL.`);
        }

        console.log('All schema updates applied successfully.');
    } catch (err) {
        console.error('Error applying schema updates:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
