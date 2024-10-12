# Biotopkartierung Schleswig-Holstein

[![Lint css files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-css.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-css.yml)
[![Lint html files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-html.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-html.yml)
[![Lint js files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-js.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-js.yml)
[![Lighthouse CI](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lighthouse.yml)


![Screenshot der interaktiven Biotopkarte](https://raw.githubusercontent.com/oklabflensburg/open-biotope-map/main/screenshot_biotopkarte.webp)

_Haftungsausschluss: Dieses Repository und die zugehörige Datenbank befinden sich derzeit in einer Beta-Version. Einige Aspekte des Codes und der Daten können noch Fehler enthalten. Bitte kontaktieren Sie uns per E-Mail oder erstellen Sie ein Issue auf GitHub, wenn Sie einen Fehler entdecken._


## Hintergrund

Diese kleine interaktive Biotopkarte ist nach einem Spaziergang durch Salzwiesen und an der Steilküste in Holnis entstanden. Nach mehrfacher Begehung der einzigartigen Landschaft an der Ostsee entstand der Wunsch die Vielfalt der vielen Biotope in Schleswig-Holstein digital erkundbar zu machen.


## Datenquelle

Die zugrundeliegenden Daten der Biotopkartierung stellt das Landesamt für Umwelt im Open-Data Portal Schleswig-Holstein zum Download zur Verfügung. Die Biotopkarte wurde von engagierten ehrenamtlichen Mitgliedern des OK Lab Flensburgs entwickelt.


## Aktualität

Die Aktualität der zugrundeliegenden Daten entnehmen Sie bitte der Projektseite.


## Setup

Install system dependencies and clone repository

```
sudo apt install wget
sudo apt install git git-lfs
sudo apt install python3 python3-pip python3-venv

sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
sudo apt update
sudo apt install postgresql-16 postgis
sudo apt install gdal-bin

# install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# download and install Node.js
nvm install 20

# verifies the right Node.js version is in the environment
node -v

# verifies the right NPM version is in the environment
npm -v

git clone https://github.com/oklabflensburg/open-biotope-map.git
```

Create a dot `.env` file inside the project root. Make sure to add the following content and repace values.

```
BASE_URL=http://localhost

CONTACT_MAIL=mail@example.com
CONTACT_PHONE="+49xx"

PRIVACY_CONTACT_PERSON="Firstname Lastname"

ADDRESS_NAME="Address Name"
ADDRESS_STREET="Address Street"
ADDRESS_HOUSE_NUMBER="House Number"
ADDRESS_POSTAL_CODE="Postal Code"
ADDRESS_CITY="City"

DB_PASS=postgres
DB_HOST=localhost
DB_USER=postgres
DB_NAME=postgres
DB_PORT=5432
```



## Datenbank Schema erstellen

Run sql statements inside `open-biotope-map` root directory

```
psql -U oklab -h localhost -d oklab -p 5432 < data/biotop_meta_schema.sql
```


## Importieren der Maritime Daten Ostsee LRT 1110 und 1170

```sh
wget https://opendata.schleswig-holstein.de/data/llur51/Marine_Daten_Ostsee_LRT_1110_und_1170.zip
unzip Marine_Daten_Ostsee_LRT_1110_und_1170.zip
ogr2ogr -f "PostgreSQL" PG:"dbname=oklab user=oklab port=5432 host=localhost" -lco GEOMETRY_NAME=geom -lco SPATIAL_INDEX=GIST -lco PRECISION=NO -s_srs Maritim_Daten_Ostsee_LRT_1110_und_1170.prj -t_srs EPSG:4326 Maritim_Daten_Ostsee_LRT_1110_und_1170.shp -nlt POLYGON -nln sh_maritime_baltic -overwrite -skipfailures
```


## Importieren der Biotopkartierung

```
mkdir bksh
cd bksh
wget https://opendata.schleswig-holstein.de/data/lfu51/SH4_BKSH_Flaechen_gesamt.zip
unzip SH4_BKSH_Flaechen_gesamt.zip
ogr2ogr -f "PostgreSQL" PG:"dbname=oklab user=oklab port=5432 host=localhost" -lco GEOMETRY_NAME=geom -lco SPATIAL_INDEX=GIST -lco PRECISION=NO -s_srs SH4_BKSH_Flaechen_gesamt.prj -t_srs EPSG:4326 SH4_BKSH_Flaechen_gesamt.shp  -nlt POLYGON -nln sh_biotop -overwrite -skipfailures -update
```


## Importieren der Biotoptypen

```
cd tools
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 insert_biotope_meta.py --env ../.env --table sh_biotop_meta --source ../data/biotoptypen_standardliste.csv --verbose
python3 insert_biotope_origin.py --env ../.env --source ../data/habitat_mapping_origin.csv --verbose
deactivate
```


## LICENSE

[CC0-1.0](LICENSE)
