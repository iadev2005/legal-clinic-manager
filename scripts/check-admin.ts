
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function main() {
    const { query } = await import('../src/lib/db');

    try {
        const result = await query('SELECT * FROM Usuarios_Sistema WHERE correo_electronico = $1', ['admin@ucab.edu.ve']);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('Usuario Admin encontrado:');
            console.log(`Cedula: ${user.cedula_usuario}`);
            console.log(`Email: ${user.correo_electronico}`);
            console.log(`Rol: ${user.rol}`);
            console.log(`Hash: ${user.contrasena_hash.substring(0, 10)}... (Existe)`);
        } else {
            console.log('No se encontró usuario con ese correo.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

main();
