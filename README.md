# Biotopkartierung Schleswig-Holstein

[![Lint css files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-css.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-css.yml)
[![Lint html files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-html.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-html.yml)
[![Lint js files](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-js.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lint-js.yml)
[![Lighthouse CI](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-biotope-map/actions/workflows/lighthouse.yml)


![Denkmalliste Stadt Flensburg](https://raw.githubusercontent.com/oklabflensburg/open-biotope-map/main/screenshot_biotopkarte.webp)

_Haftungsausschluss: Dieses Repository und die zugehörige Datenbank befinden sich derzeit in einer Beta-Version. Einige Aspekte des Codes und der Daten können noch Fehler enthalten. Bitte kontaktieren Sie uns per E-Mail oder erstellen Sie ein Issue auf GitHub, wenn Sie einen Fehler entdecken._


## Hintergrund

Die Idee, Denkmäler und deren Merkmale auf einer digitalen Karte anzuzeigen, ist während eines Spaziergangs durch Flensburg entstanden. Auf dem Open Data Portal Schleswig-Holstein stellt das Landesamt für Denkmalpflege Schleswig-Holstein eine Denkmalliste zur Verfügung, jedoch leider ohne Angabe der Koordinaten. Wir haben uns entschieden, dies zu ändern und einen Prototypen der Öffentlichkeit zugänglich zu machen, indem wir die Einträge mit den Gebäudekoordinaten ergänzen.


## Datenquelle

Das Landesamt für Denkmalpflege Schleswig-Holstein prüft anhand der gesetzlich vorgegebenen Kriterien den besonderen Wert eines Kulturdenkmals und legt die Maßstäbe, die Methodik für die Erfassung und Pflege sowie den Schutzumfang der Kulturdenkmale fest. Die erhobenen Daten der Denkmalliste werden im Open Data Portal des Landes Schleswig-Holstein zum Download angeboten. Die Kartendarstellung wurde von engagierten Einwohner:innen und ehrenamtlichen Mitgliedern des OK Lab Flensburgs entwickelt.


## Mitmachen

Du kannst jederzeit ein Issue auf GitHub öffnen oder uns über oklabflensburg@grain.one schreiben



## Prerequisite

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
deactivate
```


## LICENSE

[CC0-1.0](LICENSE)
