/* ==========================================================================
   ARQUITECTURA DE BASE DE DATOS: CLÍNICA JURÍDICA UCAB
   Versión: 1.0 (Release Candidate)
   Autor: DBA Senior & Profesor Titular
   ========================================================================== */

-- Limpieza preventiva (Solo en desarrollo)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

/* ==========================================================================
   MÓDULO D: CATÁLOGOS GEOGRÁFICOS Y SOCIOECONÓMICOS (Tablas Base)
   ========================================================================== */

-- Tabla 12
CREATE TABLE Estados (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla 13
CREATE TABLE Municipios (
    id_municipio SERIAL PRIMARY KEY,
    nombre_municipio VARCHAR(100) NOT NULL,
    id_estado INTEGER NOT NULL REFERENCES Estados(id_estado)
);

-- Tabla 14
CREATE TABLE Parroquias (
    id_parroquia SERIAL PRIMARY KEY,
    nombre_parroquia VARCHAR(100) NOT NULL,
    id_municipio INTEGER NOT NULL REFERENCES Municipios(id_municipio)
);

-- Tabla 3
CREATE TABLE Nucleos (
    id_nucleo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_parroquia INTEGER REFERENCES Parroquias(id_parroquia) -- Opcional según lógica futura
);

-- Carga Inicial Núcleos
INSERT INTO Nucleos (nombre) VALUES ('Casa Barandi'), ('UCAB Guayana');

-- Tabla 10
CREATE TABLE Niveles_Educativos (
    id_nivel_educativo SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

INSERT INTO Niveles_Educativos (descripcion) VALUES 
('Sin instrucción'), ('Básica'), ('Media'), ('Diversificada'), ('Técnica Superior'), ('Superior'), ('Post-grado');

-- Tabla 11
CREATE TABLE Trabajos (
    id_trabajo SERIAL PRIMARY KEY,
    condicion_trabajo VARCHAR(50) NOT NULL
);

INSERT INTO Trabajos (condicion_trabajo) VALUES 
('Patrono'), ('Empleado'), ('Obrero'), ('Cuenta propia'), ('Desempleado');

-- Tabla 15
CREATE TABLE Actividades_Solicitantes (
    id_actividad_solicitante SERIAL PRIMARY KEY,
    condicion_actividad VARCHAR(50) NOT NULL
);

INSERT INTO Actividades_Solicitantes (condicion_actividad) VALUES 
('Ama de Casa'), ('Estudiante'), ('Pensionado'), ('Jubilado'), ('Otra');

-- Tabla 27 (Corregida numeración)
CREATE TABLE Bienes (
    id_bien SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

INSERT INTO Bienes (descripcion) VALUES 
('Nevera'), ('Lavadora'), ('Computadora'), ('Carro'), ('Moto'), ('Televisor'), ('Cocina'), ('Aire Acondicionado');

/* ==========================================================================
   MÓDULO B: CLASIFICACIÓN LEGAL (Jerarquía Matrioska)
   ========================================================================== */

-- Tabla 31 (Materias)
CREATE TABLE Materias (
    id_materia SERIAL PRIMARY KEY,
    nombre_materia VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO Materias (nombre_materia) VALUES 
('Civil'), ('Laboral'), ('Mercantil'), ('Penal'), ('LOPNNA'), ('Violencia contra la Mujer');

-- Tabla 23 (Categorías - Entidad Débil)
CREATE TABLE Categorias (
    num_categoria SERIAL,
    id_materia INTEGER NOT NULL REFERENCES Materias(id_materia),
    nombre_categoria VARCHAR(150) NOT NULL,
    PRIMARY KEY (num_categoria, id_materia) -- PK Compuesta
);

-- Tabla 24 (Sub Categorías - Entidad Débil de Nivel 2)
CREATE TABLE Sub_Categorias (
    num_subcategoria SERIAL,
    num_categoria INTEGER NOT NULL,
    id_materia INTEGER NOT NULL,
    nombre_subcategoria VARCHAR(150) NOT NULL,
    PRIMARY KEY (num_subcategoria, num_categoria, id_materia),
    FOREIGN KEY (num_categoria, id_materia) REFERENCES Categorias(num_categoria, id_materia)
);

-- Tabla 4 (Ámbitos Legales - Entidad Débil de Nivel 3)
CREATE TABLE Ambitos_Legales (
    num_ambito_legal SERIAL,
    num_subcategoria INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    id_materia INTEGER NOT NULL,
    nombre_ambito_legal VARCHAR(200) NOT NULL,
    PRIMARY KEY (num_ambito_legal, num_subcategoria, num_categoria, id_materia),
    FOREIGN KEY (num_subcategoria, num_categoria, id_materia) REFERENCES Sub_Categorias(num_subcategoria, num_categoria, id_materia)
);

/* ==========================================================================
   MÓDULO C: SOLICITANTES Y SOCIOECONOMÍA
   ========================================================================== */

-- Tabla 7
CREATE TABLE Solicitantes (
    cedula_solicitante VARCHAR(20) PRIMARY KEY, -- Alfanumérico por si es pasaporte
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono_local VARCHAR(20),
    telefono_celular VARCHAR(20) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    nacionalidad CHAR(1) NOT NULL CHECK (nacionalidad IN ('V', 'E')),
    estado_civil VARCHAR(20) NOT NULL CHECK (estado_civil IN ('Soltero', 'Casado', 'Divorciado', 'Viudo')),
    en_concubinato BOOLEAN DEFAULT FALSE,
    fecha_nacimiento DATE NOT NULL,
    -- edad INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento))) STORED, -- Atributo Derivado Automático
    buscando_trabajo BOOLEAN DEFAULT FALSE,
    tipo_periodo_educacion VARCHAR(20),
    cantidad_tiempo_educacion INTEGER,
    direccion TEXT, -- Dirección específica opcional
    
    -- FKs
    id_parroquia INTEGER NOT NULL REFERENCES Parroquias(id_parroquia),
    id_actividad_solicitante INTEGER REFERENCES Actividades_Solicitantes(id_actividad_solicitante),
    id_trabajo INTEGER REFERENCES Trabajos(id_trabajo),
    id_nivel_educativo INTEGER REFERENCES Niveles_Educativos(id_nivel_educativo)
);

-- Tabla 26 (Relación N:M Solicitante-Bienes)
CREATE TABLE Almacenan (
    cedula_solicitante VARCHAR(20) REFERENCES Solicitantes(cedula_solicitante),
    id_bien INTEGER REFERENCES Bienes(id_bien),
    PRIMARY KEY (cedula_solicitante, id_bien)
);

-- Tabla 8 (Viviendas - Con los constraints estrictos del Anexo)
CREATE TABLE Viviendas (
    cedula_solicitante VARCHAR(20) PRIMARY KEY REFERENCES Solicitantes(cedula_solicitante),
    tipo_vivienda VARCHAR(50) NOT NULL CHECK (tipo_vivienda IN ('Casa', 'Apartamento', 'Rancho', 'Otro')),
    cantidad_habitaciones INTEGER NOT NULL CHECK (cantidad_habitaciones >= 0),
    cantidad_banos INTEGER NOT NULL CHECK (cantidad_banos >= 0),
    
    -- Nuevos campos obligatorios
    material_piso VARCHAR(50) NOT NULL CHECK (material_piso IN ('Tierra', 'Cemento', 'Cerámica', 'Granito / Parquet / Mármol', 'Otro')),
    material_paredes VARCHAR(50) NOT NULL CHECK (material_paredes IN ('Cartón / Palma / Desechos', 'Bahareque', 'Bloque sin frizar', 'Bloque frizado', 'Otro')),
    material_techo VARCHAR(50) NOT NULL CHECK (material_techo IN ('Madera / Cartón / Palma', 'Zinc / Acerolit', 'Platabanda / Tejas', 'Otro')),
    agua_potable VARCHAR(50) NOT NULL CHECK (agua_potable IN ('Dentro de la vivienda', 'Fuera de la vivienda', 'No tiene servicio')),
    eliminacion_aguas VARCHAR(50) NOT NULL CHECK (eliminacion_aguas IN ('Poceta a cloaca', 'Pozo séptico', 'Letrina', 'No tiene')),
    aseo_urbano VARCHAR(50) NOT NULL CHECK (aseo_urbano IN ('Llega a la vivienda', 'No llega / Container', 'No tiene'))
);

-- Tabla 9
CREATE TABLE Familias_Hogares (
    cedula_solicitante VARCHAR(20) PRIMARY KEY REFERENCES Solicitantes(cedula_solicitante),
    cantidad_personas INTEGER NOT NULL,
    cantidad_trabajadores INTEGER DEFAULT 0,
    cantidad_ninos INTEGER DEFAULT 0,
    cantidad_ninos_estudiando INTEGER DEFAULT 0,
    ingreso_mensual_aprox DECIMAL(10,2) NOT NULL,
    es_jefe_hogar BOOLEAN DEFAULT FALSE,

    id_nivel_educativo_jefe INTEGER REFERENCES Niveles_Educativos(id_nivel_educativo),
    CHECK (cantidad_trabajadores + cantidad_ninos <= cantidad_personas)
);

/* ==========================================================================
   MÓDULO E: USUARIOS Y ACADEMIA
   ========================================================================== */

-- Tabla 5
CREATE TABLE Semestres (
    term VARCHAR(10) PRIMARY KEY, -- Ej: '2025-15'
    fecha_inicio DATE NOT NULL,
    fecha_final DATE NOT NULL,
    CHECK (fecha_final > fecha_inicio)
);

-- Tabla 16 (Supertipo)
CREATE TABLE Usuarios_Sistema (
    cedula_usuario VARCHAR(20) PRIMARY KEY,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE, -- Debe ser UNIQUE para login
    username VARCHAR(50) GENERATED ALWAYS AS (SPLIT_PART(correo_electronico, '@', 1)) STORED, -- Derivado
    contrasena_hash VARCHAR(255) NOT NULL, -- Seguridad básica
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    telefono_celular VARCHAR(20),
    telefono_local VARCHAR(20),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Estudiante', 'Profesor', 'Coordinador', 'Administrador'))
);

-- Subtipos (Tablas 17, 18, 19)
CREATE TABLE Coordinadores (
    cedula_coordinador VARCHAR(20) PRIMARY KEY REFERENCES Usuarios_Sistema(cedula_usuario),
    term_asignado VARCHAR(10) REFERENCES Semestres(term)
);

-- 18. Alumnos (Subtipo Débil)
CREATE TABLE Alumnos (
    cedula_alumno VARCHAR(20) REFERENCES Usuarios_Sistema(cedula_usuario),
    term VARCHAR(10) REFERENCES Semestres(term),
    nrc VARCHAR(20),
    tipo VARCHAR(20) CHECK (tipo IN ('Voluntario', 'Inscrito', 'Egresado')),
    PRIMARY KEY (cedula_alumno, term)
);

-- 19. Profesores (Subtipo Débil)
CREATE TABLE Profesores (
    cedula_profesor VARCHAR(20) REFERENCES Usuarios_Sistema(cedula_usuario),
    term VARCHAR(10) REFERENCES Semestres(term),
    nrc VARCHAR(20),
    tipo VARCHAR(20) CHECK (tipo IN ('Voluntario', 'Asesor', 'Titular')),
    PRIMARY KEY (cedula_profesor, term)
);

/* ==========================================================================
   MÓDULO A & F: NÚCLEO DEL CASO Y OPERACIONES
   ========================================================================== */

-- Tabla 32 (Trámites)
CREATE TABLE Tramites (
    id_tramite SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO Tramites (nombre) VALUES 
('Asesoría'), ('Conciliación y Mediación'), ('Redacción documentos y/o convenio'), ('Asistencia Judicial - Casos externos');

-- Tabla 2
CREATE TABLE Estatus (
    id_estatus SERIAL PRIMARY KEY,
    nombre_estatus VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO Estatus (nombre_estatus) VALUES 
('En proceso'), ('Archivado'), ('Entregado'), ('Asesoría'), ('Pausado');

-- Tabla 1 (La Tabla Maestra)
CREATE TABLE Casos (
    nro_caso SERIAL PRIMARY KEY,
    cnt_beneficiarios INTEGER DEFAULT 0, -- Se actualizará vía Trigger
    sintesis_caso TEXT NOT NULL,
    fecha_caso_inicio DATE DEFAULT CURRENT_DATE,
    fecha_caso_final DATE,
    
    -- FKs
    cedula_solicitante VARCHAR(20) NOT NULL REFERENCES Solicitantes(cedula_solicitante),
    id_nucleo INTEGER NOT NULL REFERENCES Nucleos(id_nucleo),
    id_tramite INTEGER NOT NULL REFERENCES Tramites(id_tramite),
    
    -- Jerarquía Legal Completa (Como solicitaste)
    id_materia INTEGER NOT NULL,
    num_categoria INTEGER NOT NULL,
    num_subcategoria INTEGER NOT NULL,
    num_ambito_legal INTEGER NOT NULL,
    
    -- Integridad Referencial a la tabla más específica (Ámbitos) que contiene las llaves de las anteriores
    FOREIGN KEY (num_ambito_legal, num_subcategoria, num_categoria, id_materia) 
    REFERENCES Ambitos_Legales(num_ambito_legal, num_subcategoria, num_categoria, id_materia)
);

-- Tabla 6 (Beneficiarios - Weak)
CREATE TABLE Beneficiarios (
    cedula_beneficiario VARCHAR(20),
    nro_caso INTEGER REFERENCES Casos(nro_caso) ON DELETE CASCADE,
    cedula_es_propia BOOLEAN DEFAULT FALSE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    sexo CHAR(1) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    -- edad INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento))) STORED,
    tipo_beneficiario VARCHAR(20) NOT NULL CHECK (tipo_beneficiario IN ('Directo', 'Indirecto')),
    parentesco VARCHAR(50) NOT NULL CHECK (parentesco IN ('S', 'N')),
    PRIMARY KEY (cedula_beneficiario, nro_caso)
);

