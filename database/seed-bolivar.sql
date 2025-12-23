-- Script de Seed: Estado Bolívar con Municipios y Parroquias
-- Ejecutar después de inicializar el schema

-- 1. Insertar Estado Bolívar
INSERT INTO Estados (nombre_estado) VALUES ('Bolívar');

-- 2. Insertar Municipios del Estado Bolívar
-- Obtener el id_estado de Bolívar para las referencias
DO $$
DECLARE
    id_bolivar INTEGER;
    id_angostura INTEGER;
    id_caroni INTEGER;
    id_cedeno INTEGER;
    id_chien INTEGER;
    id_callao INTEGER;
    id_gran_sabana INTEGER;
    id_heres INTEGER;
    id_piar INTEGER;
    id_roscio INTEGER;
    id_sifontes INTEGER;
    id_sucre INTEGER;
BEGIN
    -- Obtener ID del estado Bolívar
    SELECT id_estado INTO id_bolivar FROM Estados WHERE nombre_estado = 'Bolívar';

    -- Insertar Municipios
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Angostura (Antiguo Raúl Leoni)', id_bolivar) RETURNING id_municipio INTO id_angostura;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Caroní', id_bolivar) RETURNING id_municipio INTO id_caroni;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Cedeño', id_bolivar) RETURNING id_municipio INTO id_cedeno;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Chien', id_bolivar) RETURNING id_municipio INTO id_chien;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('El Callao', id_bolivar) RETURNING id_municipio INTO id_callao;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Gran Sabana', id_bolivar) RETURNING id_municipio INTO id_gran_sabana;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Heres (Ciudad Bolívar)', id_bolivar) RETURNING id_municipio INTO id_heres;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Piar', id_bolivar) RETURNING id_municipio INTO id_piar;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Roscio', id_bolivar) RETURNING id_municipio INTO id_roscio;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Sifontes', id_bolivar) RETURNING id_municipio INTO id_sifontes;
    INSERT INTO Municipios (nombre_municipio, id_estado) VALUES ('Sucre', id_bolivar) RETURNING id_municipio INTO id_sucre;

    -- Insertar Parroquias por Municipio

    -- Angostura
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Ciudad Piar', id_angostura);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('San Francisco', id_angostura);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Santa Bárbara', id_angostura);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Barceloneta', id_angostura);

    -- Caroní
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Cachamay', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Chirica', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Dalla Costa', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Once de Abril', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Simón Bolívar', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Unare', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Universidad', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Vista al Sol', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Pozo Verde', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Yocoima', id_caroni);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('5 de Julio', id_caroni);

    -- Cedeño
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Caicara del Orinoco', id_cedeno);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Ascensión Encomendero', id_cedeno);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Altagracia', id_cedeno);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('La Urbana', id_cedeno);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Pijiguaos', id_cedeno);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Quiero', id_cedeno);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Manuel Echandía', id_cedeno);

    -- Chien
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('El Palmar', id_chien);

    -- El Callao
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('El Callao', id_callao);

    -- Gran Sabana
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Santa Elena de Uairén', id_gran_sabana);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Ikabarú', id_gran_sabana);

    -- Heres (Angostura del Orinoco)
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Catedral', id_heres);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Agua Salada', id_heres);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Marhuanta', id_heres);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Orinoco', id_heres);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Panapana', id_heres);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Zea', id_heres);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('José Antonio Páez', id_heres);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Vista Hermosa', id_heres);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('La Sabanita', id_heres);

    -- Piar
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Upata', id_piar);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Amanía', id_piar);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Pedro Cova', id_piar);

    -- Roscio
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Guasipati', id_roscio);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Salom', id_roscio);

    -- Sifontes
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Tumeremo', id_sifontes);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Sección Capital Dalla Costa', id_sifontes);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('San Isidro', id_sifontes);

    -- Sucre
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Maripa', id_sucre);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Aripao', id_sucre);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Borburata', id_sucre);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Las Majadas', id_sucre);
    INSERT INTO Parroquias (nombre_parroquia, id_municipio) VALUES ('Moitaco', id_sucre);

END $$;
