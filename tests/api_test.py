from datetime import date, datetime, timedelta
from operator import attrgetter, itemgetter
from unittest.mock import Mock

import pytest
from flask import url_for
from werkzeug.exceptions import Forbidden

from newdle import api
from newdle.core.auth import app_token_from_multipass
from newdle.models import Newdle, Participant


def make_test_auth(uid):
    mock_identity_info = Mock(
        identifier=uid,
        data={
            'email': 'example@example.com',
            'given_name': 'Guinea',
            'family_name': 'Pig',
        },
    )
    token = app_token_from_multipass(mock_identity_info)
    return {'headers': {'Authorization': f'Bearer {token}'}}


@pytest.mark.usefixtures('dummy_newdle')
def test_stats(flask_client):
    resp = flask_client.get(url_for('api.stats'))
    assert resp.status_code == 200
    assert resp.json == {'newdles': 1, 'participants': 3}


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
    now = datetime.utcnow()
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
            'private': True,
            'notify': True,
        },
    )
    assert resp.status_code == 200
    data = resp.json
    id_ = data.pop('id')
    code = data.pop('code')
    participant_id = data['participants'][0].pop('id') if with_participants else None
    del data['url']
    expected_participants = (
        [
            {
                'answers': {},
                'auth_uid': 'guineapig',
                'email': 'guineapig@example.com',
                'name': 'Guinea Pig',
                'comment': '',
            }
        ]
        if with_participants
        else []
    )
    assert data == {
        'creator_name': 'Guinea Pig',
        'creator_uid': dummy_uid,
        'creator_email': 'example@example.com',
        'duration': 120,
        'final_dt': None,
        'participants': expected_participants,
        'timeslots': ['2019-09-11T13:00', '2019-09-11T15:00'],
        'timezone': 'Europe/Zurich',
        'private': True,
        'notify': True,
        'title': 'My Newdle',
    }
    newdle = Newdle.query.one()
    assert newdle.last_update > now
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
        assert participant.id == participant_id
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
            'private': True,
            'notify': True,
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
            'private': True,
            'notify': True,
        },
    )
    assert len(mail_queue) == 1
    assert resp.status_code == 200


def test_get_busy_times(flask_client, dummy_uid, mocker):
    mocker.patch('newdle.api._get_busy_times', return_value={})
    json = {'date': '2020-09-16', 'tz': 'US/Pacific', 'uid': '17'}

    resp = flask_client.get(
        url_for('api.get_busy_times'), **make_test_auth(dummy_uid), json=json
    )
    assert resp.status_code == 200
    api._get_busy_times.assert_called_once_with(
        date.fromisoformat(json['date']), json['tz'], json['uid']
    )
    api._get_busy_times.reset_mock()

    resp = flask_client.get(url_for('api.get_busy_times'), json=json)
    assert resp.status_code == 401
    api._get_busy_times.assert_not_called()


@pytest.mark.usefixtures('db_session')
@pytest.mark.usefixtures('dummy_newdle')
def test_get_participant_busy_times_current_user(
    flask_client, dummy_uid, dummy_newdle, mocker
):
    mocker.patch('newdle.api._get_busy_times', return_value={})
    json = {'date': '2020-09-22', 'tz': 'US/Pacific'}

    resp = flask_client.get(
        url_for(
            'api.get_participant_busy_times',
            code=dummy_newdle.code,
            participant_code=None,
        ),
        json=json,
    )

    assert resp.status_code == 401
    api._get_busy_times.assert_not_called()
    api._get_busy_times.reset_mock()

    resp = flask_client.get(
        url_for(
            'api.get_participant_busy_times',
            code=dummy_newdle.code,
            participant_code=None,
        ),
        **make_test_auth(dummy_uid),
        json=json,
    )

    assert resp.status_code == 200
    api._get_busy_times.assert_called_once_with(
        date.fromisoformat(json['date']), json['tz'], dummy_uid
    )