-- Trigger para mantener cnt_beneficiarios actualizado
CREATE OR REPLACE FUNCTION actualizar_contador_beneficiarios() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE Casos SET cnt_beneficiarios = cnt_beneficiarios + 1 WHERE nro_caso = NEW.nro_caso;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE Casos SET cnt_beneficiarios = cnt_beneficiarios - 1 WHERE nro_caso = OLD.nro_caso;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cnt_beneficiarios
AFTER INSERT OR DELETE ON Beneficiarios
FOR EACH ROW EXECUTE PROCEDURE actualizar_contador_beneficiarios();

-- Tabla 20
CREATE TABLE Soportes_Legales (
    id_soporte SERIAL,
    nro_caso INTEGER REFERENCES Casos(nro_caso),
    descripcion TEXT NOT NULL,
    fecha_soporte DATE DEFAULT CURRENT_DATE,
    documento_url VARCHAR(255) NOT NULL, -- Link a Drive/S3
    observacion TEXT,
    PRIMARY KEY (id_soporte, nro_caso)
);

-- Tabla 22
CREATE TABLE Citas (
    id_cita SERIAL,
    nro_caso INTEGER REFERENCES Casos(nro_caso),
    fecha_atencion TIMESTAMP NOT NULL,
    observacion TEXT,
    fecha_proxima_cita TIMESTAMP,
    PRIMARY KEY (id_cita, nro_caso),
    CHECK (fecha_proxima_cita >= fecha_atencion)
);

