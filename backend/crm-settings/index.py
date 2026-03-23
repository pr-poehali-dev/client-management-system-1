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


def esc(val):
    if val is None:
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"


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
            cur.execute(f"INSERT INTO channels (id, name, active) VALUES ({esc(new_id)}, {esc(body['name'])}, TRUE) RETURNING id, name, active")
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1], 'active': r[2]}
        elif method == 'PUT':
            if 'name' in body:
                cur.execute(f"UPDATE channels SET name = {esc(body['name'])} WHERE id = {esc(body['id'])}")
            else:
                cur.execute(f"UPDATE channels SET active = {str(body['active']).upper()} WHERE id = {esc(body['id'])}")
            result = {'ok': True}
        elif method == 'PATCH' or method == 'DELETE':
            cur.execute(f"DELETE FROM channels WHERE id = {esc(body['id'])}")
            result = {'ok': True}

    elif entity == 'sources':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            cur.execute(f"INSERT INTO ad_sources (id, name, active) VALUES ({esc(new_id)}, {esc(body['name'])}, TRUE) RETURNING id, name, active")
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1], 'active': r[2]}
        elif method == 'PUT':
            if 'name' in body:
                cur.execute(f"UPDATE ad_sources SET name = {esc(body['name'])} WHERE id = {esc(body['id'])}")
            else:
                cur.execute(f"UPDATE ad_sources SET active = {str(body['active']).upper()} WHERE id = {esc(body['id'])}")
            result = {'ok': True}
        elif method == 'PATCH' or method == 'DELETE':
            cur.execute(f"DELETE FROM ad_sources WHERE id = {esc(body['id'])}")
            result = {'ok': True}

    elif entity == 'branches':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            cur.execute(f"INSERT INTO branches (id, name) VALUES ({esc(new_id)}, {esc(body['name'])}) RETURNING id, name")
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1]}
        elif method == 'PUT':
            cur.execute(f"UPDATE branches SET name = {esc(body['name'])} WHERE id = {esc(body['id'])}")
            result = {'ok': True}
        elif method == 'PATCH' or method == 'DELETE':
            cur.execute(f"DELETE FROM branches WHERE id = {esc(body['id'])}")
            result = {'ok': True}

    elif entity == 'users':
        if method == 'POST':
            new_id = str(uuid.uuid4())
            branch_id = body.get('branchId') or None
            password = body.get('password') or ''
            ph = hash_password(password) if password else None
            cur.execute(
                f"INSERT INTO users (id, name, role, branch_id, password_hash) VALUES ({esc(new_id)}, {esc(body['name'])}, {esc(body['role'])}, {esc(branch_id)}, {esc(ph)}) RETURNING id, name, role, branch_id"
            )
            r = cur.fetchone()
            result = {'id': r[0], 'name': r[1], 'role': r[2], 'branchId': r[3]}
        elif method == 'PUT':
            if action == 'password':
                password = body.get('password') or ''
                ph = hash_password(password) if password else None
                cur.execute(f"UPDATE users SET password_hash = {esc(ph)} WHERE id = {esc(body['id'])}")
            else:
                branch_id = body.get('branchId') or None
                cur.execute(
                    f"UPDATE users SET name = {esc(body['name'])}, role = {esc(body['role'])}, branch_id = {esc(branch_id)} WHERE id = {esc(body['id'])}"
                )
            result = {'ok': True}
        elif method == 'PATCH' or method == 'DELETE':
            cur.execute(f"DELETE FROM users WHERE id = {esc(body['id'])}")
            result = {'ok': True}

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(result, ensure_ascii=False),
    }
