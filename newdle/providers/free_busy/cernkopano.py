from datetime import datetime

import requests
from flask import current_app


def fetch_free_busy(date, tz, uid):
    api_host = current_app.config.get('CERN_KOPANO_API_HOST')
    api_key = current_app.config.get('CERN_KOPANO_API_KEY')

    if not api_host or not api_key:
        raise RuntimeError('CERN kopano provider not configured!')

    api_host = api_host.rstrip('/')
    api_url = f'{api_host}/indico/{uid}/free-busy/{date}'

    resp = requests.get(
        api_url, params={'timezone': tz}, headers={'Authorization': f'Bearer {api_key}'}
    )
    resp.raise_for_status()
    items = resp.json()
    results = []
    for item in items:
        if item['status'] not in ('busy', 'tentative', 'oof'):
            continue
        start = datetime.fromisoformat(item['start'])
        end = datetime.fromisoformat(item['end'])
        results.append(((start.hour, start.minute), (end.hour, end.minute)))
    return results