-- Tabla 21
CREATE TABLE Acciones (
    nro_accion SERIAL,
    nro_caso INTEGER REFERENCES Casos(nro_caso),
    titulo_accion VARCHAR(100) NOT NULL,
    observacion TEXT,
    fecha_realizacion DATE NOT NULL,
    cedula_usuario_ejecutor VARCHAR(20) NOT NULL REFERENCES Usuarios_Sistema(cedula_usuario),
    fecha_registro TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (nro_accion, nro_caso)
);

-- Tabla 25 (Atienden N:M)
CREATE TABLE Atienden (
    cedula_usuario VARCHAR(20) REFERENCES Usuarios_Sistema(cedula_usuario),
    nro_caso INTEGER,
    id_cita INTEGER,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    -- FK Compuesta apuntando a Citas
    FOREIGN KEY (id_cita, nro_caso) REFERENCES Citas(id_cita, nro_caso),
    PRIMARY KEY (cedula_usuario, nro_caso, id_cita)
);

/* ==========================================================================
   MÓDULO G: AUDITORÍA Y ASIGNACIONES (TERNARIAS)
   ========================================================================== */

-- Tabla 28
CREATE TABLE Se_Asignan (
    id_asignacion SERIAL PRIMARY KEY,
    id_caso INTEGER REFERENCES Casos(nro_caso),
    term VARCHAR(10) NOT NULL,
    cedula_alumno VARCHAR(20) NOT NULL,
    estatus VARCHAR(20) CHECK (estatus IN ('Activo', 'Inactivo')),
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (cedula_alumno, term) REFERENCES Alumnos(cedula_alumno, term)
);

