-- HILFSTABELLE FFH LEBENSRAUMTYPEN DEUTSCHLAND
-- Source: https://www.bfn.de/lebensraumtypen
DROP TABLE IF EXISTS de_habitat_types CASCADE;

CREATE TABLE IF NOT EXISTS de_habitat_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR NOT NULL,
  priority BOOLEAN NOT NULL,
  description VARCHAR,
  label VARCHAR
);



-- HILFSTABELLE HERKUNFT BIOTOPKARTIERUNG SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_biotope_origin CASCADE;

CREATE TABLE IF NOT EXISTS sh_biotope_origin (
  id SERIAL PRIMARY KEY,
  code VARCHAR NOT NULL,
  description VARCHAR,
  remark VARCHAR
);



-- HILFSTABELLE METADATEN BIOTOPSCHLÜSSEL SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_biotope_key CASCADE;

CREATE TABLE IF NOT EXISTS sh_biotope_key (
  id SERIAL PRIMARY KEY,
  code VARCHAR NOT NULL,
  designation VARCHAR
);



-- HILFSTABELLE METADATEN BIOTOPSCHLÜSSEL HAMBURG
DROP TABLE IF EXISTS hh_biotope_key CASCADE;

CREATE TABLE IF NOT EXISTS hh_biotope_key (
  id SERIAL PRIMARY KEY,
  code VARCHAR NOT NULL,
  designation VARCHAR
);


-- UNIQUE INDEX
CREATE UNIQUE INDEX IF NOT EXISTS idx_hh_biotope_key_code ON hh_biotope_key(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sh_biotope_key_code ON sh_biotope_key(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sh_biotope_origin_code ON sh_biotope_origin(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_de_natura_2000_habitat_code ON de_habitat_types(code);
