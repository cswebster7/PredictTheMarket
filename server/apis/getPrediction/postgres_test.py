#!/usr/bin/python
import sys
import logging
import psycopg2
import datetime
import json

from db_util import make_conn, fetch_data
def lambda_handler(event, context):
    
    averageObj = [];
    
    query_cmd = "select count(*) from prediction"

    conn = make_conn()
    
    cur = conn.cursor()
    
    events = fetch_data(conn, """SELECT event from prediction""")

    dicAverage = {}
    for data in events:
        json_dict = list(data)[0]
        if str(json_dict[u'year']) in dicAverage.keys():
            dicAverage[str(json_dict[u'year'])].append(json_dict[u'debt'])
        else:
            dicAverage[str(json_dict[u'year'])] = [json_dict[u'debt']]
    
    submission_date = datetime.datetime.now()
    print ("---> submission date\n", submission_date, "\n")
    
    averages = {}
    
    for data in event['data']:
        def sum_list(items):
            sum_numbers = 0
            for x in items:
                sum_numbers += x
            return sum_numbers
        
        average = data['debt']
        if dicAverage.get(str(data['year'])) is not None:
            prev_debts = dicAverage[str(data['year'])]
            average = (sum_list(prev_debts) + data['debt']) / (len(prev_debts) + 1)
        
        averages[str(data['year'])] = average
        
        cur.execute("""INSERT INTO prediction (event, submission_date, average) VALUES (%s::json, %s, %s);""", (json.dumps(data), submission_date, average))
    
    conn.commit()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': { 'Content-Type': 'application/json' },
        'body': averages
    }
    
