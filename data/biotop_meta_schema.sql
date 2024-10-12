-- HILFSTABELLE HERKUNFT BIOTOPKARTIERUNG SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_biotop_origin CASCADE;

CREATE TABLE IF NOT EXISTS sh_biotop_origin (
  id SERIAL,
  code VARCHAR,
  description VARCHAR,
  PRIMARY KEY(id)
);



-- HILFSTABELLE METADATEN BIOTOPENCODE SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_biotop_meta CASCADE;

CREATE TABLE IF NOT EXISTS sh_biotop_meta (
  id SERIAL,
  code VARCHAR,
  designation VARCHAR,
  bundesnaturschutzgesetz_30 VARCHAR,
  bundesnaturschutzgesetz_21 VARCHAR,
  biotopverordnung VARCHAR,
  ffh_lebensraumtypen VARCHAR,
  biotoptypen_code VARCHAR,
  PRIMARY KEY(id)
);


-- INDEX
CREATE UNIQUE INDEX IF NOT EXISTS sh_biotop_meta_code_idx ON sh_biotop_meta(code);
CREATE UNIQUE INDEX IF NOT EXISTS sh_biotop_origin_code_idx ON sh_biotop_origin(code);
