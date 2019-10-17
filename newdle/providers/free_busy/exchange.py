from datetime import datetime, time, timedelta

from exchangelib import NTLM, Account, Configuration, Credentials
from exchangelib.errors import (
    ErrorMailRecipientNotFound,
    ErrorProxyRequestProcessingFailed,
)
from flask import current_app
from pytz import utc


TYPE_MAP = {'Busy': 'busy', 'Tentative': 'busy', 'OOF': 'busy'}


def find_overlap(day, start, end):
    """Find the overlap of a day with a datetime range."""
    latest_start = max(datetime.combine(day, time.min), start)
    earliest_end = min(datetime.combine(day, time.max), end)
    diff = (earliest_end - latest_start).days + 1
    if diff > 0:
        return latest_start.time(), earliest_end.time()
    return None


def fetch_free_busy(date, uid):
    acc = current_app.config['EXCHANGE_PROVIDER_ACCOUNT']
    creds = current_app.config['EXCHANGE_PROVIDER_CREDENTIALS']
    server = current_app.config['EXCHANGE_PROVIDER_SERVER']
    domain = current_app.config['EXCHANGE_DOMAIN']

    if not creds or not server or not domain:
        raise RuntimeError('Exchange provider not configured!')

    credentials = Credentials(*creds)
    configuration = Configuration(
        server=server, auth_type=NTLM, credentials=credentials
    )

    uid_account = Account(acc, config=configuration, autodiscover=False)
    accounts = [
        (uid_account, 'Organizer', False),
        (
            Account(f'{uid}@{domain}', autodiscover=False, config=configuration),
            'Optional',
            False,
        ),
    ]

    tz = uid_account.default_timezone
    start = utc.localize(datetime.combine(date, time.min)).astimezone(tz)
    end = start + timedelta(hours=24)

    results = []

    try:
        info = uid_account.protocol.get_free_busy_info(
            accounts=accounts, start=start, end=end
        )

        for busy_info in info:
            if busy_info.view_type == 'FreeBusyMerged':
                for event in busy_info.calendar_events or []:
                    overlap = find_overlap(date, event.start, event.end)
                    if event.busy_type in {'Busy', 'Tentative', 'OOF'} and overlap:
                        results.append(overlap)
    except (ErrorProxyRequestProcessingFailed, ErrorMailRecipientNotFound):
        # mailbox (probably) doesn't exist
        return []

    return [
        ((start.hour, start.minute), (end.hour, end.minute)) for start, end in results
    ]
