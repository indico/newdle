from datetime import datetime, timedelta

import pytest
from flask import current_app

from newdle.models import Newdle, Participant, generate_random_newdle_code


def test_create_newdle(dummy_newdle):
    newdle = Newdle.query.get(dummy_newdle.id)
    assert newdle.final_dt is None


def test_set_newdle_final(dummy_newdle, db_session):
    newdle = Newdle.query.get(dummy_newdle.id)
    newdle.final_dt = datetime(2020, 1, 1, 10, 0, 0)
    db_session.flush()

    # let's also check that the timezones work well
    assert newdle.final_dt == datetime(2020, 1, 1, 10, 0, 0)


def test_create_participant(dummy_newdle, db_session):
    dummy_newdle.participants.clear()
    participant = Participant(name='John Doe', newdle=dummy_newdle)
    db_session.add(participant)
    db_session.flush()

    participant = Participant.query.get(participant.id)
    assert participant.newdle == dummy_newdle
    assert dummy_newdle.participants == {participant}


def test_newdle_timeslots(dummy_newdle, db_session):
    dummy_newdle.timeslots = [
        datetime(2012, 11, 20, 12, 0),
        datetime(2012, 11, 20, 10, 0),
    ]
    db_session.flush()

    newdle = Newdle.query.get(dummy_newdle.id)
    assert newdle.timeslots == [
        datetime(2012, 11, 20, 10, 0),
        datetime(2012, 11, 20, 12, 0),
    ]


def test_participant_email_uid(dummy_newdle, db_session):
    participant = Participant(
        name='John Doe', email='john@example.com', auth_uid='john', newdle=dummy_newdle
    )
    db_session.add(participant)
    db_session.flush()

    participant = Participant(name='Paul Doe', newdle=dummy_newdle)
    db_session.add(participant)
    db_session.flush()

    participant = Participant(name='Jane Doe', auth_uid='jane', newdle=dummy_newdle)
    db_session.add(participant)
    with pytest.raises(Exception) as e:
        db_session.flush()
    assert 'violates check constraint' in str(e.value)


def test_code_generation(db_session, monkeypatch):
    newdle = Newdle(
        title='foo',
        creator_uid='bar',
        creator_name='Dummy',
        duration=timedelta(minutes=30),
        timezone='Europe/Zurich',
        timeslots=[],
    )
    db_session.add(newdle)
    db_session.flush()

    assert len(newdle.code) == 8
    current_app.config['NEWDLE_CODE_LENGTH'] = 16
    assert len(generate_random_newdle_code()) == 16

    db_session.flush()

    # simulate a situation in which there is a collision with the code
    # of an existing newdle
    class _MockRandom(object):
        def __init__(self):
            self.collision = True

        def __call__(self, pop, k=1):
            if self.collision:
                self.collision = False
                return newdle.code
            return 'something else'

    mock_random = _MockRandom()
    from newdle.models import random as _random

    monkeypatch.setattr(_random, 'choices', mock_random)
    assert generate_random_newdle_code() == 'something else'
