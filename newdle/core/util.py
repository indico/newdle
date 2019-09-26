from datetime import datetime
from enum import Enum

import pytz
from sqlalchemy import func, types
from sqlalchemy.sql import operators
from sqlalchemy.sql.sqltypes import Interval
from sqlalchemy.util import memoized_property


DATE_FORMAT = '%Y-%m-%d'
DATETIME_FORMAT = '%Y-%m-%dT%H:%M'


class AutoNameEnum(Enum):
    def _generate_next_value_(name, start, count, last_values):
        return name


def parse_dt(text):
    return datetime.strptime(text, DATETIME_FORMAT)


def format_dt(dt):
    return dt.strftime(DATETIME_FORMAT)
