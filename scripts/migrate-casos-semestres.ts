
import * as dotenv from 'dotenv';
dotenv.config({ path: '.ENV' });

async function migrate() {
  console.log('Iniciando migración de Casos_Semestres...');
  // Dynamic import to ensure process.env is populated before db is initialized
  const { query } = await import('../src/lib/db');

  try {
    // 1. Crear la tabla Casos_Semestres
    console.log('Creando tabla Casos_Semestres...');
    await query(`
      CREATE TABLE IF NOT EXISTS Casos_Semestres (
        id_caso_semestre SERIAL PRIMARY KEY,
        nro_caso INTEGER NOT NULL REFERENCES Casos(nro_caso),
        term VARCHAR(10) NOT NULL REFERENCES Semestres(term),
        id_estatus INTEGER NOT NULL REFERENCES Estatus(id_estatus),
        cedula_usuario VARCHAR(20) REFERENCES Usuarios_Sistema(cedula_usuario),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(nro_caso, term)
      );
    `);

    // 2. Poblar datos iniciales basados en asignaciones ACTIVAS (Se_Asignan y Supervisan)
    console.log('Poblando Casos_Semestres desde asignaciones activas...');

    // Obtener casos con asignaciones activas y su estatus actual calculado
    await query(`
      INSERT INTO Casos_Semestres (nro_caso, term, id_estatus, cedula_usuario)
      SELECT DISTINCT 
        sa.id_caso, 
        sa.term, 
        (
            -- Obtener el último estatus registrado para el caso, o 'En Proceso' por defecto
            COALESCE(
                (SELECT id_estatus FROM Se_Le_Adjudican sla WHERE sla.id_caso = sa.id_caso ORDER BY fecha_registro DESC LIMIT 1),
                (SELECT id_estatus FROM Estatus WHERE nombre_estatus = 'En proceso' LIMIT 1)
            )
        ) as id_estatus,
        NULL -- No tenemos usuario específico de modificación para esta migración automática
      FROM Se_Asignan sa
      WHERE sa.estatus = 'Activo'
      ON CONFLICT (nro_caso, term) DO NOTHING;
    `);

    // También para Supervisan (profesores) por si hay casos solo con profesor
    await query(`
      INSERT INTO Casos_Semestres (nro_caso, term, id_estatus, cedula_usuario)
      SELECT DISTINCT 
        sv.id_caso, 
        sv.term, 
        (
            COALESCE(
                (SELECT id_estatus FROM Se_Le_Adjudican sla WHERE sla.id_caso = sv.id_caso ORDER BY fecha_registro DESC LIMIT 1),
                (SELECT id_estatus FROM Estatus WHERE nombre_estatus = 'En proceso' LIMIT 1)
            )
        ) as id_estatus,
        NULL
      FROM Supervisan sv
      WHERE sv.estatus = 'Activo'
      ON CONFLICT (nro_caso, term) DO NOTHING;
    `);

    console.log('Migración completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

migrate();
