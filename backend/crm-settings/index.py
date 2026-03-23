"""
Управление справочниками CRM: каналы, источники, филиалы, пользователи.
Параметр entity в query: channels | sources | branches | users
POST — добавить, PUT — обновить (active toggle)
"""
import json
import os
import uuid
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    entity = params.get('entity', '')
    body = json.loads(event.get('body') or '{}')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    result = {}

    if entity == 'channels':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            cur.execute("INSERT INTO channels (id, name, active) VALUES (%s, %s, TRUE) RETURNING id, name, active", (new_id, body['name']))
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1], 'active': r[2]}
        elif method == 'PUT':
            cur.execute("UPDATE channels SET active = %s WHERE id = %s", (body['active'], body['id']))
            result = {'ok': True}

    elif entity == 'sources':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            cur.execute("INSERT INTO ad_sources (id, name, active) VALUES (%s, %s, TRUE) RETURNING id, name, active", (new_id, body['name']))
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1], 'active': r[2]}
        elif method == 'PUT':
            cur.execute("UPDATE ad_sources SET active = %s WHERE id = %s", (body['active'], body['id']))
            result = {'ok': True}

    elif entity == 'branches':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            cur.execute("INSERT INTO branches (id, name) VALUES (%s, %s) RETURNING id, name", (new_id, body['name']))
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1]}

    elif entity == 'users':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            branch_id = body.get('branchId') or None
            cur.execute(
                "INSERT INTO users (id, name, role, branch_id) VALUES (%s, %s, %s, %s) RETURNING id, name, role, branch_id",
                (new_id, body['name'], body['role'], branch_id)
            )
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1], 'role': r[2], 'branchId': r[3]}

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(result, ensure_ascii=False),
    }