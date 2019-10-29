from datetime import datetime, timedelta
from operator import itemgetter

import pytest
from flask import url_for

from newdle.core.auth import app_token_from_id_token
from newdle.models import Newdle, Participant


def make_test_auth(uid):
    token = app_token_from_id_token(
        {
            'email': 'example@example.com',
            'given_name': 'Guinea',
            'family_name': 'Pig',
            'sub': uid,
        }
    )
    return {'headers': {'Authorization': f'Bearer {token}'}}


def test_me(flask_client, dummy_uid):
    resp = flask_client.get(url_for('api.me'), **make_test_auth(dummy_uid))
    assert resp.status_code == 200
    assert resp.json == {
        'email': 'example@example.com',
        'initials': 'G P',
        'name': 'Guinea Pig',
        'uid': 'user123',
    }


@pytest.mark.usefixtures('db_session')
@pytest.mark.parametrize('with_participants', (False, True))
def test_create_newdle(flask_client, dummy_uid, with_participants):
    assert not Newdle.query.count()
    resp = flask_client.post(
        url_for('api.create_newdle'),
        **make_test_auth(dummy_uid),
        json={
            'title': 'My Newdle',
            'duration': 120,
            'timezone': 'Europe/Zurich',
            'timeslots': ['2019-09-11T13:00', '2019-09-11T15:00'],
            'participants': [
                {
                    'name': 'Guinea Pig',
                    'auth_uid': 'guineapig',
                    'email': 'guineapig@example.com',
                    'signature': 'YeJMFxKqMAxdINW23mcuHL0ufsA',
                }
            ]
            if with_participants
            else [],
        },
    )
    assert resp.status_code == 200
    data = resp.json
    id_ = data.pop('id')
    code = data.pop('code')
    del data['url']
    expected_participants = (
        [
            {
                'answers': {},
                'auth_uid': 'guineapig',
                'email': 'guineapig@example.com',
                'name': 'Guinea Pig',
            }
        ]
        if with_participants
        else []
    )
    assert data == {
        'creator_name': 'Guinea Pig',
        'duration': 120,
        'final_dt': None,
        'participants': expected_participants,
        'timeslots': ['2019-09-11T13:00', '2019-09-11T15:00'],
        'timezone': 'Europe/Zurich',
        'title': 'My Newdle',
    }
    newdle = Newdle.query.one()
    assert newdle.id == id_
    assert newdle.code == code
    assert newdle.title == 'My Newdle'
    assert newdle.duration == timedelta(minutes=120)
    assert newdle.timezone == 'Europe/Zurich'
    assert newdle.timeslots == [
        datetime(2019, 9, 11, 13, 0),
        datetime(2019, 9, 11, 15, 0),
    ]
    if with_participants:
        assert len(newdle.participants) == 1
        participant = next(iter(newdle.participants))
        assert participant.name == 'Guinea Pig'
    else:
        assert not newdle.participants


@pytest.mark.usefixtures('db_session')
def test_create_newdle_duplicate_timeslot(flask_client, dummy_uid):
    resp = flask_client.post(
        url_for('api.create_newdle'),
        **make_test_auth(dummy_uid),
        json={
            'title': 'My Newdle',
            'duration': 120,
            'timezone': 'Europe/Zurich',
            'timeslots': ['2019-09-11T13:00', '2019-09-11T13:00'],
        },
    )
    assert resp.status_code == 422
    assert resp.json == {
        'error': 'invalid_args',
        'messages': {'timeslots': ['Time slots are not unique']},
    }


@pytest.mark.usefixtures('db_session')
def test_create_newdle_participant_email_sending(flask_client, dummy_uid, mail_queue):
    resp = flask_client.post(
        url_for('api.create_newdle'),
        **make_test_auth(dummy_uid),
        json={
            'title': 'My Newdle',
            'duration': 120,
            'timezone': 'Europe/Zurich',
            'timeslots': ['2019-09-11T13:00'],
            'participants': [
                {
                    'name': 'Guinea Pig',
                    'email': 'guineapig@example.com',
                    'auth_uid': 'guineapig',
                    'signature': 'YeJMFxKqMAxdINW23mcuHL0ufsA',
                }
            ],
        },
    )
    assert len(mail_queue) == 1
    assert resp.status_code == 200


@pytest.mark.usefixtures('db_session')
def test_create_newdle_participant_signing(flask_client, dummy_uid):
    resp = flask_client.post(
        url_for('api.create_newdle'),
        **make_test_auth(dummy_uid),
        json={
            'title': 'My Newdle',
            'duration': 120,
            'timezone': 'Europe/Zurich',
            'timeslots': ['2019-09-11T13:00'],
            'participants': [
                {
                    'name': 'Guinea Pig',
                    'email': 'guineabunny@example.com',
                    'auth_uid': 'guineapig',
                    'signature': 'YeJMFxKqMAxdINW23mcuHL0ufsA',
                }
            ],
        },
    )
    assert resp.status_code == 422


@pytest.mark.usefixtures('db_session')
def test_create_newdle_invalid(flask_client, dummy_uid):
    resp = flask_client.post(
        url_for('api.create_newdle'), **make_test_auth(dummy_uid), json={}
    )
    assert resp.status_code == 422
    assert resp.json == {
        'error': 'invalid_args',
        'messages': {
            'duration': ['Missing data for required field.'],
            'timeslots': ['Missing data for required field.'],
            'timezone': ['Missing data for required field.'],
            'title': ['Missing data for required field.'],
        },
    }


