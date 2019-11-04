import datetime
from random import Random


def _to_tuple(t):
    return (t.hour, t.minute)


def fetch_free_busy(date, tz, uid):
    rnd = Random(date.isoformat() + uid)
    if rnd.randint(0, 1):
        start = rnd.randint(5, 21)
        end = rnd.randint(start + 1, 23)
        start_time = _to_tuple(datetime.time(start))
        end_time = _to_tuple(datetime.time(end))
        return [[start_time, end_time]]
    else:
        start = rnd.randint(7, 10)
        end = rnd.randint(start + 1, start + 3)
        start2 = rnd.randint(14, 16)
        end2 = rnd.randint(start2 + 1, start2 + 5)
        start_time = _to_tuple(datetime.time(start))
        end_time = _to_tuple(datetime.time(end))
        start_time2 = _to_tuple(datetime.time(start2))
        end_time2 = _to_tuple(datetime.time(end2))
        return [(start_time, end_time), (start_time2, end_time2)]
