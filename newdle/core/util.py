from datetime import datetime
from enum import Enum


DATE_FORMAT = '%Y-%m-%d'
DATETIME_FORMAT = '%Y-%m-%dT%H:%M'


class AutoNameEnum(Enum):
    def _generate_next_value_(name, start, count, last_values):
        return name


def parse_dt(text):
    return datetime.strptime(text, DATETIME_FORMAT)


def format_dt(dt):
    return dt.strftime(DATETIME_FORMAT)


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
