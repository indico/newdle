import uuid
from importlib import import_module

from faker import Faker
from flask import Blueprint, current_app, g, jsonify, request, url_for
from itsdangerous import BadData, SignatureExpired
from marshmallow import fields
from marshmallow.validate import OneOf
from pytz import common_timezones_set
from sqlalchemy.orm import noload, selectinload
from werkzeug.exceptions import Forbidden, UnprocessableEntity

from .cern_integration import search_cern_users
from .core.auth import user_info_from_app_token
from .core.db import db
from .core.util import DATE_FORMAT, format_dt, range_union, sign_user
from .core.webargs import abort, use_args, use_kwargs
from .models import Newdle, Participant
from .notifications import notify_newdle_participants
from .schemas import (
    MyNewdleSchema,
    NewdleSchema,
    NewNewdleSchema,
    NewUnknownParticipantSchema,
    ParticipantSchema,
    RestrictedNewdleSchema,
    RestrictedParticipantSchema,
    UpdateNewdleSchema,
    UpdateParticipantSchema,
    UserSchema,
    UserSearchResultSchema,
)


api = Blueprint('api', __name__, url_prefix='/api')


def allow_anonymous(fn):
    fn._allow_anonymous = True
    return fn


@api.errorhandler(UnprocessableEntity)
def _handle_webargs_error(exc):
    data = getattr(exc, 'data', None)
    if data and 'messages' in data:
        return jsonify(error='invalid_args', messages=data['messages']), exc.code
    return jsonify(error=exc.description), exc.code


@api.before_request
def require_token():
    g.user = None
    auth = request.headers.get('Authorization')
    token = None
    if auth and auth.startswith('Bearer '):
        token = auth[7:]
    if not token:
        view_func = current_app.view_functions[request.endpoint]
        if getattr(view_func, '_allow_anonymous', False):
            return
        return jsonify(error='token_missing'), 401
    try:
        user = user_info_from_app_token(token)
    except SignatureExpired:
        return jsonify(error='token_expired'), 401
    except BadData:
        return jsonify(error='token_invalid'), 401
    g.user = user


@api.route('/ping')
@allow_anonymous
def ping():
    # dummy endpoint that can be used to check if the app is running
    return '', 204


@api.route('/stats')
@allow_anonymous
def stats():
    # some basic stats for a dashboard. this isn't sensitive data so we can keep
    # it public for now, but if we ever add something more in-depth we may want to
    # add some kind of token authentication...
    return jsonify(newdles=Newdle.query.count(), participants=Participant.query.count())


@api.route('/me/')
def me():
    return UserSchema().jsonify(g.user)


def _generate_fake_users():
    f = Faker()
    f.seed_instance(0)

    def _generate_fake_user():
        first_name = f.first_name()
        last_name = f.last_name()
        email = f'{first_name}.{last_name}@{f.domain_name()}'.lower()
        return {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'uid': str(uuid.uuid4()),
        }

    return [_generate_fake_user() for _ in range(100)] + [
        {
            'first_name': g.user['first_name'],
            'last_name': g.user['last_name'],
            'email': g.user['email'],
            'uid': g.user['uid'],
        }
    ]


def _match(user, query):
    parts = query.lower().split()
    name = f'{user["first_name"]} {user["last_name"]}'.lower()
    return any(
        all(p in field for p in parts) for field in (name, user['email'].lower())
    )


@api.route('/users/')
@use_kwargs({'q': fields.String(required=True)})
def users(q):
    if current_app.config['SKIP_LOGIN']:
        res = [x for x in _generate_fake_users() if _match(x, q)]
        total, data = len(res), res[:10]
    else:
        total, data = search_cern_users(q, 10)
    return {
        'total': total,
        'users': [
            sign_user(u, fields={'email', 'name', 'uid'})
            for u in UserSearchResultSchema(many=True).dump(data)
        ],
    }


