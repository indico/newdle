import random
from datetime import datetime
from enum import auto

from flask import current_app
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, insert
from sqlalchemy.event import listens_for
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import CheckConstraint

from .core.db import db
from .core.util import AutoNameEnum, format_dt, parse_dt


CODE_ALPHABET = '23456789bcdfghjkmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ'


def generate_random_code(column):
    code_length = current_app.config['NEWDLE_CODE_LENGTH']
    while True:
        candidate = ''.join(random.choices(CODE_ALPHABET, k=code_length))
        # very unlikely that we get a collision, but it's a quick check
        if not db.session.query(column).filter(column == candidate).count():
            return candidate


def generate_random_newdle_code():
    """Generate a random newdle code, based on a restricted alphabet."""
    return generate_random_code(Newdle.code)


def generate_random_participant_code():
    """Generate a random participant code, based on a restricted alphabet."""
    return generate_random_code(Participant.code)


class Newdle(db.Model):
    __tablename__ = 'newdles'

    id = db.Column(db.Integer, primary_key=True)
    creator_uid = db.Column(db.String, nullable=False, index=True)
    creator_name = db.Column(db.String, nullable=False)
    creator_email = db.Column(db.String, nullable=False, server_default='')
    title = db.Column(db.String, nullable=False)
    duration = db.Column(db.Interval, nullable=False)
    timezone = db.Column(db.String, nullable=False)
    timeslots = db.Column(ARRAY(db.DateTime()), nullable=False)
    limited_slots = db.Column(db.Boolean, nullable=False, server_default='false')
    final_dt = db.Column(db.DateTime(), nullable=True)
    deletion_dt = db.Column(db.DateTime(), nullable=True)
    last_update = db.Column(
        db.DateTime(),
        nullable=False,
        default=datetime.utcnow,
        server_default=db.text("(now() at time zone 'utc')::timestamp"),
    )
    private = db.Column(
        db.Boolean, nullable=False, default=False, server_default='false'
    )
    notify = db.Column(
        db.Boolean, nullable=False, default=False, server_default='false'
    )
    code = db.Column(
        db.String,
        nullable=False,
        index=True,
        default=generate_random_newdle_code,
        unique=True,
    )

    participants = db.relationship(
        'Participant',
        lazy=True,
        collection_class=set,
        back_populates='newdle',
        cascade='all, delete-orphan',
    )

    @hybrid_property
    def deleted(self):
        return self.deletion_dt is not None

    @deleted.expression
    def deleted(cls):
        return cls.deletion_dt.isnot(None)

    @deleted.setter
    def deleted(self, value):
        self.deletion_dt = datetime.utcnow() if value else None

    def update_lastmod(self):
        """Set the last_update time of the newdle to the current time."""
        self.last_update = datetime.utcnow()

    @property
    def available_timeslots(self):
        """Get the list of timeslots for which no one has answered with 'available'."""
        if not self.limited_slots:
            return self.timeslots

        used_slots = {
            slot
            for p in self.participants
            for slot, answer in p.answers.items()
            if answer == Availability.available
        }
        return sorted(set(self.timeslots) - used_slots)

    def __repr__(self):
        return '<Newdle {}{}: "{}">'.format(
            self.id, ' F' if self.final_dt else '', self.title
        )


@listens_for(Newdle.timeslots, 'set', named=True, retval=True)
def _sort_newdle_timeslots(value, **kw):
    return sorted(value)


class Participant(db.Model):
    __tablename__ = 'participants'
    __table_args__ = (
        CheckConstraint('(email IS NULL) = (auth_uid IS NULL)', 'email_uid_null'),
    )

    id = db.Column(db.Integer, primary_key=True)
    auth_uid = db.Column(db.String, nullable=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=True)
    code = db.Column(
        db.String,
        nullable=False,
        index=True,
        default=generate_random_participant_code,
        unique=True,
    )
    _answers = db.Column('answers', JSONB, nullable=True, default={})
    comment = db.Column(
        'comment', db.String, nullable=False, default='', server_default=''
    )
    newdle_id = db.Column(
        db.Integer, db.ForeignKey('newdles.id'), nullable=False, index=True
    )

    newdle = db.relationship('Newdle', lazy=True, back_populates='participants')

    @hybrid_property
    def answers(self):
        return {parse_dt(k): Availability[v] for k, v in sorted(self._answers.items())}

    @answers.expression
    def answers(cls):
        return cls._answers

    @answers.setter
    def answers(self, value):
        self._answers = {format_dt(k): v.name for k, v in value.items()}

    def __repr__(self):
        return '<Participant {}: {}{}>'.format(
            self.id, self.name, ' ({})'.format(self.email) if self.email else ''
        )


class Availability(AutoNameEnum):
    unavailable = auto()
    available = auto()
    ifneedbe = auto()


class StatKey(AutoNameEnum):
    newdles_created = auto()
    participants_created = auto()


class Stats(db.Model):
    __tablename__ = 'stats'

    key = db.Column(db.String, primary_key=True)
    value = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<Stats({self.key}): {self.value}>'

    @classmethod
    def get_value(cls, key: StatKey):
        key = key.name
        obj = cls.query.get(key)
        return obj.value if obj else 0

    @classmethod
    def increment(cls, key: StatKey, n: int = 1):
        key = key.name
        db.session.execute(
            insert(cls)
            .values(key=key, value=n)
            .on_conflict_do_update(
                index_elements=['key'], set_={'value': cls.value + n}
            )
        )
        obj = cls.query.get(key)
        if obj is not None:
            # the session doesn't know about on_conflict_do_update
            db.session.expire(obj)
