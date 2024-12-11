# Biotope Mapping Map

[![Lint CSS Files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-css.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-css.yml)
[![Lint HTML Files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-html.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-html.yml)
[![Lint JS Files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-js.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-js.yml)
[![Lighthouse CI](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lighthouse.yml)

![Screenshot of the interactive biotope map](https://raw.githubusercontent.com/oklabflensburg/open-biotope-map/main/screenshot_biotopkarte.webp)

> **Disclaimer:** This repository and the associated database are currently in a beta version. Some parts of the code and data may still contain errors. If you discover any issues, please contact us via email or create an issue on GitHub.


---

## Background

This interactive biotope map was inspired by field visits to the salt marshes and cliffs of Holnis along the Baltic Sea. The rich diversity of biotopes in this area sparked the idea of making the habitats of Schleswig-Holstein digitally accessible.

> **Note:** This is an unofficial map, and the information displayed may be outdated.


---


## Data Source

The biotope mapping data is provided by the [Landesamt für Umwelt](https://www.schleswig-holstein.de/DE/landesregierung/ministerien-behoerden/LFU) (LfU) and can be downloaded from the [Open Data Portal](https://opendata.schleswig-holstein.de/dataset/biotopkartierung-sh4-flachen-gesamt) of Schleswig-Holstein. The map was developed by volunteer members of the OK Lab Flensburg.


---


## Data Freshness

For information on data freshness, please refer to the project's website.


---


## Setup Instructions

### Prerequisites

Before you begin, ensure the following dependencies are installed on your system:

- **PostgreSQL 16** (with PostGIS extension)
- **Python 3** (including `pip` and `venv`)
- **GDAL**
- **Git** (with Git LFS)


### Installation Steps (Ubuntu 24.01 LTS)

Follow these steps to set up the project on Ubuntu 24.01 LTS:

1. Install Required Dependencies

Run the following commands to install the necessary system packages:

```bash
sudo apt update
sudo apt install wget curl git git-lfs python3 python3-pip python3-venv postgresql-16 postgresql-postgis gdal-bin
```

2. Clone the Repository

Clone the project repository and navigate into its directory:

```bash
git clone https://github.com/oklabflensburg/open-biotope-map.git
cd open-biotope-map
```

3. Configure the Environment

Create a `.env` file in the project’s root directory and populate it with the required configuration. Replace placeholder values with your actual data:

```bash
BASE_URL=http://localhost
CONTACT_MAIL=your-email@example.com
CONTACT_PHONE="+49xx"
PRIVACY_CONTACT_PERSON="Your Name"
ADDRESS_NAME="Your Organization"
ADDRESS_STREET="Your Street Name"
ADDRESS_HOUSE_NUMBER="Your House Number"
ADDRESS_POSTAL_CODE="Your Postal Code"
ADDRESS_CITY="Your City"
DB_PASS=your_database_password
DB_HOST=localhost
DB_USER=oklab
DB_NAME=oklab
DB_PORT=5432
```


---


## Data Import Instructions

### 1. Maritime Data (Schleswig-Holstein)

```bash
wget https://opendata.schleswig-holstein.de/data/llur51/Marine_Daten_Ostsee_LRT_1110_und_1170.zip
unzip Marine_Daten_Ostsee_LRT_1110_und_1170.zip
ogr2ogr -f "PostgreSQL" PG:"dbname=oklab user=oklab host=localhost" \
  -lco GEOMETRY_NAME=geom -lco SPATIAL_INDEX=GIST -lco PRECISION=NO \
  -s_srs Maritim_Daten_Ostsee_LRT_1110_und_1170.prj \
  -t_srs EPSG:4326 Maritim_Daten_Ostsee_LRT_1110_und_1170.shp \
  -nlt POLYGON -nln sh_maritime_baltic -overwrite -skipfailures
```


### 2. Biotope Mapping Data (Schleswig-Holstein)

```bash
mkdir bksh
cd bksh
wget https://opendata.schleswig-holstein.de/data/lfu51/SH4_BKSH_Flaechen_gesamt.zip
unzip SH4_BKSH_Flaechen_gesamt.zip
ogr2ogr -f "PostgreSQL" PG:"dbname=oklab user=oklab host=localhost" \
  -lco GEOMETRY_NAME=geom -lco SPATIAL_INDEX=GIST -lco PRECISION=NO \
  -s_srs SH4_BKSH_Flaechen_gesamt.prj -t_srs EPSG:4326 \
  SH4_BKSH_Flaechen_gesamt.shp -nlt MULTIPOLYGON -nln sh_biotope -overwrite -update
```


### 3. Mapping Scope (Schleswig-Holstein)

The mapping scope provides an overview of areas surveyed during the state-wide biotope mapping from 2014–2020:

```bash
wget https://opendata.schleswig-holstein.de/data/llur51/Kartierkulisse_BKSH_Flaechen_Gesamt.zip
unzip Kartierkulisse_BKSH_Flaechen_Gesamt.zip
ogr2ogr -f "PostgreSQL" PG:"dbname=oklab user=oklab host=localhost" \
  -lco GEOMETRY_NAME=geom -lco SPATIAL_INDEX=GIST -lco PRECISION=NO \
  -s_srs Kartierkulisse_BKSH_Flaechen_Gesamt.prj -t_srs EPSG:4326 \
  Kartierkulisse_BKSH_Flaechen_Gesamt.shp -nlt MULTIPOLYGON -nln sh_biotope_kulisse -overwrite -update
```


### 4. Biotope Mapping Data (Hamburg)

```bash
wget https://daten-hamburg.de/umwelt_klima/biotopkataster/Biotopkataster_HH_2018-11-16.zip
unzip Biotopkataster_HH_2018-11-16.zip
ogr2ogr -f "PostgreSQL" PG:"host=localhost port=5432 dbname=oklab user=oklab" \
  -lco GEOMETRY_NAME=geom -lco SPATIAL_INDEX=GIST -lco PRECISION=NO \
  -s_srs EPSG:25832 -t_srs EPSG:4326 biotopkataster_hh_2018-11-28.gml \
  -overwrite -update -oo GML_ATTRIBUTES_TO_OGR_FIELDS=YES
```


---


## Metadata Import


This tool simplifies importing metadata such as:

- [FFH Habitat Types](https://www.bfn.de/lebensraumtypen)
- Biotope types for Schleswig-Holstein and Hamburg.


### Import Steps:

**Important:** Before copying the following line, ensure you replace the default database and username parameters with your own values.

1. Run the SQL schema:

```bash
psql -U oklab -h localhost -d oklab -p 5432 < data/biotope_meta_schema.sql
```

2. Execute the Python scripts:

```bash
cd tools
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 insert_biotope_key.py --env ../.env --state hh --source ../data/biotoptypen_schluessel_hamburg.csv --verbose
python3 insert_biotope_key.py --env ../.env --state sh --source ../data/biotoptypen_standardliste.csv --verbose
python3 insert_biotope_origin.py --env ../.env --source ../data/habitat_mapping_origin.csv --verbose
python3 insert_habitat_types.py --env ../.env --source ../data/ffh_habitat_types.csv --verbose
deactivate
```


---


## Example SQL queries

Query unique protection reasons with distinct and sort them human readable.

```sql
SELECT btschutz
FROM (
    SELECT DISTINCT btschutz,
           REGEXP_REPLACE(btschutz, '[^0-9]', '', 'g')::INT AS numeric_part,
           REGEXP_REPLACE(btschutz, '[0-9]', '', 'g') AS alphabetic_part
    FROM (
        SELECT b.btschutz_1 AS btschutz
        FROM sh_biotope AS b
        WHERE b.btschutz_1 IS NOT NULL
        UNION ALL
        SELECT b.btschutz_2 AS btschutz
        FROM sh_biotope AS b
        WHERE b.btschutz_2 IS NOT NULL
    ) combined
    WHERE btschutz IS NOT NULL
) sorted
ORDER BY numeric_part, alphabetic_part;
```


## How to Contribute

Contributions are welcome! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to get involved.


---


## License

This repository is licensed under [CC0-1.0](LICENSE).