@pytest.mark.usefixtures('dummy_newdle')
def test_get_newdle_invalid(flask_client):
    assert Newdle.query.count()
    resp = flask_client.get(url_for('api.get_newdle', code='xxx'))
    assert resp.status_code == 404
    assert resp.json == {'error': 'Specified newdle does not exist'}


@pytest.mark.usefixtures('db_session')
@pytest.mark.parametrize('use_auth', (False, True))
def test_get_newdle_restricted(flask_client, dummy_newdle, use_auth):
    auth = make_test_auth('someone') if use_auth else {}
    resp = flask_client.get(url_for('api.get_newdle', code='dummy'), **auth)
    assert resp.status_code == 200
    assert resp.json == {
        'code': 'dummy',
        'creator_name': 'Dummy',
        'duration': 60,
        'final_dt': None,
        'id': dummy_newdle.id,
        'timeslots': [
            '2019-09-11T13:00',
            '2019-09-11T14:00',
            '2019-09-12T13:00',
            '2019-09-12T13:30',
        ],
        'timezone': 'Europe/Zurich',
        'title': 'Test event',
        'url': 'http://flask.test/newdle/dummy',
    }


@pytest.mark.usefixtures('db_session')
def test_get_newdle_full(flask_client, dummy_newdle, dummy_uid):
    resp = flask_client.get(
        url_for('api.get_newdle', code='dummy'), **make_test_auth(dummy_uid)
    )
    assert resp.status_code == 200
    data = resp.json
    participants = sorted(data.pop('participants'), key=itemgetter('name'))
    assert data == {
        'code': 'dummy',
        'creator_name': 'Dummy',
        'duration': 60,
        'final_dt': None,
        'id': dummy_newdle.id,
        'timeslots': [
            '2019-09-11T13:00',
            '2019-09-11T14:00',
            '2019-09-12T13:00',
            '2019-09-12T13:30',
        ],
        'timezone': 'Europe/Zurich',
        'title': 'Test event',
        'url': 'http://flask.test/newdle/dummy',
    }
    assert participants == [
        {'answers': {}, 'auth_uid': None, 'email': None, 'name': 'Albert Einstein'},
        {
            'answers': {},
            'auth_uid': 'pig',
            'email': 'example@example.com',
            'name': 'Guinea Pig',
        },
        {'answers': {}, 'auth_uid': None, 'email': None, 'name': 'Tony Stark'},
    ]


@pytest.mark.usefixtures('dummy_newdle')
@pytest.mark.parametrize(
    'codes', (('xxx', 'dummy'), ('xxx', 'part1'), ('dummy', 'xxx'))
)
def test_get_participant_invalid(flask_client, codes):
    assert Newdle.query.count()
    assert Participant.query.count()
    resp = flask_client.get(
        url_for('api.get_participant', code=codes[0], participant_code=codes[1])
    )
    assert resp.status_code == 404
    assert resp.json == {'error': 'Specified participant does not exist'}


@pytest.mark.usefixtures('dummy_newdle')
def test_get_participant(flask_client):
    resp = flask_client.get(
        url_for('api.get_participant', code='dummy', participant_code='part1')
    )
    assert resp.status_code == 200
    assert resp.json == {
        'answers': {},
        'auth_uid': None,
        'email': None,
        'name': 'Tony Stark',
        'code': 'part1',
    }


@pytest.mark.usefixtures('dummy_newdle')
def test_update_participant_empty(flask_client):
    resp = flask_client.patch(
        url_for('api.update_participant', code='dummy', participant_code='part1')
    )
    assert resp.status_code == 200
    assert resp.json == {
        'answers': {},
        'auth_uid': None,
        'email': None,
        'name': 'Tony Stark',
        'code': 'part1',
    }


@pytest.mark.usefixtures('dummy_newdle')
def test_update_participant_answers_invalid(flask_client):
    resp = flask_client.patch(
        url_for('api.update_participant', code='dummy', participant_code='part1'),
        json={'answers': {'foo': 'bar'}},
    )
    assert resp.status_code == 422
    assert resp.json == {
        'error': 'invalid_args',
        'messages': {
            'answers': {
                'foo': {
                    'key': ['Not a valid datetime.'],
                    'value': ['Invalid enum member bar'],
                }
            }
        },
    }


@pytest.mark.usefixtures('dummy_newdle')
def test_update_participant_answers_invalid_slots(flask_client):
    resp = flask_client.patch(
        url_for('api.update_participant', code='dummy', participant_code='part1'),
        json={'answers': {'2019-09-11T10:00': 'available'}},
    )
    assert resp.status_code == 422
    assert resp.json == {
        'error': 'invalid_args',
        'messages': {'answers': {'2019-09-11T10:00': {'key': ['Invalid timeslot']}}},
    }


@pytest.mark.usefixtures('dummy_newdle')
def test_update_participant_answers_valid_slots(flask_client):
    resp = flask_client.patch(
        url_for('api.update_participant', code='dummy', participant_code='part1'),
        json={
            'answers': {
                '2019-09-11T13:00': 'available',
                '2019-09-12T13:00': 'unavailable',
                '2019-09-11T14:00': 'ifneedbe',
            }
        },
    )
    assert resp.status_code == 200
    assert resp.json == {
        'answers': {
            '2019-09-11T13:00': 'available',
            '2019-09-11T14:00': 'ifneedbe',
            '2019-09-12T13:00': 'unavailable',
        },
        'auth_uid': None,
        'email': None,
        'name': 'Tony Stark',
        'code': 'part1',
    }
