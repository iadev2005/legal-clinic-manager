
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno explícitamente desde la raíz
dotenv.config({ path: '.ENV' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const query = (text: string, params?: any[]) => pool.query(text, params);

/**
 * Migration: Create Notificaciones Tables
 * 
 * Creates:
 * - Notificaciones
 * - Notificaciones_Usuarios
 */

async function migrate() {
    console.log('Iniciando migración para crear tablas de Notificaciones...');

    try {
        // 1. Crear tabla Notificaciones
        await query(`
      CREATE TABLE IF NOT EXISTS Notificaciones (
        id_notificacion SERIAL PRIMARY KEY,
        descripcion TEXT NOT NULL,
        fecha_notificacion TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
        console.log('✓ Tabla Notificaciones creada (o ya existía).');

        // 2. Crear índice en Notificaciones
        await query(`
      CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha 
      ON Notificaciones (fecha_notificacion DESC)
    `);
        console.log('✓ Índice idx_notificaciones_fecha creado.');

        // 3. Crear tabla Notificaciones_Usuarios
        await query(`
      CREATE TABLE IF NOT EXISTS Notificaciones_Usuarios (
        id_notificacion INTEGER NOT NULL REFERENCES Notificaciones(id_notificacion) ON DELETE CASCADE,
        cedula_usuario VARCHAR(20) NOT NULL REFERENCES Usuarios_Sistema(cedula_usuario) ON DELETE CASCADE,
        revisado BOOLEAN DEFAULT FALSE NOT NULL,
        fecha_revision TIMESTAMP,
        PRIMARY KEY (id_notificacion, cedula_usuario)
      )
    `);
        console.log('✓ Tabla Notificaciones_Usuarios creada (o ya existía).');

        // 4. Crear índice en Notificaciones_Usuarios
        await query(`
      CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_revisado 
      ON Notificaciones_Usuarios (cedula_usuario, revisado) 
      WHERE revisado = FALSE
    `);
        console.log('✓ Índice idx_notificaciones_usuario_revisado creado.');

        console.log('Migración completada exitosamente.');
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

(async () => {
    try {
        await migrate();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
