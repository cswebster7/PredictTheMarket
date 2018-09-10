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


def handler(event, context):
    averageObj = [];

    logger.info('got eventfromcall{}'.format(event))

    query_cmd = "select count(*) from prediction"

    conn = make_conn()

    cur = conn.cursor()

    events = fetch_data(conn, """SELECT event from prediction""")
    logger.info('got eventfromUtil{}'.format(events))

    dicAverage = {}
    for data in events:
        json_dict = list(data)[0]
        if str(json_dict[u'year']) in dicAverage.keys():
            dicAverage[str(json_dict[u'year'])].append(json_dict[u'debt'])
        else:
            dicAverage[str(json_dict[u'year'])] = [json_dict[u'debt']]

    submission_date = datetime.datetime.now()
    print("---> submission date\n", submission_date, "\n")

    ui = event['requestContext']['authorizer']['claims']['sub']
    averages = {}
    body = json.loads(event["body"])
    for data in body['data']:
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

        cur.execute("""INSERT INTO prediction (event, submission_date, average, userId) VALUES (%s::json, %s, %s, %s);""",
                    (json.dumps(data), submission_date, average, ui))

    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {"Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": True,
                    "Access-Control-Headers": "*",
                    'Content-Type': 'application/json'},
        'body': json.dumps({
            "averages" : averages
        })
    }