import sys
import logging
import psycopg2
import json

from db_util import make_conn, fetch_data

def handler(event, context):

    conn = make_conn()

    cur = conn.cursor()

    cur.execute("""TRUNCATE TABLE prediction""");

    conn.commit()
    conn.close()

    final_result = {
        'statusCode': 200,
        'body': json.dumps({
            'status': 'success'
        }),
        'headers': {"Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": True
                    }
    }

    return final_result