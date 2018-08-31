#!/usr/bin/python
import psycopg2
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)
def make_conn():
    conn = None
    try:
        conn = psycopg2.connect(host=os.environ["DB_HOST"],
                                database=os.environ["DB_NAME"],
                                user=os.environ["DB_USERNAME"],
                                password=os.environ["DB_PASSWORD"],
                                port=os.environ["DB_PORT"])
    except:
        logger.error("ERROR: Unexpected error: Could not connect to PostgresQL instance.")
    return conn


def fetch_data(conn, query):
    result = []
    # print "Now executing: %s" % (query)
    cursor = conn.cursor()
    cursor.execute(query)

    raw = cursor.fetchall()
    for line in raw:
        result.append(line)

    return result
