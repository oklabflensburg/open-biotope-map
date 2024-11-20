-- HILFSTABELLE HERKUNFT BIOTOPKARTIERUNG SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_biotope_origin CASCADE;

CREATE TABLE IF NOT EXISTS sh_biotope_origin (
  id SERIAL PRIMARY KEY,
  code VARCHAR,
  description VARCHAR
);



-- HILFSTABELLE METADATEN BIOTOPENCODE SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_biotope_meta CASCADE;

CREATE TABLE IF NOT EXISTS sh_biotope_meta (
  id SERIAL PRIMARY KEY,
  code VARCHAR,
  designation VARCHAR,
  bundesnaturschutzgesetz_30 VARCHAR,
  bundesnaturschutzgesetz_21 VARCHAR,
  biotopverordnung VARCHAR,
  ffh_lebensraumtypen VARCHAR,
  biotoptypen_code VARCHAR
);



-- HILFSTABELLE METADATEN BIOTOPSCHLÜSSEL HAMBURG
DROP TABLE IF EXISTS hh_biotope_meta CASCADE;

CREATE TABLE IF NOT EXISTS hh_biotope_meta (
  id SERIAL PRIMARY KEY,
  code VARCHAR,
  designation VARCHAR
);


-- INDEX
CREATE UNIQUE INDEX IF NOT EXISTS sh_biotope_meta_code_idx ON sh_biotope_meta(code);
CREATE UNIQUE INDEX IF NOT EXISTS sh_biotope_origin_code_idx ON sh_biotope_origin(code);
