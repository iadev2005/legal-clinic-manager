import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env file in root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: (process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1'))
        ? false
        : { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Checking for "direccion" column in "Solicitantes" table...');

        const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='solicitantes' AND column_name='direccion';
    `);

        if (checkRes.rows.length === 0) {
            console.log('Column "direccion" does not exist. Adding it...');
            await client.query(`
        ALTER TABLE Solicitantes 
        ADD COLUMN direccion TEXT;
      `);
            console.log('Column "direccion" added successfully.');
        } else {
            console.log('Column "direccion" already exists. No action needed.');
        }

    } catch (err) {
        console.error('Error running migration:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
