import os
import sys
import click
import traceback
import logging as log
import psycopg2
import csv

from dotenv import load_dotenv
from pathlib import Path



# log uncaught exceptions
def log_exceptions(type, value, tb):
    for line in traceback.TracebackException(type, value, tb).format(chain=True):
        log.exception(line)

    log.exception(value)

    sys.__excepthook__(type, value, tb) # calls default excepthook


def connect_database(env_path):
    try:
        load_dotenv(dotenv_path=Path(env_path))

        conn = psycopg2.connect(
            database = os.getenv('DB_NAME'),
            password = os.getenv('DB_PASS'),
            user = os.getenv('DB_USER'),
            host = os.getenv('DB_HOST'),
            port = os.getenv('DB_PORT')
        )

        conn.autocommit = True

        log.info('connection to database established')

        return conn
    except Exception as e:
        log.error(e)

        sys.exit(1)


def insert_row(cur, row):
    code = row['code']
    description = row['description'] if row['description'] else None
    remark = row['remark'] if row['remark'] else None

    sql = '''
        INSERT INTO sh_biotope_origin (code, description, remark) VALUES (%s, %s, %s) RETURNING id
    '''

    try:
        cur.execute(sql, (code, description, remark))

        last_inserted_id = cur.fetchone()[0]

        log.info(f'inserted {code} with id {last_inserted_id}')
    except Exception as e:
        log.error(e)


def load_data(conn, source_path):
    cur = conn.cursor()

    with open(source_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
    
        for row in reader:
            insert_row(cur, row)


@click.command()
@click.option('--env', '-e', type=str, required=True, help='Set your local dot env path')
@click.option('--source', '-s', type=str, required=True, help='Set source path to your csv')
@click.option('--verbose', '-v', is_flag=True, help='Print more verbose output')
@click.option('--debug', '-d', is_flag=True, help='Print detailed debug output')
def main(env, source, verbose, debug):
    if debug:
        log.basicConfig(format='%(levelname)s: %(message)s', level=log.DEBUG)
    if verbose:
        log.basicConfig(format='%(levelname)s: %(message)s', level=log.INFO)
        log.info(f'set logging level to verbose')
    else:
        log.basicConfig(format='%(levelname)s: %(message)s')

    recursion_limit = sys.getrecursionlimit()
    log.info(f'your system recursion limit: {recursion_limit}')

    conn = connect_database(env)
    load_data(conn, Path(source))


if __name__ == '__main__':
    sys.excepthook = log_exceptions

    main()