@api.route('/users/busy')
@use_kwargs(
    {
        'date': fields.Date(format=DATE_FORMAT, required=True),
        'tz': fields.String(required=True, validate=OneOf(common_timezones_set)),
        'uid': fields.String(required=True),
    }
)
def get_busy_times(date, tz, uid):
    return _get_busy_times(date, tz, uid)


@api.route('/newdle/<code>/participants/<participant_code>/busy')
@api.route('/newdle/<code>/participants/me/busy')
@allow_anonymous
@use_kwargs(
    {
        'date': fields.Date(format=DATE_FORMAT, required=True),
        'tz': fields.String(required=True, validate=OneOf(common_timezones_set)),
    }
)
def get_participant_busy_times(date, code, tz, participant_code=None):
    if participant_code is None:
        # we don't need to check anything in this case, since it's data
        # for the currently logged-in user
        if not g.user:
            return jsonify(error='token_missing'), 401
        return _get_busy_times(date, tz, g.user['uid'])
    # if a participant is specified, only allow getting busy times for a valid
    # timeslots of the newdle to avoid leaking data to anonymous people
    participant = Participant.query.filter(
        Participant.newdle.has(Newdle.code == code),
        Participant.code == participant_code,
    ).first_or_404('Specified participant does not exist')
    if participant.auth_uid is None:
        abort(422, messages={'participant_code': ['Participant is an unknown user']})
    if not any(date == ts.date() for ts in participant.newdle.timeslots):
        abort(422, messages={'date': ['Date has no timeslots']})
    return _get_busy_times(date, tz, participant.auth_uid)


def _get_busy_times(date, tz, uid):
    providers = current_app.config['FREE_BUSY_PROVIDERS']
    data = []

    for name in providers:
        module = import_module(f'newdle.providers.free_busy.{name}')
        data += module.fetch_free_busy(date, tz, uid)

    merged_ranges = range_union(data)
    return jsonify(
        [
            ['{:02}:{:02}'.format(*r[0]), '{:02}:{:02}'.format(*r[1])]
            for r in merged_ranges
        ]
    )


@api.route('/newdles/mine')
def get_my_newdles():
    newdle = (
        Newdle.query.options(selectinload('participants'))
        .filter_by(creator_uid=g.user['uid'])
        .order_by(Newdle.final_dt.isnot(None), Newdle.final_dt.desc(), Newdle.id.desc())
        .all()
    )
    return MyNewdleSchema(many=True).jsonify(newdle)


@api.route('/newdles/in')
def get_newdles_im_in():
    newdle = (
        Newdle.query.options(noload('participants'))
        .filter(Newdle.participants.any(auth_uid=g.user['uid']))
        .order_by(Newdle.final_dt.isnot(None), Newdle.final_dt.desc(), Newdle.id.desc())
        .all()
    )
    return RestrictedNewdleSchema(many=True).jsonify(newdle)


@api.route('/newdle/', methods=('POST',))
@use_kwargs(NewNewdleSchema(), locations=('json',))
def create_newdle(title, duration, timezone, timeslots, participants):
    newdle = Newdle(
        title=title,
        creator_uid=g.user['uid'],
        creator_name=f'{g.user["first_name"]} {g.user["last_name"]}',
        duration=duration,
        timezone=timezone,
        timeslots=timeslots,
        participants={Participant(**p) for p in participants},
    )
    db.session.add(newdle)
    db.session.commit()
    notify_newdle_participants(
        newdle,
        f'Invitation: {newdle.title}',
        'invitation_email.txt',
        'invitation_email.html',
        lambda p: {
            'creator': newdle.creator_name,
            'title': newdle.title,
            'answer_link': url_for(
                'newdle', code=newdle.code, participant_code=p.code, _external=True
            ),
        },
    )
    return NewdleSchema().jsonify(newdle)


