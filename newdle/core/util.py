import re
from datetime import datetime, time
from enum import Enum
from io import BytesIO

from flask import current_app, render_template, send_file
from itsdangerous import BadData, Signer, URLSafeSerializer, URLSafeTimedSerializer
from werkzeug.local import LocalProxy

DATE_FORMAT = '%Y-%m-%d'
DATETIME_FORMAT = '%Y-%m-%dT%H:%M'

secure_serializer = LocalProxy(
    lambda: URLSafeSerializer(current_app.config['SECRET_KEY'], b'newdle')
)

secure_timed_serializer = LocalProxy(
    lambda: URLSafeTimedSerializer(current_app.config['SECRET_KEY'], b'newdle')
)


class AutoNameEnum(Enum):
    @staticmethod
    def _generate_next_value_(name, start, count, last_values):
        return name


def parse_dt(text):
    return datetime.strptime(text, DATETIME_FORMAT)


def format_dt(dt):
    return dt.strftime(DATETIME_FORMAT)


def change_dt_timezone(dt, from_tz, to_tz):
    return from_tz.localize(dt).astimezone(to_tz)


def range_union(ranges):
    """Take a list of (H, M) tuples and merge any overlapping intervals."""
    results = []
    # tuples are sorted in increasing order, so we are sure we always have
    # the "latest" end time at the back of the list
    for start, end in sorted(ranges):
        last_end_time = results[-1] if results else None
        # if the next start time is earlier than the latest end time, then
        # we can merge the intervals
        if last_end_time and start <= last_end_time[1]:
            results[-1] = (last_end_time[0], max(last_end_time[1], end))
        else:
            results.append((start, end))
    return results


def _get_signature_source_bytes(data, fields=None):
    if fields:
        data = {k: v for k, v in data.items() if k in fields}
    return '-'.join(v for k, v in sorted(data.items())).encode()


def sign_user(user_data, fields=None):
    """Sign user data."""
    signer = Signer(current_app.config['SECRET_KEY'], salt='newdle-users')
    return dict(
        user_data,
        signature=signer.get_signature(
            _get_signature_source_bytes(user_data, fields)
        ).decode('ascii'),
    )


def check_user_signature(user_data, signature, fields=None):
    """Check that user data matches the signature."""
    signer = Signer(current_app.config['SECRET_KEY'], salt='newdle-users')
    return signer.verify_signature(
        _get_signature_source_bytes(user_data, fields), signature.encode('ascii')
    )


def find_overlap(day, start, end, tz):
    """Find the overlap of a day with a datetime range.

    :param day: the day to calculate overlap for (00:00 - 23:59)
    :param start: the start ``datetime`` of the range (tz-aware)
    :param end: the end ``datetime`` of the range (tz-aware)
    :param tz: the timezone of reference
    """
    latest_start = max(
        tz.localize(datetime.combine(day, time.min)), start.astimezone(tz)
    )
    earliest_end = min(tz.localize(datetime.combine(day, time.max)), end.astimezone(tz))
    diff = (earliest_end - latest_start).days + 1
    if diff > 0:
        return latest_start.time(), earliest_end.time()
    return None


def dedent(value, *, _re=re.compile(r'^ +', re.MULTILINE)):
    """Remove leading whitespace from each line."""
    return _re.sub('', value)


def render_user_avatar(initial, size):
    avatar = render_template('avatar.svg', text=initial.upper(), size=size)
    return send_file(BytesIO(avatar.encode()), mimetype='image/svg+xml')


def avatar_payload_from_user_info(user_info):
    initial = user_info['name'][0].upper() if user_info['name'] else '?'
    return secure_serializer.dumps(
        {
            'email': user_info['email'],
            'initial': initial,
        },
        salt='avatar-payload',
    )


def avatar_payload_from_participant(participant):
    initial = participant.name[0].upper() if participant.name else '?'
    return secure_serializer.dumps(
        {
            'email': participant.email,
            'initial': initial,
        },
        salt='avatar-payload',
    )


def avatar_info_from_payload(payload):
    try:
        return secure_serializer.loads(payload, salt='avatar-payload')
    except BadData:
        return None
