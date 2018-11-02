#!/usr/bin/python
import sys
import logging
import psycopg2
import datetime
import json
import logging
from db_util import make_conn, fetch_data

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):

    logger.info('got eventfromcall{}'.format(event))

    conn = make_conn()

    cur = conn.cursor()

    submission_date_time = datetime.datetime.now()
    print ("---> submission date\n", submission_date_time, "\n")
    
    company = event['company']
    ui = event['user_id']

    cur.execute("""UPDATE prediction SET recent=%s WHERE user_id=%s AND company=%s;""", ('False', ui, company));
    
    for data in event['data']:
        def sum_list(items):
            sum_numbers = 0
            for x in items:
                sum_numbers += x
            return sum_numbers
        
        cur.execute("""INSERT INTO prediction (event, submission_date_time, company, user_id, recent) VALUES (%s::json, %s, %s, %s, %s);""", (json.dumps(data), submission_date_time, company, ui, 'True'))

    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': { 'Content-Type': 'application/json' },
        'body': 'Added to DB!'
    }
    
