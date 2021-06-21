from datetime import datetime, time, timedelta

import pytz
from exchangelib import NTLM, Account, Configuration, Credentials
from exchangelib.errors import (
    ErrorMailRecipientNotFound,
    ErrorNoFreeBusyAccess,
    ErrorProxyRequestProcessingFailed,
)
from flask import current_app

from ...core.util import find_overlap


TYPE_MAP = {'Busy': 'busy', 'Tentative': 'busy', 'OOF': 'busy'}

# These are deprecated North American timezones which are still in common use.
# Exchange doesn't like them, so we have to map them to their standard names.
# Mapping taken from https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
NON_STANDARD_TZS = {
    'US/Eastern': 'America/New_York',
    'US/Pacific': 'America/Los_Angeles',
    'US/Mountain': 'America/Denver',
    'US/Central': 'America/Chicago',
    'US/Arizona': 'America/Phoenix',
    'US/Hawaii': 'Pacific/Honolulu',
    'US/Alaska': 'America/Anchorage',
    'Canada/Newfoundland': 'America/St_Johns',
    'Canada/Atlantic': 'America/Halifax',
    'Canada/Eastern': 'America/Toronto',
    'Canada/Central': 'America/Winnipeg',
    'Canada/Mountain': 'America/Edmonton',
    'Canada/Pacific': 'America/Vancouver',
}


def fetch_free_busy(date, tz, uid, email):
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

    if tz in NON_STANDARD_TZS:
        tz = NON_STANDARD_TZS[tz]

    tzinfo = pytz.timezone(tz)
    account_tz = uid_account.default_timezone
    # query the Exchange service using the account's timezone
    start = tzinfo.localize(datetime.combine(date, time.min)).astimezone(account_tz)
    end = start + timedelta(hours=24)

    results = []

    try:
        info = uid_account.protocol.get_free_busy_info(
            accounts=accounts, start=start, end=end
        )

        for busy_info in info:
            if busy_info.view_type == 'FreeBusyMerged':
                for event in busy_info.calendar_events or []:
                    overlap = find_overlap(
                        date,
                        account_tz.localize(event.start),
                        account_tz.localize(event.end),
                        tzinfo,
                    )
                    if event.busy_type in {'Busy', 'Tentative', 'OOF'} and overlap:
                        results.append(overlap)
    except (
        ErrorProxyRequestProcessingFailed,
        ErrorMailRecipientNotFound,
        ErrorNoFreeBusyAccess,
    ):
        # mailbox (probably) doesn't exist
        return []

    return [
        ((start.hour, start.minute), (end.hour, end.minute)) for start, end in results
    ]
