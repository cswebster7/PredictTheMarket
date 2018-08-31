#!/usr/bin/python
import psycopg2

db_host = "DATABASE_URL"
db_port = "PORT"
db_name = "DB_NAME"
db_user = "DB_USERNAME"
db_pass = "DB_PASSWORD"
db_table = "DB_TABLE"

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
