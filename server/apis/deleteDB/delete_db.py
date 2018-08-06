import sys
import logging
import psycopg2
import json

from db_util import make_conn, fetch_data

def lambda_handler(event, context):

    conn = make_conn()

    cur = conn.cursor()

    cur.execute("""TRUNCATE TABLE prediction""");

    conn.commit()
    conn.close()

    return json.dumps({'status': 'success' })
