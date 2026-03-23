"""
Получение всех справочных данных CRM: пользователи, филиалы, каналы, источники.
"""
import json
import os
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("SELECT id, name FROM branches ORDER BY name")
    branches = [{'id': r[0], 'name': r[1]} for r in cur.fetchall()]

    cur.execute("SELECT id, name, role, branch_id FROM users ORDER BY name")
    users = [{'id': r[0], 'name': r[1], 'role': r[2], 'branchId': r[3]} for r in cur.fetchall()]

    cur.execute("SELECT id, name, active FROM channels ORDER BY name")
    channels = [{'id': r[0], 'name': r[1], 'active': r[2]} for r in cur.fetchall()]

    cur.execute("SELECT id, name, active FROM ad_sources ORDER BY name")
    ad_sources = [{'id': r[0], 'name': r[1], 'active': r[2]} for r in cur.fetchall()]

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'branches': branches,
            'users': users,
            'channels': channels,
            'adSources': ad_sources,
        }, ensure_ascii=False),
    }
