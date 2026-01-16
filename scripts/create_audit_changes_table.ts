import "dotenv/config";
import { query } from "../src/lib/db";

async function createAuditTables() {
  console.log("Creating specialized audit tables...");
  try {
    // Auditoria_Usuarios
    console.log("Creating Auditoria_Usuarios...");
    await query(`
      CREATE TABLE IF NOT EXISTS Auditoria_Usuarios (
        id_auditoria SERIAL PRIMARY KEY,
        cedula_usuario_modificado VARCHAR(20) NOT NULL,
        campo_modificado VARCHAR(50) NOT NULL,
        valor_anterior TEXT,
        valor_nuevo TEXT,
        cedula_responsable VARCHAR(20),
        nombre_responsable VARCHAR(100),
        fecha_cambio TIMESTAMP DEFAULT NOW()
      );
    `);

    // Auditoria_Solicitantes
    console.log("Creating Auditoria_Solicitantes...");
    await query(`
      CREATE TABLE IF NOT EXISTS Auditoria_Solicitantes (
        id_auditoria SERIAL PRIMARY KEY,
        cedula_solicitante_modificado VARCHAR(20) NOT NULL,
        campo_modificado VARCHAR(50) NOT NULL,
        valor_anterior TEXT,
        valor_nuevo TEXT,
        cedula_responsable VARCHAR(20),
        nombre_responsable VARCHAR(100),
        fecha_cambio TIMESTAMP DEFAULT NOW()
      );
    `);

    // Auditoria_Casos
    console.log("Creating Auditoria_Casos...");
    await query(`
      CREATE TABLE IF NOT EXISTS Auditoria_Casos (
        id_auditoria SERIAL PRIMARY KEY,
        nro_caso INTEGER NOT NULL,
        tipo_entidad VARCHAR(50) NOT NULL,
        id_entidad VARCHAR(50),
        campo_modificado VARCHAR(50) NOT NULL,
        valor_anterior TEXT,
        valor_nuevo TEXT,
        cedula_responsable VARCHAR(20),
        nombre_responsable VARCHAR(100),
        fecha_cambio TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Creating indexes...");

    // Índices Auditoria_Usuarios
    await query(`CREATE INDEX IF NOT EXISTS idx_auditoria_usuarios_cedula ON Auditoria_Usuarios (cedula_usuario_modificado);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auditoria_usuarios_fecha ON Auditoria_Usuarios (fecha_cambio DESC);`);

    // Índices Auditoria_Solicitantes
    await query(`CREATE INDEX IF NOT EXISTS idx_auditoria_solicitantes_cedula ON Auditoria_Solicitantes (cedula_solicitante_modificado);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auditoria_solicitantes_fecha ON Auditoria_Solicitantes (fecha_cambio DESC);`);

    // Índices Auditoria_Casos
    await query(`CREATE INDEX IF NOT EXISTS idx_auditoria_casos_nro_caso ON Auditoria_Casos (nro_caso);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auditoria_casos_tipo ON Auditoria_Casos (tipo_entidad);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_auditoria_casos_fecha ON Auditoria_Casos (fecha_cambio DESC);`);

    console.log("✅ All audit tables and indexes created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
}

createAuditTables();
