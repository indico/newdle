from datetime import datetime, time, timedelta
from itertools import chain
from random import Random

import pytz

from ...core.util import find_overlap


def fetch_free_busy(date, tz, uid):
    # We have to include the day before/after since we may end up needing data
    # from those days depending on the timezone
    free_busy = list(
        chain.from_iterable(
            _generate_free_busy(date + timedelta(days=offset), uid)
            for offset in (-1, 0, 1)
        )
    )

    tzinfo = pytz.timezone(tz)
    res = []
    for (start, end) in free_busy:
        overlap = find_overlap(date, start, end, tzinfo)
        if overlap:
            res.append(
                (
                    (overlap[0].hour, overlap[0].minute),
                    (overlap[1].hour, overlap[1].minute),
                )
            )
    return res


def _generate_free_busy(date, uid):
    rnd = Random(date.isoformat() + uid)
    if rnd.randint(0, 1):
        start = rnd.randint(4, 19)
        end = rnd.randint(start + 1, 21)
        start_dt = pytz.utc.localize(datetime.combine(date, time(start)))
        end_dt = pytz.utc.localize(datetime.combine(date, time(end)))
        return [(start_dt, end_dt)]
    else:
        start = rnd.randint(5, 8)
        end = rnd.randint(start + 1, start + 3)
        start2 = rnd.randint(12, 14)
        end2 = rnd.randint(start2 + 1, start2 + 5)
        start_dt = pytz.utc.localize(
            datetime.combine(date, time(start, 30 * rnd.randint(0, 1)))
        )
        end_dt = pytz.utc.localize(
            datetime.combine(date, time(end, 30 * rnd.randint(0, 1)))
        )
        start_dt2 = pytz.utc.localize(
            datetime.combine(date, time(start2, 15 * rnd.randint(0, 1)))
        )
        end_dt2 = pytz.utc.localize(datetime.combine(date, time(end2)))
        return [(start_dt, end_dt), (start_dt2, end_dt2)]
