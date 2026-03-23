"""
Управление справочниками CRM: каналы, источники, филиалы, пользователи.
Параметр entity в query: channels | sources | branches | users
POST — добавить, PUT — обновить/редактировать, PATCH — удалить/установить пароль по id, DELETE — удалить
"""
import json
import os
import uuid
import hashlib
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    entity = params.get('entity', '')
    body = json.loads(event.get('body') or '{}')
    action = params.get('action', '')

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
            if 'name' in body:
                cur.execute("UPDATE channels SET name = %s WHERE id = %s", (body['name'], body['id']))
            else:
                cur.execute("UPDATE channels SET active = %s WHERE id = %s", (body['active'], body['id']))
            result = {'ok': True}
        elif method == 'PATCH' or method == 'DELETE':
            cur.execute("DELETE FROM channels WHERE id = %s", (body['id'],))
            result = {'ok': True}

    elif entity == 'sources':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            cur.execute("INSERT INTO ad_sources (id, name, active) VALUES (%s, %s, TRUE) RETURNING id, name, active", (new_id, body['name']))
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1], 'active': r[2]}
        elif method == 'PUT':
            if 'name' in body:
                cur.execute("UPDATE ad_sources SET name = %s WHERE id = %s", (body['name'], body['id']))
            else:
                cur.execute("UPDATE ad_sources SET active = %s WHERE id = %s", (body['active'], body['id']))
            result = {'ok': True}
        elif method == 'PATCH' or method == 'DELETE':
            cur.execute("DELETE FROM ad_sources WHERE id = %s", (body['id'],))
            result = {'ok': True}

    elif entity == 'branches':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            cur.execute("INSERT INTO branches (id, name) VALUES (%s, %s) RETURNING id, name", (new_id, body['name']))
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1]}
        elif method == 'PUT':
            cur.execute("UPDATE branches SET name = %s WHERE id = %s", (body['name'], body['id']))
            result = {'ok': True}
        elif method == 'PATCH' or method == 'DELETE':
            cur.execute("DELETE FROM branches WHERE id = %s", (body['id'],))
            result = {'ok': True}

    elif entity == 'users':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            branch_id = body.get('branchId') or None
            password = body.get('password') or ''
            ph = hash_password(password) if password else None
            cur.execute(
                "INSERT INTO users (id, name, role, branch_id, password_hash) VALUES (%s, %s, %s, %s, %s) RETURNING id, name, role, branch_id",
                (new_id, body['name'], body['role'], branch_id, ph)
            )
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1], 'role': r[2], 'branchId': r[3]}
        elif method == 'PUT':
            if action == 'password':
                password = body.get('password') or ''
                ph = hash_password(password) if password else None
                cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (ph, body['id']))
            else:
                branch_id = body.get('branchId') or None
                cur.execute(
                    "UPDATE users SET name = %s, role = %s, branch_id = %s WHERE id = %s",
                    (body['name'], body['role'], branch_id, body['id'])
                )
            result = {'ok': True}
        elif method == 'PATCH' or method == 'DELETE':
            cur.execute("DELETE FROM users WHERE id = %s", (body['id'],))
            result = {'ok': True}

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(result, ensure_ascii=False),
    }
