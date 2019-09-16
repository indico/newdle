from faker import Faker
from flask import Blueprint, current_app, g, jsonify, request
from itsdangerous import BadData, SignatureExpired
from marshmallow import fields
from werkzeug.exceptions import UnprocessableEntity

from .core.auth import user_info_from_app_token
from .core.db import db
from .core.util import format_dt
from .core.webargs import abort, use_args, use_kwargs
from .models import Newdle, Participant
from .schemas import (
    NewdleSchema,
    NewNewdleSchema,
    ParticipantSchema,
    RestrictedNewdleSchema,
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
        return {'first_name': first_name, 'last_name': last_name, 'email': email}

    return [_generate_fake_user() for _ in range(100)] + [
        {
            'first_name': g.user['first_name'],
            'last_name': g.user['last_name'],
            'email': g.user['email'],
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
    data = [x for x in _generate_fake_users() if _match(x, q)]
    return {
        'total': len(data),
        'users': UserSearchResultSchema(many=True).dump(data[:10]),
    }


@api.route('/newdle/', methods=('POST',))
@use_kwargs(NewNewdleSchema(), locations=('json',))
def create_newdle(title, duration, timezone, timeslots, participants):
    newdle = Newdle(
        title=title,
        creator_uid=g.user['uid'],
        duration=duration,
        timezone=timezone,
        timeslots=timeslots,
        participants={Participant(**p) for p in participants},
    )
    db.session.add(newdle)
    db.session.commit()
    return NewdleSchema().jsonify(newdle)


@api.route('/newdle/<code>')
@allow_anonymous
def get_newdle(code):
    newdle = Newdle.query.filter_by(code=code).first_or_404('Invalid code')
    restricted = not g.user or newdle.creator_uid != g.user['uid']
    schema_cls = RestrictedNewdleSchema if restricted else NewdleSchema
    return schema_cls().jsonify(newdle)


@api.route('/newdle/<code>/participants/<participant_code>')
@allow_anonymous
def get_participant(code, participant_code):
    participant = Participant.query.filter(
        Participant.newdle.has(Newdle.code == code),
        Participant.code == participant_code,
    ).first_or_404('Invalid code')
    return ParticipantSchema().jsonify(participant)


@api.route('/newdle/<code>/participants/<participant_code>', methods=('PATCH',))
@allow_anonymous
@use_args(UpdateParticipantSchema(), locations=('json',))
def update_participant(args, code, participant_code):
    participant = Participant.query.filter(
        Participant.newdle.has(Newdle.code == code),
        Participant.code == participant_code,
    ).first_or_404('Invalid code')
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