-- Índice parcial para asegurar Regla de Negocio: Solo 1 alumno activo por caso
CREATE UNIQUE INDEX idx_asignacion_unica_activa 
ON Se_Asignan (id_caso) WHERE (estatus = 'Activo');

-- Tabla 29 (Con restricción de profesor único activo)
CREATE TABLE Supervisan (
    id_supervision SERIAL PRIMARY KEY,
    id_caso INTEGER REFERENCES Casos(nro_caso),
    term VARCHAR(10) NOT NULL,
    cedula_profesor VARCHAR(20) NOT NULL,
    estatus VARCHAR(20) CHECK (estatus IN ('Activo', 'Inactivo')),
    FOREIGN KEY (cedula_profesor, term) REFERENCES Profesores(cedula_profesor, term)
);

-- Índice parcial para asegurar Regla de Negocio: Solo 1 profesor activo por caso
CREATE UNIQUE INDEX idx_supervision_unica_activa 
ON Supervisan (id_caso) WHERE (estatus = 'Activo');

-- Tabla 30 (Historial de Estatus)
CREATE TABLE Se_Le_Adjudican (
    id_historial SERIAL PRIMARY KEY,
    id_caso INTEGER REFERENCES Casos(nro_caso),
    id_estatus INTEGER REFERENCES Estatus(id_estatus),
    cedula_usuario VARCHAR(20) REFERENCES Usuarios_Sistema(cedula_usuario),
    motivo TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

/* ==========================================================================
   MÓDULO H: NOTIFICACIONES
   ========================================================================== */

-- Tabla 31 (Notificaciones)
CREATE TABLE Notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    fecha_notificacion TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla 32 (Notificaciones-Usuarios N:M)
CREATE TABLE Notificaciones_Usuarios (
    id_notificacion INTEGER NOT NULL REFERENCES Notificaciones(id_notificacion) ON DELETE CASCADE,
    cedula_usuario VARCHAR(20) NOT NULL REFERENCES Usuarios_Sistema(cedula_usuario) ON DELETE CASCADE,
    revisado BOOLEAN DEFAULT FALSE NOT NULL,
    fecha_revision TIMESTAMP,
    PRIMARY KEY (id_notificacion, cedula_usuario)
);

/* ==========================================================================
   AGREGADO: SEGUIMIENTO DE CASOS POR SEMESTRE (BITÁCORA)
   ========================================================================== */

-- Tabla 33 (Seguimiento Histórico)
CREATE TABLE casos_semestres (
    id_caso_semestre SERIAL PRIMARY KEY,
    nro_caso INTEGER NOT NULL,
    term VARCHAR(10) NOT NULL,
    id_estatus INTEGER NOT NULL,
    cedula_usuario VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones de Integridad
    CONSTRAINT casos_semestres_nro_caso_term_key UNIQUE (nro_caso, term),
    
    -- Llaves Foráneas
    FOREIGN KEY (nro_caso) REFERENCES Casos(nro_caso),
    FOREIGN KEY (term) REFERENCES Semestres(term),
    FOREIGN KEY (id_estatus) REFERENCES Estatus(id_estatus),
    FOREIGN KEY (cedula_usuario) REFERENCES Usuarios_Sistema(cedula_usuario)
);

-- Índice para búsquedas frecuentes de notificaciones no revisadas por usuario
CREATE INDEX idx_notificaciones_usuario_revisado 
ON Notificaciones_Usuarios (cedula_usuario, revisado) 
WHERE revisado = FALSE;

-- Índice para búsquedas por fecha de notificación
CREATE INDEX idx_notificaciones_fecha 
ON Notificaciones (fecha_notificacion DESC);

/* ==========================================================================
   AGREGADO: AUDITORÍA DE ELIMINACIONES
   ========================================================================== */

-- Tabla 34 (Auditoría de Casos Eliminados)
CREATE TABLE Auditoria_Casos_Eliminados (
    id_auditoria SERIAL PRIMARY KEY,
    nro_caso_original INTEGER,
    cedula_responsable VARCHAR(20),
    nombre_responsable VARCHAR(100),
    rol_responsable VARCHAR(50),
    fecha_eliminacion TIMESTAMP DEFAULT NOW(),
    motivo TEXT
);

-- Tabla 35 (Auditoría de Usuarios del Sistema)
CREATE TABLE Auditoria_Usuarios (
    id_auditoria SERIAL PRIMARY KEY,
    cedula_usuario_modificado VARCHAR(20) NOT NULL,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    cedula_responsable VARCHAR(20),
    nombre_responsable VARCHAR(100),
    fecha_cambio TIMESTAMP DEFAULT NOW()
);

-- Tabla 36 (Auditoría de Solicitantes)
CREATE TABLE Auditoria_Solicitantes (
    id_auditoria SERIAL PRIMARY KEY,
    cedula_solicitante_modificado VARCHAR(20) NOT NULL,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    cedula_responsable VARCHAR(20),
    nombre_responsable VARCHAR(100),
    fecha_cambio TIMESTAMP DEFAULT NOW()
);

-- Tabla 37 (Auditoría de Casos y Entidades Relacionadas)
CREATE TABLE Auditoria_Casos (
    id_auditoria SERIAL PRIMARY KEY,
    nro_caso INTEGER NOT NULL,
    tipo_entidad VARCHAR(50) NOT NULL, -- 'Caso', 'Cita', 'Accion', 'Soporte', 'Beneficiario', 'Asignacion'
    id_entidad VARCHAR(50), -- ID específico si aplica (id_cita, nro_accion, etc.)
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    cedula_responsable VARCHAR(20),
    nombre_responsable VARCHAR(100),
    fecha_cambio TIMESTAMP DEFAULT NOW()
);

-- Índices para Auditoria_Usuarios
CREATE INDEX idx_auditoria_usuarios_cedula 
ON Auditoria_Usuarios (cedula_usuario_modificado);

CREATE INDEX idx_auditoria_usuarios_fecha 
ON Auditoria_Usuarios (fecha_cambio DESC);

-- Índices para Auditoria_Solicitantes
CREATE INDEX idx_auditoria_solicitantes_cedula 
ON Auditoria_Solicitantes (cedula_solicitante_modificado);

CREATE INDEX idx_auditoria_solicitantes_fecha 
ON Auditoria_Solicitantes (fecha_cambio DESC);

-- Índices para Auditoria_Casos
CREATE INDEX idx_auditoria_casos_nro_caso 
ON Auditoria_Casos (nro_caso);

CREATE INDEX idx_auditoria_casos_tipo 
ON Auditoria_Casos (tipo_entidad);

CREATE INDEX idx_auditoria_casos_fecha 
ON Auditoria_Casos (fecha_cambio DESC);