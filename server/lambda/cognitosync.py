import logging
import psycopg2
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event,context):
    logger.info('got event{}'.format(event))

    conn = None
    try:
        conn = psycopg2.connect(host=os.environ["DB_HOST"],
                                database=os.environ["DB_NAME"],
                                user=os.environ["DB_USERNAME"],
                                password=os.environ["DB_PASSWORD"],
                                port=os.environ["DB_PORT"])
    except:
        logger.error("ERROR: Unexpected error: Could not connect to PostgresQL instance.")
        return event


    cursor = conn.cursor()
    cursor.execute("INSERT INTO users(username,userID,email) VALUES (%s,%s,%s)",(event["userName"],event['request']['userAttributes']['sub'],event['request']['userAttributes']["email"]))
    conn.commit()

    return event

# event = {'version': '1', 'region': 'us-west-2', 'userPoolId': 'us-west-2_s2knk8nhY', 'userName': 'S3-test', 'callerContext': {'awsSdkVersion': 'aws-sdk-unknown-unknown', 'clientId': '7m215sihsv1h9juaej206lempi'}, 'triggerSource': 'PostConfirmation_ConfirmSignUp', 'request': {'userAttributes': {'sub': '44f3dad3-8029-492e-bc63-fd435130513d', 'cognito:user_status': 'CONFIRMED', 'email_verified': 'true', 'cognito:email_alias': 'happysvst@gmail.com', 'email': 'happysvst@gmail.com'}}, 'response': {}}
#
# handler(event,None)