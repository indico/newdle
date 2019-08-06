from datetime import datetime

import pytest
from pytz import timezone, utc

from newdle.models import Newdle, Participant


@pytest.fixture
def dummy_newdle(db_session):
    newdle = Newdle(title='Test event', creator_uid='foo1234', duration=30, timezone='Europe/Zurich', time_slots=[])
    db_session.add(newdle)
    db_session.flush()
    return newdle


def test_create_newdle(dummy_newdle):
    newdle = Newdle.query.get(dummy_newdle.id)
    assert newdle.final_dt is None


def test_set_newdle_final(dummy_newdle, db_session):
    newdle = Newdle.query.get(dummy_newdle.id)
    local_tz = timezone('Europe/Zurich')
    newdle.final_dt = local_tz.localize(datetime(2020, 1, 1, 10, 0, 0))
    db_session.flush()

    # let's also check that the timezones work well
    assert newdle.final_dt == utc.localize(datetime(2020, 1, 1, 9, 0, 0))


def test_create_participant(dummy_newdle, db_session):
    participant = Participant(name='John Doe', newdle=dummy_newdle)
    db_session.add(participant)
    db_session.flush()

    participant = Participant.query.get(participant.id)
    assert participant.newdle == dummy_newdle
    assert dummy_newdle.participants == {participant}


def test_newdle_time_slots(dummy_newdle, db_session):
    dummy_newdle.time_slots = [{
        'start': utc.localize(datetime(2012, 11, 20, 10, 00)),
        'end': timezone('Europe/Zurich').localize(datetime(2012, 11, 20, 12, 00))
    }]
    db_session.flush()

    newdle = Newdle.query.get(dummy_newdle.id)
    assert newdle.time_slots == [{
        'start': utc.localize(datetime(2012, 11, 20, 10, 00)),
        'end': utc.localize(datetime(2012, 11, 20, 11, 00))
    }]

def test_participant_email_uid(dummy_newdle, db_session):
    participant = Participant(name='John Doe', email='john@example.com', auth_uid='john', newdle=dummy_newdle)
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
