#!/usr/bin/python
import sys
import logging
import psycopg2
import datetime
import json

from db_util import make_conn, fetch_data

def lambda_handler(event, context):

    average = {}

    averageData = []

    conn = make_conn()

    cur = conn.cursor()

    company = event['params']['querystring']['company'];

    cur.execute("""SELECT event from prediction WHERE company = '%s' AND recent = '%s';""" % (company, 'True'))
    rawData = cur.fetchall()

    for data in rawData:
        if data[0]['date'] in average:
            average[data[0]['date']]['sum'] += data[0]['closePrice']
            average[data[0]['date']]['counts'] += 1
        else:
            average[data[0]['date']] = {}
            average[data[0]['date']]['sum'] = data[0]['closePrice']
            average[data[0]['date']]['counts'] = 1

    for key, value in average.iteritems():
        averageData.append({
            'date': datetime.datetime.fromtimestamp(float(key)/1000.0).strftime('%Y-%m-%d'),
            'closePrice': value['sum']/value['counts']
        })

    averageData = sorted(averageData, key=lambda k: k['date'])

    return {
        'company': event['params']['querystring']['company'],
        'averageData': averageData
    }