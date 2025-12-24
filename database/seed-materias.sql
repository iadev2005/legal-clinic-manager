-- ============================================================
-- 1. INSERTAR MATERIAS
-- ============================================================
INSERT INTO Materias (id_materia, nombre_materia) VALUES
(1, 'Materia Civil'),
(2, 'Materia Penal'),
(3, 'Materia Laboral'),
(4, 'Materia Mercantil'),
(5, 'Materia Administrativa'),
(6, 'Otros')
ON CONFLICT (id_materia) DO NOTHING;

-- ============================================================
-- 2. INSERTAR CATEGORÍAS
-- ============================================================
-- REGLA: 
-- CIVIL: Categoría 0 ("Sin Categoría") y 1 ("Familia").
-- RESTO: Todo a Categoría 0 ("Sin Categoría").

INSERT INTO Categorias (id_materia, num_categoria, nombre_categoria) VALUES
-- CIVIL
(1, 0, 'Sin Categoría'), 
(1, 1, 'Familia'),
-- RESTO
(2, 0, 'Sin Categoría'),
(3, 0, 'Sin Categoría'),
(4, 0, 'Sin Categoría'),
(5, 0, 'Sin Categoría'),
(6, 0, 'Sin Categoría')
ON CONFLICT (num_categoria, id_materia) DO NOTHING;

-- ============================================================
-- 3. INSERTAR SUBCATEGORÍAS
-- ============================================================

-- --- A) MATERIA CIVIL (ID 1) ---

-- BAJO "SIN CATEGORÍA" (0) -> Solo las generales de Civil
INSERT INTO Sub_Categorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria) VALUES
(1, 0, 1, 'Personas'),
(1, 0, 2, 'Bienes'),
(1, 0, 3, 'Contratos'),
(1, 0, 4, 'Sucesiones')
ON CONFLICT (num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- BAJO "FAMILIA" (1) -> Los Tribunales
INSERT INTO Sub_Categorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria) VALUES
(1, 1, 1, 'Tribunales Ordinarios'),
(1, 1, 2, 'Tribunales Protecc. Niños y Adolescentes')
ON CONFLICT (num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- B) RESTO DE MATERIAS (ID 2 al 6) ---
-- Usan "Sin Subcategoría" (0) para cumplir la jerarquía.
INSERT INTO Sub_Categorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria) VALUES
(2, 0, 0, 'Sin Subcategoría'), -- Penal
(3, 0, 0, 'Sin Subcategoría'), -- Laboral
(4, 0, 0, 'Sin Subcategoría'), -- Mercantil
(5, 0, 0, 'Sin Subcategoría'), -- Administrativa
(6, 0, 0, 'Sin Subcategoría') -- Otros
ON CONFLICT (num_subcategoria, num_categoria, id_materia) DO NOTHING;


-- ============================================================
-- 4. INSERTAR ÁMBITOS LEGALES (ITEMS)
-- ============================================================

