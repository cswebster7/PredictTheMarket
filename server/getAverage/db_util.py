#!/usr/bin/python
import psycopg2

db_host = 'predictiondb.c4ett03rbhmd.us-west-2.rds.amazonaws.com'
db_port = 5559
db_name = "predictiondatabase"
db_user = "master"
db_pass = "password"
db_table = "prediction"


def make_conn():
    conn = None
    try:
        conn = psycopg2.connect(    host=db_host,
                                    database=db_name,
                                    user=db_user,
                                    password=db_pass,
                                    port=db_port)
    except:
        print "I am unable to connect to the database"
    return conn


def fetch_data(conn, query):
    result = []
    print "Now executing: %s" % (query)
    cursor = conn.cursor()
    cursor.execute(query)

    raw = cursor.fetchall()
    for line in raw:
        result.append(line)

    return result