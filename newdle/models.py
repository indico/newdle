from pytz import timezone, utc
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.schema import CheckConstraint

from newdle.core.db import db
from newdle.core.util import UTCDateTime, format_dt, parse_dt


class Newdle(db.Model):
    __tablename__ = 'newdles'

    id = db.Column(db.Integer, primary_key=True)
    creator_uid = db.Column(db.String, nullable=False, index=True)
    title = db.Column(db.String, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    _timezone = db.Column('timezone', db.String, nullable=False)
    _time_slots = db.Column('time_slots', JSONB, nullable=False)
    final_dt = db.Column(UTCDateTime, nullable=True)

    participants = db.relationship(
        'Participant', lazy=True, collection_class=set, back_populates="newdle"
    )

    @property
    def timezone(self):
        return timezone(self._timezone)

    @timezone.setter
    def timezone(self, value):
        self._timezone = value

    @property
    def time_slots(self):
        return [
            {
                'start': self.timezone.localize(parse_dt(ts['start'])).astimezone(utc),
                'end': self.timezone.localize(parse_dt(ts['end'])).astimezone(utc),
            }
            for ts in self._time_slots
        ]

    @time_slots.setter
    def time_slots(self, value):
        self._time_slots = [
            {
                'start': format_dt(ts['start'].astimezone(self.timezone)),
                'end': format_dt(ts['end'].astimezone(self.timezone)),
            }
            for ts in value
        ]

    def __repr__(self):
        return "<Newdle {} {}>".format(self.id, 'F' if self.final_dt else '')


class Participant(db.Model):
    __tablename__ = 'participants'
    __table_args__ = (
        CheckConstraint('(email IS NULL) = (auth_uid IS NULL)', 'email_uid_null'),
    )

    id = db.Column(db.Integer, primary_key=True)
    auth_uid = db.Column(db.String, nullable=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=True)
    answers = db.Column(JSONB, nullable=True)
    newdle_id = db.Column(
        db.Integer, db.ForeignKey('newdles.id'), nullable=False, index=True
    )

    newdle = db.relationship('Newdle', lazy=True, back_populates="participants")

    def __repr__(self):
        return "<Participant {}: {}{}>".format(
            self.id, self.name, ' ({})'.format(self.email) if self.email else ''
        )