@pytest.mark.usefixtures('db_session')
@pytest.mark.usefixtures('dummy_newdle')
def test_get_participant_busy_times(flask_client, dummy_uid, dummy_newdle, mocker):
    mocker.patch('newdle.api._get_busy_times', return_value={})
    json = {'date': '2020-09-22', 'tz': 'US/Pacific'}

    resp = flask_client.get(
        url_for(
            'api.get_participant_busy_times',
            code='invalid_code',
            participant_code='invalid_code',
        ),
        **make_test_auth(dummy_uid),
        json=json,
    )
    assert resp.status_code == 404

    participant = [p for p in dummy_newdle.participants if p.auth_uid is None][0]
    resp = flask_client.get(
        url_for(
            'api.get_participant_busy_times',
            code=dummy_newdle.code,
            participant_code=participant.code,
        ),
        **make_test_auth(dummy_uid),
        json=json,
    )
    assert resp.status_code == 422
    assert (
        resp.json['messages']['participant_code'][0] == 'Participant is an unknown user'
    )

    participant = [p for p in dummy_newdle.participants if p.auth_uid is not None][0]
    resp = flask_client.get(
        url_for(
            'api.get_participant_busy_times',
            code=dummy_newdle.code,
            participant_code=participant.code,
        ),
        **make_test_auth(dummy_uid),
        json=json,
    )
    assert resp.status_code == 422
    assert resp.json['messages']['date'][0] == 'Date has no timeslots'

    json = {'date': dummy_newdle.timeslots[0].strftime('%Y-%m-%d'), 'tz': 'US/Pacific'}
    participant = [p for p in dummy_newdle.participants if p.auth_uid is not None][0]
    resp = flask_client.get(
        url_for(
            'api.get_participant_busy_times',
            code=dummy_newdle.code,
            participant_code=participant.code,
        ),
        **make_test_auth(dummy_uid),
        json=json,
    )
    assert resp.status_code == 200
    api._get_busy_times.assert_called_once_with(
        date.fromisoformat(json['date']), json['tz'], participant.auth_uid
    )
    api._get_busy_times.reset_mock()

    # requesting a different date should return results if there are timeslots
    # on that date after converting to the specified timezone
    json = {'date': '2019-09-13', 'tz': 'Pacific/Tongatapu'}
    resp = flask_client.get(
        url_for(
            'api.get_participant_busy_times',
            code=dummy_newdle.code,
            participant_code=participant.code,
        ),
        **make_test_auth(dummy_uid),
        json=json,
    )
    assert resp.status_code == 200
    api._get_busy_times.assert_called_once_with(
        date.fromisoformat(json['date']), json['tz'], participant.auth_uid
    )
    api._get_busy_times.reset_mock()


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
            'private': ['Missing data for required field.'],
            'notify': ['Missing data for required field.'],
            'timeslots': ['Missing data for required field.'],
            'timezone': ['Missing data for required field.'],
            'title': ['Missing data for required field.'],
        },
    }


@pytest.mark.usefixtures('dummy_newdle')
def test_get_my_newdles(flask_client, dummy_uid, dummy_newdle):
    resp = flask_client.get(url_for('api.get_my_newdles'), **make_test_auth(dummy_uid))
    assert resp.status_code == 200
    assert len(resp.json) == 1
    resp.json[0]['participants'].sort(key=itemgetter('name'))
    ids = [participant.pop('id') for participant in resp.json[0]['participants']]
    assert ids == [
        p.id for p in sorted(dummy_newdle.participants, key=attrgetter('name'))
    ]
    assert resp.json == [
        {
            'code': 'dummy',
            'creator_name': 'Dummy',
            'creator_email': '',
            'creator_uid': dummy_newdle.creator_uid,
            'duration': 60,
            'final_dt': None,
            'id': dummy_newdle.id,
            'participants': [
                {
                    'answers': {},
                    'auth_uid': None,
                    'email': None,
                    'name': 'Albert Einstein',
                    'comment': '',
                },
                {
                    'answers': {},
                    'auth_uid': 'pig',
                    'email': 'example@example.com',
                    'name': 'Guinea Pig',
                    'comment': '',
                },
                {
                    'answers': {},
                    'auth_uid': None,
                    'email': None,
                    'name': 'Tony Stark',
                    'comment': '',
                },
            ],
            'private': True,
            'notify': False,
            'timezone': 'Europe/Zurich',
            'title': 'Test event',
            'url': 'http://flask.test/newdle/dummy',
        }
    ]


