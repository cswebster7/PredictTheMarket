#!/usr/bin/python
import sys
import logging
import psycopg2
import datetime
import json

from db_util import make_conn, fetch_data

def lambda_handler(event, context):
    
    query_cmd = "select count(*) from prediction"

    conn = make_conn()
    
    cur = conn.cursor()
    
    lastUpdateDate = list(fetch_data(conn, """SELECT submission_date from prediction ORDER BY submission_date DESC Limit 1""")[0])[0]
    cur.execute("""SELECT * from prediction WHERE submission_date = '%s';""" % (lastUpdateDate))
    rawData = cur.fetchall()

    arrAverage = []
    for data in rawData:
        json_data = list(data)
        arrAverage.append({
            'year': json_data[0][u'year'],
            'debt': json_data[1]
        })
    conn.close()
    return json.dumps({'averages': arrAverage})
    