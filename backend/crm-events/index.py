"""
Получение и создание событий CRM (обращения, записи, продажи).
GET — список событий (фильтры: branch_id, user_id, type)
POST — создание нового события
"""
import json
import os
import uuid
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body') or '{}')
        event_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO events (id, type, branch_id, user_id, channel_id, ad_source_id) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id, created_at",
            (event_id, body['type'], body['branchId'], body['userId'], body['channelId'], body['adSourceId'])
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 201,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'id': row[0], 'createdAt': row[1].isoformat()}, ensure_ascii=False),
        }

    params = event.get('queryStringParameters') or {}
    filters = []
    values = []

    if params.get('branchId'):
        filters.append("e.branch_id = %s")
        values.append(params['branchId'])
    if params.get('userId'):
        filters.append("e.user_id = %s")
        values.append(params['userId'])
    if params.get('type'):
        filters.append("e.type = %s")
        values.append(params['type'])

    where = ('WHERE ' + ' AND '.join(filters)) if filters else ''
    cur.execute(
        f"SELECT e.id, e.type, e.branch_id, e.user_id, e.channel_id, e.ad_source_id, e.created_at FROM events e {where} ORDER BY e.created_at DESC LIMIT 500",
        values
    )
    events_list = [
        {
            'id': r[0], 'type': r[1], 'branchId': r[2],
            'userId': r[3], 'channelId': r[4], 'adSourceId': r[5],
            'createdAt': r[6].isoformat(),
        }
        for r in cur.fetchall()
    ]
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'events': events_list}, ensure_ascii=False),
    }