@pytest.mark.usefixtures('dummy_newdle')
def test_get_newdle_invalid(flask_client):
    assert Newdle.query.count()
    resp = flask_client.get(url_for('api.get_newdle', code='xxx'))
    assert resp.status_code == 404
    assert resp.json == {'error': 'Specified newdle does not exist'}


@pytest.mark.usefixtures('db_session')
def test_get_newdle(flask_client, dummy_newdle):
    resp = flask_client.get(url_for('api.get_newdle', code='dummy'))
    assert resp.status_code == 200
    assert resp.json == {
        'code': 'dummy',
        'creator_name': 'Dummy',
        'creator_email': '',
        'creator_uid': dummy_newdle.creator_uid,
        'duration': 60,
        'final_dt': None,
        'id': dummy_newdle.id,
        'private': True,
        'notify': False,
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
def test_update_invalid_newdle(flask_client, dummy_uid):
    resp = flask_client.patch(
        url_for('api.update_newdle', code='xxx'),
        json={'title': 'foo'},
        **make_test_auth(dummy_uid),
    )
    assert resp.status_code == 404
    assert resp.json == {'error': 'Specified newdle does not exist'}


@pytest.mark.usefixtures('db_session')
def test_update_newdle_unauthorized(flask_client, dummy_newdle):
    resp = flask_client.patch(
        url_for('api.update_newdle', code='dummy'),
        json={'title': 'foo'},
        **make_test_auth('someone'),
    )
    assert resp.status_code == 403
    assert resp.json == {'error': Forbidden.description}


@pytest.mark.usefixtures('dummy_newdle')
def test_update_newdle(flask_client, dummy_newdle, dummy_uid):
    final_dt = '2019-09-12T13:30'
    expected_json = {
        'code': 'dummy',
        'creator_name': 'Dummy',
        'creator_email': '',
        'creator_uid': dummy_newdle.creator_uid,
        'duration': 60,
        'id': dummy_newdle.id,
        'private': True,
        'notify': False,
        'timeslots': [
            '2019-09-11T13:00',
            '2019-09-11T14:00',
            '2019-09-12T13:00',
            '2019-09-12T13:30',
        ],
        'participants': [
            {
                'answers': {},
                'auth_uid': None,
                'email': None,
                'name': 'Albert Einstein',
                'comment': '',
            },
            {
                'answers': {},
                'auth_uid': 'pig',
                'email': 'example@example.com',
                'name': 'Guinea Pig',
                'comment': '',
            },
            {
                'answers': {},
                'auth_uid': None,
                'email': None,
                'name': 'Tony Stark',
                'comment': '',
            },
        ],
        'timezone': 'Europe/Zurich',
        'title': 'Test event',
        'url': 'http://flask.test/newdle/dummy',
    }
    resp = flask_client.patch(
        url_for('api.update_newdle', code='dummy'),
        **make_test_auth(dummy_uid),
        json={
            'code': 'xxx',
            'creator_name': 'someone',
            'duration': 120,
            'final_dt': final_dt,
            'id': 10,
            'timeslots': [
                '2019-08-11T13:00',
                '2019-08-11T14:00',
                '2019-08-12T13:00',
                '2019-08-12T13:30',
            ],
            'timezone': 'Europe/Paris',
            'title': 'Test event1',
            'url': 'http://flask.test/newdle/dummy1',
        },
    )

    resp.json['participants'].sort(key=itemgetter('name'))
    ids = [participant.pop('id') for participant in resp.json['participants']]
    assert ids == [
        p.id for p in sorted(dummy_newdle.participants, key=attrgetter('name'))
    ]
    assert resp.json['final_dt'] == final_dt
    assert resp.status_code == 200
    del resp.json['final_dt']
    assert resp.json == expected_json


@pytest.mark.usefixtures('dummy_newdle')
def test_update_newdle_changes_last_update(flask_client, dummy_uid, dummy_newdle):
    before_update = dummy_newdle.last_update
    flask_client.patch(
        url_for('api.update_newdle', code='dummy'),
        **make_test_auth(dummy_uid),
        json={
            'code': 'xxx',
            'creator_name': 'someone',
            'duration': 120,
            'final_dt': '2019-09-12T13:30',
            'id': 10,
            'timeslots': [
                '2019-08-11T13:00',
                '2019-08-11T14:00',
                '2019-08-12T13:00',
                '2019-08-12T13:30',
            ],
            'timezone': 'Europe/Paris',
            'title': 'Test event1',
            'url': 'http://flask.test/newdle/dummy1',
        },
    )
    assert before_update < dummy_newdle.last_update


@pytest.mark.usefixtures('db_session')
def test_update_participants_changes_last_update(flask_client, dummy_newdle):
    before_update = dummy_newdle.last_update
    flask_client.patch(
        url_for('api.update_participant', code='dummy', participant_code='part1'),
        json={
            'answers': {
                '2019-09-11T13:00': 'available',
                '2019-09-12T13:00': 'unavailable',
                '2019-09-11T14:00': 'ifneedbe',
            }
        },
    )
    assert before_update < dummy_newdle.last_update


@pytest.mark.usefixtures('dummy_newdle')
def test_update_participant_empty_list_leaves_last_update(flask_client, dummy_newdle):
    before_update = dummy_newdle.last_update
    flask_client.patch(
        url_for('api.update_participant', code='dummy', participant_code='part1')
    )
    assert before_update == dummy_newdle.last_update


@pytest.mark.usefixtures('db_session')
def test_create_unknown_participant_changes_last_update(flask_client, dummy_newdle):
    before_update = dummy_newdle.last_update
    resp = flask_client.post(
        url_for('api.create_unknown_participant', code='dummy'), json={'name': 'Potato'}
    )
    assert resp.status_code == 200
    assert dummy_newdle.last_update > before_update


@pytest.mark.usefixtures('db_session')
def test_newdles_not_participating(flask_client, dummy_uid):
    resp = flask_client.get(
        url_for('api.get_newdles_participating'), **make_test_auth(dummy_uid)
    )
    assert resp.status_code == 200
    assert not resp.json


@pytest.mark.usefixtures('db_session')
def test_newdles_participating(flask_client, dummy_newdle, dummy_participant_uid):
    resp = flask_client.get(
        url_for('api.get_newdles_participating'),
        **make_test_auth(dummy_participant_uid),
    )
    id_ = resp.json[0].pop('id')
    assert id_ == next(
        p.id for p in dummy_newdle.participants if p.auth_uid == dummy_participant_uid
    )
    assert resp.status_code == 200
    assert resp.json == [
        {
            'answers': {},
            'auth_uid': dummy_participant_uid,
            'code': 'part3',
            'email': 'example@example.com',
            'name': 'Guinea Pig',
            'comment': '',
            'newdle': {
                'code': 'dummy',
                'creator_name': 'Dummy',
                'creator_email': '',
                'creator_uid': dummy_newdle.creator_uid,
                'duration': 60,
                'final_dt': None,
                'id': dummy_newdle.id,
                'private': True,
                'notify': False,
                'timeslots': [
                    '2019-09-11T13:00',
                    '2019-09-11T14:00',
                    '2019-09-12T13:00',
                    '2019-09-12T13:30',
                ],
                'timezone': 'Europe/Zurich',
                'title': 'Test event',
                'url': 'http://flask.test/newdle/dummy',
            },
        }
    ]


@pytest.mark.usefixtures('db_session')
def test_get_participants_unauthorized(flask_client, dummy_newdle):
    resp = flask_client.get(
        url_for('api.get_participants', code='dummy'), **make_test_auth('someone')
    )
    assert resp.status_code == 403
    assert resp.json == {'error': 'You cannot view the participants of this newdle'}


@pytest.mark.usefixtures('db_session')
def test_get_participants_public_newdle(flask_client, dummy_newdle, db_session):
    dummy_newdle.private = False
    db_session.flush()
    resp = flask_client.get(
        url_for('api.get_participants', code='dummy'), **make_test_auth('someone')
    )
    assert resp.status_code == 200


@pytest.mark.usefixtures('db_session')
def test_get_participants(flask_client, dummy_newdle, dummy_uid):
    resp = flask_client.get(
        url_for('api.get_participants', code='dummy'), **make_test_auth(dummy_uid)
    )
    assert resp.status_code == 200
    data = resp.json
    participants = sorted(data, key=itemgetter('name'))
    ids = [participant.pop('id') for participant in participants]
    assert ids == [
        p.id for p in sorted(dummy_newdle.participants, key=attrgetter('name'))
    ]
    assert participants == [
        {
            'answers': {},
            'auth_uid': None,
            'email': None,
            'name': 'Albert Einstein',
            'comment': '',
        },
        {
            'answers': {},
            'auth_uid': 'pig',
            'email': 'example@example.com',
            'name': 'Guinea Pig',
            'comment': '',
        },
        {
            'answers': {},
            'auth_uid': None,
            'email': None,
            'name': 'Tony Stark',
            'comment': '',
        },
    ]


@pytest.mark.usefixtures('db_session')
def test_get_participant_me(flask_client, dummy_newdle):
    resp = flask_client.get(
        url_for('api.get_participant_me', code='dummy'), **make_test_auth('pig')
    )
    id_ = resp.json.pop('id')
    assert id_ == next(p.id for p in dummy_newdle.participants if p.auth_uid == 'pig')
    assert resp.status_code == 200
    assert resp.json == {
        'answers': {},
        'auth_uid': 'pig',
        'code': 'part3',
        'email': 'example@example.com',
        'name': 'Guinea Pig',
        'comment': '',
    }


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
def test_get_participant(flask_client, dummy_newdle):
    resp = flask_client.get(
        url_for('api.get_participant', code='dummy', participant_code='part1')
    )
    id_ = resp.json.pop('id')
    assert id_ == next(p.id for p in dummy_newdle.participants if p.code == 'part1')
    assert resp.status_code == 200
    assert resp.json == {
        'answers': {},
        'auth_uid': None,
        'email': None,
        'name': 'Tony Stark',
        'comment': '',
        'code': 'part1',
    }


@pytest.mark.usefixtures('dummy_newdle')
def test_update_participant_empty(flask_client, dummy_newdle):
    resp = flask_client.patch(
        url_for('api.update_participant', code='dummy', participant_code='part1')
    )
    id_ = resp.json.pop('id')
    assert id_ == next(p.id for p in dummy_newdle.participants if p.code == 'part1')
    assert resp.status_code == 200
    assert resp.json == {
        'answers': {},
        'auth_uid': None,
        'email': None,
        'name': 'Tony Stark',
        'comment': '',
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
def test_update_participant_answers_valid_slots(flask_client, dummy_newdle):
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
    id_ = resp.json.pop('id')
    assert id_ == next(p.id for p in dummy_newdle.participants if p.code == 'part1')
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
        'comment': '',
        'code': 'part1',
    }


@pytest.mark.usefixtures('dummy_newdle')
def test_create_unknown_participant_newdle_invalid(flask_client):
    resp = flask_client.post(
        url_for('api.create_unknown_participant', code='xxx'),
        json={'name': 'Unknown participant'},
    )
    assert resp.status_code == 404
    assert resp.json == {'error': 'Specified newdle does not exist'}


@pytest.mark.usefixtures('dummy_newdle')
def test_create_unknown_participant_newdle_finished(flask_client, dummy_newdle):
    name = 'Unknown participant'
    dummy_newdle.final_dt = datetime(2019, 9, 12, 13, 30)
    resp = flask_client.post(
        url_for('api.create_unknown_participant', code='dummy'), json={'name': name}
    )
    assert resp.status_code == 403
    assert resp.json == {'error': 'This newdle has finished'}


@pytest.mark.usefixtures('dummy_newdle')
def test_create_unknown_participant(flask_client):
    name = 'Unknown participant'
    now = datetime.utcnow()
    num_participants = Participant.query.count()
    resp = flask_client.post(
        url_for('api.create_unknown_participant', code='dummy'), json={'name': name}
    )
    assert resp.status_code == 200
    data = resp.json
    code = data.pop('code')
    id_ = data.pop('id')
    participant = Participant.query.filter_by(name=name).first()
    assert data == {
        'answers': {},
        'auth_uid': None,
        'email': None,
        'name': name,
        'comment': '',
    }
    newdle = Newdle.query.filter_by(code='dummy').first()
    assert Participant.query.count() == num_participants + 1
    assert participant.code == code
    assert participant.id == id_
    assert newdle.last_update > now


@pytest.mark.usefixtures('dummy_newdle')
def test_create_participant_newdle_invalid(flask_client, dummy_uid):
    resp = flask_client.put(
        url_for('api.create_participant', code='xxx'),
        json={'name': 'New participant'},
        **make_test_auth(dummy_uid),
    )
    assert resp.status_code == 404
    assert resp.json == {'error': 'Specified newdle does not exist'}


@pytest.mark.usefixtures('dummy_newdle')
def test_create_participant_newdle_no_duplicate(flask_client, dummy_newdle, dummy_uid):
    dummy_newdle.participants.add(
        Participant(
            code='part4',
            name='Guinea Pig',
            email='example@example.com',
            auth_uid=dummy_uid,
        )
    )
    nb_participant = Participant.query.count()
    resp = flask_client.put(
        url_for('api.create_participant', code='dummy'), **make_test_auth(dummy_uid)
    )
    assert resp.status_code == 200
    assert Participant.query.count() == nb_participant


@pytest.mark.usefixtures('dummy_newdle')
def test_create_participant(flask_client, dummy_newdle, dummy_uid):
    assert (
        Participant.query.filter_by(newdle=dummy_newdle, auth_uid=dummy_uid).first()
        is None
    )

    nb_participant = Participant.query.count()
    resp = flask_client.put(
        url_for('api.create_participant', code='dummy'), **make_test_auth(dummy_uid)
    )

    participant = Participant.query.filter_by(
        newdle=dummy_newdle, auth_uid=dummy_uid
    ).first()

    code = resp.json.pop('code')
    id_ = resp.json.pop('id')

    assert participant.code == code
    assert participant.id == id_
    assert resp.status_code == 200
    assert resp.json == {
        'answers': {},
        'auth_uid': 'user123',
        'email': 'example@example.com',
        'name': 'Guinea Pig',
        'comment': '',
    }
    assert Participant.query.count() == nb_participant + 1


@pytest.mark.usefixtures('mail_queue')
def test_send_result_emails(flask_client, dummy_newdle, mail_queue, dummy_uid):
    assert len(mail_queue) == 0
    dummy_newdle.final_dt = datetime(2019, 9, 12, 13, 30)
    resp = flask_client.post(
        url_for('api.send_result_emails', code='dummy'),
        **make_test_auth(dummy_uid),
    )
    assert len(mail_queue) == 1
    assert resp.status_code == 204


@pytest.mark.usefixtures('dummy_newdle')
def test_send_result_emails_forbidden(flask_client):
    resp = flask_client.post(
        url_for('api.send_result_emails', code='dummy'),
        **make_test_auth('wrong_user'),
    )
    assert resp.status_code == 403


@pytest.mark.usefixtures('dummy_newdle')
def test_send_result_emails_404(flask_client, dummy_uid):
    resp = flask_client.post(
        url_for('api.send_result_emails', code='non_existent'),
        **make_test_auth(dummy_uid),
    )
    assert resp.status_code == 404