@api.route('/newdle/<code>')
@allow_anonymous
def get_newdle(code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    return RestrictedNewdleSchema().jsonify(newdle)


@api.route('/newdle/<code>', methods=('PATCH',))
@use_args(UpdateNewdleSchema(), locations=('json',))
def update_newdle(args, code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    if newdle.creator_uid != g.user['uid']:
        raise Forbidden
    for key, value in args.items():
        setattr(newdle, key, value)
    db.session.commit()
    return NewdleSchema().jsonify(newdle)


@api.route('/newdle/<code>/participants/')
def get_participants(code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    if newdle.creator_uid != g.user['uid']:
        raise Forbidden('You cannot view the participants of this newdle')
    return RestrictedParticipantSchema(many=True).jsonify(newdle.participants)


@api.route('/newdle/<code>/participants/me')
def get_participant_me(code):
    participant = Participant.query.filter(
        Participant.newdle.has(Newdle.code == code),
        Participant.auth_uid == g.user['uid'],
    ).first()
    if participant:
        return ParticipantSchema().jsonify(participant)
    else:
        return jsonify(None)


@api.route('/newdle/<code>/participants/<participant_code>')
@allow_anonymous
def get_participant(code, participant_code):
    participant = Participant.query.filter(
        Participant.newdle.has(Newdle.code == code),
        Participant.code == participant_code,
    ).first_or_404('Specified participant does not exist')
    return ParticipantSchema().jsonify(participant)


@api.route('/newdle/<code>/participants/<participant_code>', methods=('PATCH',))
@allow_anonymous
@use_args(UpdateParticipantSchema(), locations=('json',))
def update_participant(args, code, participant_code):
    participant = Participant.query.filter(
        Participant.newdle.has(Newdle.code == code),
        Participant.code == participant_code,
    ).first_or_404('Specified participant does not exist')
    if participant.newdle.final_dt:
        raise Forbidden('This newdle has finished')
    if 'answers' in args:
        # We can't validate this in webargs, since we don't have access
        # to the Newdle inside the schema...
        invalid = args['answers'].keys() - set(participant.newdle.timeslots)
        if invalid:
            abort(
                422,
                messages={
                    'answers': {
                        format_dt(key): {'key': ['Invalid timeslot']} for key in invalid
                    }
                },
            )
    for key, value in args.items():
        setattr(participant, key, value)
    db.session.commit()
    return ParticipantSchema().jsonify(participant)


@api.route('/newdle/<code>/participants', methods=('POST',))
@allow_anonymous
@use_args(NewUnknownParticipantSchema(), locations=('json',))
def create_unknown_participant(args, code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    if newdle.final_dt:
        raise Forbidden('This newdle has finished')
    participant = Participant(newdle=newdle, **args)
    newdle.participants.add(participant)
    db.session.commit()
    return ParticipantSchema().jsonify(participant)


@api.route('/newdle/<code>/participants/me', methods=('PUT',))
def create_participant(code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    name = f'{g.user["first_name"]} {g.user["last_name"]}'
    participant = Participant.query.filter_by(
        newdle=newdle, auth_uid=g.user['uid']
    ).first()
    if not participant:
        participant = Participant(
            name=name, email=g.user['email'], auth_uid=g.user['uid']
        )
        newdle.participants.add(participant)
        db.session.commit()
    return ParticipantSchema().jsonify(participant)


@api.route('/newdle/<code>/send-result-emails', methods=('POST',))
def send_result_emails(code):
    newdle = Newdle.query.filter_by(code=code).first_or_404('Invalid code')
    if newdle.creator_uid != g.user['uid']:
        raise Forbidden
    date = newdle.final_dt.strftime('%-d %B %Y')
    start_time = newdle.final_dt.strftime('%H:%M')
    end_time = (newdle.final_dt + newdle.duration).strftime('%H:%M')
    notify_newdle_participants(
        newdle,
        f'Result: {newdle.title}',
        'result_email.txt',
        'result_email.html',
        lambda p: {
            'creator': newdle.creator_name,
            'title': newdle.title,
            'date': date,
            'start_time': start_time,
            'end_time': end_time,
            'timezone': newdle.timezone,
        },
    )
    return '', 204
