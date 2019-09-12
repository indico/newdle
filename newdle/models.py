import random

from flask import current_app
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.event import listens_for
from sqlalchemy.schema import CheckConstraint

from newdle.core.db import db
from newdle.core.util import UTCDateTime


CODE_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-'


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
    title = db.Column(db.String, nullable=False)
    duration = db.Column(db.Interval, nullable=False)
    timezone = db.Column(db.String, nullable=False)
    timeslots = db.Column(ARRAY(db.DateTime()), nullable=False)
    final_dt = db.Column(UTCDateTime, nullable=True)
    code = db.Column(
        db.String,
        nullable=False,
        index=True,
        default=generate_random_newdle_code,
        unique=True,
    )

    participants = db.relationship(
        'Participant', lazy=True, collection_class=set, back_populates='newdle'
    )

    def __repr__(self):
        return '<Newdle {} {}>'.format(self.id, 'F' if self.final_dt else '')


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
    answers = db.Column(JSONB, nullable=True)
    newdle_id = db.Column(
        db.Integer, db.ForeignKey('newdles.id'), nullable=False, index=True
    )

    newdle = db.relationship('Newdle', lazy=True, back_populates='participants')

    def __repr__(self):
        return '<Participant {}: {}{}>'.format(
            self.id, self.name, ' ({})'.format(self.email) if self.email else ''
        )
