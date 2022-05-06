from datetime import datetime

from newdle.answers import validate_answers
from newdle.models import Availability, Participant


def test_validate_answers(db_session, dummy_newdle):
    dummy_newdle.timeslots = [
        datetime.fromisoformat('2022-05-05T10:00:00'),
        datetime.fromisoformat('2022-05-06T10:00:00'),
        datetime.fromisoformat('2022-05-07T10:00:00'),
        datetime.fromisoformat('2022-05-08T10:00:00'),
    ]
    db_session.commit()

    participant = Participant(
        name='John Doe',
        email='john.doe@cern.ch',
        auth_uid='1234',
        answers={
            dummy_newdle.timeslots[0]: Availability.available,
            dummy_newdle.timeslots[1]: Availability.ifneedbe,
            dummy_newdle.timeslots[2]: Availability.unavailable,
        },
    )
    dummy_newdle.participants.add(participant)
    dummy_newdle.update_lastmod()
    db_session.commit()

    # nonexistent timeslot
    answers = {
        datetime.fromisoformat('1958-05-05T10:00:00'): Availability.available,
    }

    err = validate_answers(dummy_newdle, participant, answers)
    assert err is not None

    answers = {
        dummy_newdle.timeslots[3]: Availability.available,
    }

    err = validate_answers(dummy_newdle, participant, answers)
    assert err is None


def test_validate_answers_limited_slots(db_session, dummy_newdle):
    dummy_newdle.timeslots = [
        datetime.fromisoformat('2022-05-05T10:00:00'),
        datetime.fromisoformat('2022-05-06T10:00:00'),
        datetime.fromisoformat('2022-05-07T10:00:00'),
        datetime.fromisoformat('2022-05-08T10:00:00'),
    ]
    dummy_newdle.limited_slots = True
    db_session.commit()

    john = Participant(
        name='John Doe',
        email='john.doe@cern.ch',
        auth_uid='1234',
        answers={
            dummy_newdle.timeslots[0]: Availability.available,
        },
    )
    amy = Participant(
        name='Amy Wang',
        email='amy.wang@cern.ch',
        auth_uid='5678',
        answers={
            dummy_newdle.timeslots[1]: Availability.available,
        },
    )
    dummy_newdle.participants.add(john)
    dummy_newdle.participants.add(amy)
    dummy_newdle.update_lastmod()
    db_session.commit()

    answers = {
        dummy_newdle.timeslots[2]: Availability.ifneedbe,
        dummy_newdle.timeslots[3]: Availability.available,
    }
    # 'ifneedbe' is not allowed
    err = validate_answers(dummy_newdle, john, answers)
    assert err is not None

    answers = {
        dummy_newdle.timeslots[2]: Availability.available,
        dummy_newdle.timeslots[3]: Availability.available,
    }
    # cannot have multiple 'available'
    err = validate_answers(dummy_newdle, john, answers)
    assert err is not None

    answers = {
        dummy_newdle.timeslots[1]: Availability.available,
    }
    # timeslot already taken
    err = validate_answers(dummy_newdle, john, answers)
    assert err is not None
    assert err['code'] == 409

    answers = {
        dummy_newdle.timeslots[3]: Availability.available,
    }
    err = validate_answers(dummy_newdle, john, answers)
    assert err is None

    answers = {
        dummy_newdle.timeslots[3]: Availability.unavailable,
    }
    # No 'available' answer is also possible
    err = validate_answers(dummy_newdle, john, answers)
    assert err is None
