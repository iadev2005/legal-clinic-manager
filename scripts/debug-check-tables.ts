
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.ENV' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const query = (text: string, params?: any[]) => pool.query(text, params);

async function checkTables() {
    console.log('--- Checking for Tables ---');

    // Check if Notificaciones or "Notificaciones" exists
    try {
        const res = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('Tables in DB:', res.rows.map(r => r.table_name));

        const notificationTable = res.rows.find(r => r.table_name.toLowerCase() === 'notificaciones');
        if (notificationTable) {
            console.log(`\nTable '${notificationTable.table_name}' FOUND.`);
        } else {
            console.log('\nTable Notificaciones NOT FOUND.');
        }

    } catch (e) {
        console.error('Error querying information_schema:', e);
    }
}

(async () => {
    try {
        await checkTables();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
