import "dotenv/config";
import { query } from "../src/lib/db";

async function createAuditTable() {
  console.log("Creating Auditoria_Casos_Eliminados table...");
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS Auditoria_Casos_Eliminados (
        id_auditoria SERIAL PRIMARY KEY,
        nro_caso_original INTEGER,
        cedula_responsable VARCHAR(20),
        nombre_responsable VARCHAR(100),
        rol_responsable VARCHAR(50),
        fecha_eliminacion TIMESTAMP DEFAULT NOW(),
        motivo TEXT
      );
    `);
    console.log("Table created successfully (or already existed).");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

createAuditTable();
