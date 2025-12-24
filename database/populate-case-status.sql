-- Script para poblar la tabla Se_Le_Adjudican con estados iniciales para casos existentes
-- Este script asigna un estado inicial a todos los casos que no tienen registro en Se_Le_Adjudican

DO $$
DECLARE
    id_estatus_proceso INTEGER;
    id_usuario_sistema VARCHAR(20);
BEGIN
    -- Obtener el ID del estatus "En proceso" (estado por defecto)
    SELECT id_estatus INTO id_estatus_proceso 
    FROM Estatus 
    WHERE nombre_estatus = 'En proceso' 
    LIMIT 1;

    -- Obtener un usuario del sistema para asignar como responsable del cambio
    -- (Usamos el primer coordinador o administrador disponible)
    SELECT cedula_usuario INTO id_usuario_sistema 
    FROM Usuarios_Sistema 
    WHERE rol IN ('Coordinador', 'Administrador') 
    LIMIT 1;

    -- Si no hay usuarios, usar NULL
    IF id_usuario_sistema IS NULL THEN
        id_usuario_sistema := NULL;
    END IF;

    -- Insertar registros en Se_Le_Adjudican para todos los casos que no tienen estado
    INSERT INTO Se_Le_Adjudican (id_caso, id_estatus, cedula_usuario, motivo, fecha_registro)
    SELECT 
        c.nro_caso,
        id_estatus_proceso,
        id_usuario_sistema,
        'Estado inicial asignado automáticamente',
        c.fecha_caso_inicio -- Usar la fecha de inicio del caso como fecha de registro
    FROM Casos c
    WHERE NOT EXISTS (
        SELECT 1 
        FROM Se_Le_Adjudican sla 
        WHERE sla.id_caso = c.nro_caso
    );

    -- Mostrar cuántos registros se insertaron
    RAISE NOTICE 'Se asignaron estados iniciales a % casos', 
        (SELECT COUNT(*) FROM Casos c WHERE NOT EXISTS (
            SELECT 1 FROM Se_Le_Adjudican sla WHERE sla.id_caso = c.nro_caso
        ));

END $$;

-- Verificar los resultados
SELECT 
    e.nombre_estatus, 
    COUNT(*)::int as cantidad_casos
FROM Se_Le_Adjudican sla
JOIN Estatus e ON sla.id_estatus = e.id_estatus
GROUP BY e.nombre_estatus
ORDER BY cantidad_casos DESC;
