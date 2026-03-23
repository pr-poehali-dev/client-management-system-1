"""
Авторизация сотрудника по id и паролю.
POST {userId, password} -> {ok: true, user: {...}} или {ok: false, error: '...'}
"""
import json
import os
import hashlib
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    user_id = body.get('userId', '')
    password = body.get('password', '')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(
        "SELECT id, name, role, branch_id, password_hash FROM users WHERE id = %s AND role != 'deleted'",
        (user_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': False, 'error': 'Пользователь не найден'}, ensure_ascii=False),
        }

    uid, name, role, branch_id, password_hash = row

    if password_hash is None:
        if role == 'director':
            user = {'id': uid, 'name': name, 'role': role, 'branchId': branch_id}
            return {
                'statusCode': 200,
                'headers': {**CORS, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'user': user}, ensure_ascii=False),
            }
        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': False, 'error': 'Пароль не установлен. Обратитесь к управляющему.'}, ensure_ascii=False),
        }

    if hash_password(password) != password_hash:
        return {
            'statusCode': 200,
            'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': False, 'error': 'Неверный пароль'}, ensure_ascii=False),
        }

    user = {'id': uid, 'name': name, 'role': role, 'branchId': branch_id}
    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'user': user}, ensure_ascii=False),
    }