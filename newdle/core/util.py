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