-- --- 1. CIVIL -> PERSONAS ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(1, 0, 1, 1, 'Rectificación de Actas'),
(1, 0, 1, 2, 'Inserción de Actas'),
(1, 0, 1, 3, 'Solicitud de Naturalización'),
(1, 0, 1, 4, 'Justificativo de Soltería'),
(1, 0, 1, 5, 'Justificativo de Concubinato'),
(1, 0, 1, 6, 'Invitación al país'),
(1, 0, 1, 7, 'Justific. de Dependencia Económica / Pobreza'),
(1, 0, 1, 8, 'Declaración Jurada de No Poseer Vivienda'),
(1, 0, 1, 9, 'Declaración Jurada de Ingresos'),
(1, 0, 1, 10, 'Concubinato Postmortem'),
(1, 0, 1, 11, 'Declaración Jurada'),
(1, 0, 1, 12, 'Justificativo de Testigos')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 1. CIVIL -> BIENES ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(1, 0, 2, 1, 'Título Supletorio'),
(1, 0, 2, 2, 'Compra venta bienhechuría'),
(1, 0, 2, 3, 'Partición de comunidad ordinaria'),
(1, 0, 2, 4, 'Propiedad Horizontal'),
(1, 0, 2, 5, 'Cierre de Titularidad'),
(1, 0, 2, 6, 'Aclaratoria')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 1. CIVIL -> CONTRATOS ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(1, 0, 3, 1, 'Arrendamiento/Comodato'),
(1, 0, 3, 2, 'Compra-venta de bienes inmuebles'),
(1, 0, 3, 3, 'Compra-venta bienes muebles (vehículo)'),
(1, 0, 3, 4, 'Opción de Compra Venta'),
(1, 0, 3, 5, 'Finiquito de compra venta'),
(1, 0, 3, 6, 'Asociaciones / Fundaciones'),
(1, 0, 3, 7, 'Cooperativas'),
(1, 0, 3, 8, 'Poder'),
(1, 0, 3, 9, 'Cesión de derechos'),
(1, 0, 3, 10, 'Cobro de Bolívares'),                    
(1, 0, 3, 11, 'Constitución y liquidación de hipoteca'), 
(1, 0, 3, 12, 'Servicios/obras')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 1. CIVIL -> SUCESIONES ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(1, 0, 4, 1, 'Cesión de derechos sucesorales'),
(1, 0, 4, 2, 'Justificativo Únicos y Universales herederos'),
(1, 0, 4, 3, 'Testamento'),
(1, 0, 4, 4, 'Declaración Sucesoral'),
(1, 0, 4, 5, 'Partición de comunidad hereditaria')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 1. CIVIL -> FAMILIA -> TRIB. ORDINARIOS ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(1, 1, 1, 1, 'Divorcio por separación de hecho (185-A)'),
(1, 1, 1, 2, 'Separación de cuerpos (189)'),
(1, 1, 1, 3, 'Conversión de separación en divorcio'),
(1, 1, 1, 4, 'Divorcio contencioso'),
(1, 1, 1, 5, 'Partición de comunidad conyugal'),
(1, 1, 1, 6, 'Partición de comunidad concubinaria'),
(1, 1, 1, 7, 'Capitulaciones matrimoniales'),
(1, 1, 1, 8, 'Divorcio Causal No Taxativa Sentencias')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 1. CIVIL -> FAMILIA -> TRIB. PROTECCIÓN ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(1, 1, 2, 1, 'Divorcio por separación de hecho (185-A)'),
(1, 1, 2, 2, 'Separación de cuerpos (189)'),
(1, 1, 2, 3, 'Conversión de separación en divorcio'),
(1, 1, 2, 4, 'Divorcio contencioso'),
(1, 1, 2, 5, 'Reconocimiento Voluntario Hijo'),
(1, 1, 2, 6, 'Colocación familiar'),
(1, 1, 2, 7, 'Curatela'),
(1, 1, 2, 8, 'Medidas de protección (Identidad, salud, educación, otros)'),
(1, 1, 2, 9, 'Autorización para Viajar'),
(1, 1, 2, 10, 'Autorización para Vender'),
(1, 1, 2, 11, 'Autorización para Trabajar'),
(1, 1, 2, 12, 'Obligación de Manutención/Convivencia Familiar'),
(1, 1, 2, 13, 'Rectificación de Actas'),
(1, 1, 2, 14, 'Inserción de Actas'),
(1, 1, 2, 15, 'Carga Familiar'),
(1, 1, 2, 16, 'Cambio de Residencia'),
(1, 1, 2, 17, 'Ejercicio Unilateral de Patria Potestad'),
(1, 1, 2, 18, 'Divorcio causal No Taxativa Sentencias'),
(1, 1, 2, 19, 'Tutela')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 2. PENAL -> SIN CAT -> SIN SUBCAT -> ITEMS ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(2, 0, 0, 1, 'Delitos Contra la Propiedad'),
(2, 0, 0, 2, 'Delitos Contra las Personas'),
(2, 0, 0, 3, 'Contra las Buenas Costumbres'),
(2, 0, 0, 4, 'Delitos contra el Honor'),
(2, 0, 0, 5, 'Violencia Doméstica')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 3. LABORAL -> SIN CAT -> SIN SUBCAT -> ITEMS ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(3, 0, 0, 1, 'Calificación de Despido'),
(3, 0, 0, 2, 'Prestaciones Sociales'),
(3, 0, 0, 3, 'Contratos de Trabajo'),
(3, 0, 0, 4, 'Accidentes de Trabajo'),
(3, 0, 0, 5, 'Incapacidad laboral'),
(3, 0, 0, 6, 'Terminación de Relación Laboral')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 4. MERCANTIL -> SIN CAT -> SIN SUBCAT -> ITEMS ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(4, 0, 0, 1, 'Firma Personal'),
(4, 0, 0, 2, 'Constitución de Compañías'),
(4, 0, 0, 3, 'Actas de Asamblea'),
(4, 0, 0, 4, 'Compra Venta de Fondo de Comercio / Acciones'),
(4, 0, 0, 5, 'Letras de Cambio')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 5. ADMINISTRATIVA -> SIN CAT -> SIN SUBCAT -> ITEMS ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(5, 0, 0, 1, 'Recursos Administrativos')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;

-- --- 6. OTROS -> SIN CAT -> SIN SUBCAT -> ITEMS ---
INSERT INTO Ambitos_Legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES
(6, 0, 0, 1, 'Convivencia Ciudadana'),
(6, 0, 0, 2, 'Derechos Humanos'),
(6, 0, 0, 3, 'Tránsito'),
(6, 0, 0, 4, 'Otros'),
(6, 0, 0, 5, 'Diligencias Seguimiento')
ON CONFLICT (num_ambito_legal, num_subcategoria, num_categoria, id_materia) DO NOTHING;
