import hashlib
import uuid
from importlib import import_module

import requests
from faker import Faker
from flask import Blueprint, Response, current_app, g, jsonify, request, url_for
from itsdangerous import BadData, SignatureExpired
from marshmallow import fields
from marshmallow.validate import OneOf
from pytz import common_timezones_set, timezone
from sqlalchemy.orm import selectinload
from werkzeug.exceptions import Forbidden, ServiceUnavailable, UnprocessableEntity
from werkzeug.urls import url_encode

from .calendar import create_calendar_event
from .core.auth import search_users, user_info_from_app_token
from .core.db import db
from .core.util import (
    DATE_FORMAT,
    avatar_info_from_payload,
    change_dt_timezone,
    format_dt,
    range_union,
    render_user_avatar,
)
from .core.webargs import abort, use_args, use_kwargs
from .models import Availability, Newdle, Participant
from .notifications import (
    notify_newdle_creator,
    notify_newdle_participants,
    send_invitation_emails,
)
from .schemas import (
    DeletedNewdleSchema,
    MyNewdleSchema,
    NewdleParticipantSchema,
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


@api.route('/avatar/<payload>')
@allow_anonymous
def user_avatar(payload):
    user_info = avatar_info_from_payload(payload)
    if user_info is None:
        abort(404)
    size = request.args.get('size')
    if user_info['email'] is None:
        return render_user_avatar(user_info['initial'], size)
    email_hex = hashlib.md5(user_info['email'].lower().encode()).hexdigest()
    # make gravatar return 404 HTTP code instead of a default image
    query_args = {'d': '404'}
    if size is not None:
        query_args['s'] = size
    gravatar_url = f'https://gravatar.com/avatar/{email_hex}?{url_encode(query_args)}'
    request_headers = {}
    if 'if-modified-since' in request.headers:
        request_headers['if-modified-since'] = request.headers['if-modified-since']

    resp = requests.get(gravatar_url, headers=request_headers)
    if resp.status_code == 404:
        return render_user_avatar(user_info['initial'], size)

    # include only the headers we care about
    forwarded_header_names = [
        'content-type',
        'last-modified',
        'cache-control',
        'expires',
        'date',
        'content-disposition',
        'etag',
    ]
    headers = [
        (name, value)
        for (name, value) in resp.headers.items()
        if name.lower() in forwarded_header_names
    ]
    return Response(resp.content, resp.status_code, headers)


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


def _match(user, name, email):
    email = email.lower() if email else None
    if email and email not in user['email']:
        return False
    parts = name.lower().split() if name else []
    name = f'{user["first_name"]} {user["last_name"]}'.lower()
    return all(p in name for p in parts)


@api.route('/users/')
@use_kwargs({'name': fields.String(missing=None), 'email': fields.String(missing=None)})
def users(name, email):
    if not name and not email:
        abort(
            422,
            messages={
                'name': ['name or email must be provided'],
                'email': ['name or email must be provided'],
            },
        )
    if current_app.config['SKIP_LOGIN']:
        res = [x for x in _generate_fake_users() if _match(x, name, email)]
        total, data = len(res), res[:10]
    elif not current_app.config['MULTIPASS_IDENTITY_PROVIDER_SEARCH']:
        raise ServiceUnavailable('Search is not available')
    else:
        total, data = search_users(name, email, 10)
    return {
        'total': total,
        'users': UserSearchResultSchema(many=True).dump(data),
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
    target_tz = timezone(tz)
    newdle_tz = timezone(participant.newdle.timezone)
    if not any(
        date == change_dt_timezone(ts, newdle_tz, target_tz).date()
        for ts in participant.newdle.timeslots
    ):
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
            if r[0] != r[1]
        ]
    )


@api.route('/newdles/mine')
def get_my_newdles():
    newdle = (
        Newdle.query.options(selectinload('participants'))
        .filter(Newdle.creator_uid == g.user['uid'], ~Newdle.deleted)
        .order_by(Newdle.final_dt.isnot(None), Newdle.final_dt.desc(), Newdle.id.desc())
        .all()
    )
    return MyNewdleSchema(many=True).jsonify(newdle)


@api.route('/newdles/participating')
def get_newdles_participating():
    newdle = (
        Participant.query.filter_by(auth_uid=g.user['uid'])
        .join(Participant.newdle)
        .filter(~Newdle.deleted)
        .order_by(Newdle.id.desc())
    )
    return NewdleParticipantSchema(many=True).jsonify(newdle)


@api.route('/newdle/', methods=('POST',))
@use_kwargs(NewNewdleSchema(), locations=('json',))
def create_newdle(title, duration, timezone, timeslots, participants, private, notify):
    newdle = Newdle(
        title=title,
        creator_uid=g.user['uid'],
        creator_name=f'{g.user["first_name"]} {g.user["last_name"]}',
        creator_email=g.user['email'],
        duration=duration,
        timezone=timezone,
        timeslots=timeslots,
        participants={Participant(**p) for p in participants},
        private=private,
        notify=notify,
    )
    db.session.add(newdle)
    db.session.flush()
    send_invitation_emails(newdle)
    db.session.commit()
    return NewdleSchema().jsonify(newdle)


@api.route('/newdle/<code>', methods=('PATCH',))
@use_args(UpdateNewdleSchema(partial=True), locations=('json',))
def update_newdle(args, code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    if newdle.creator_uid != g.user['uid']:
        raise Forbidden
    new_participants = []
    if 'participants' in args:
        participants = args.pop('participants')
        # Filter the new participants to be created (excluding anonymous)
        new_participants = {
            Participant(**p)
            for p in participants
            if 'id' not in p and p.get('auth_uid') is not None
        }
        # Filter the existing participants so we don't reset them (intersection)
        # and discard invalid ids
        ids = {p['id'] for p in participants if 'id' in p}
        newdle.participants = {p for p in newdle.participants if p.id in ids}
        newdle.participants |= new_participants
    for key, value in args.items():
        setattr(newdle, key, value)
    if args:
        newdle.update_lastmod()
    db.session.flush()
    send_invitation_emails(newdle, new_participants)
    db.session.commit()
    return NewdleSchema().jsonify(newdle)


@api.route('/newdle/<code>')
@allow_anonymous
def get_newdle(code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    if newdle.deleted:
        return DeletedNewdleSchema().jsonify(newdle)
    return RestrictedNewdleSchema().jsonify(newdle)


@api.route('/newdle/<code>', methods=('DELETE',))
def delete_newdle(code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    if newdle.creator_uid != g.user['uid']:
        raise Forbidden
    newdle.deleted = True
    db.session.commit()
    return DeletedNewdleSchema().jsonify(newdle)


@api.route('/newdle/<code>/participants/')
@allow_anonymous
def get_participants(code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    if newdle.private and (g.user is None or newdle.creator_uid != g.user['uid']):
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

    is_update = bool(participant.answers)
    for key, value in args.items():
        setattr(participant, key, value)
    if args:
        participant.newdle.update_lastmod()
    db.session.flush()
    if participant.newdle.notify:
        subject = (
            f'{participant.name} updated their answer for {participant.newdle.title}'
            if is_update
            else f'{participant.name} responded to {participant.newdle.title}'
        )
        try:
            notify_newdle_creator(
                participant,
                subject,
                'replied_email.txt',
                'replied_email.html',
                {
                    'update': is_update,
                    'creator': participant.newdle.creator_name,
                    'participant': participant.name,
                    'title': participant.newdle.title,
                    'comment': participant.comment,
                    'answers': [
                        (timeslot, answer == Availability.ifneedbe)
                        for timeslot, answer in participant.answers.items()
                        if answer != Availability.unavailable
                    ],
                    'summary_link': url_for(
                        'newdle_summary', code=participant.newdle.code, _external=True
                    ),
                },
            )
        except ConnectionRefusedError:
            current_app.logger.exception('Failed notifying the newdle creator')
    db.session.commit()
    return ParticipantSchema().jsonify(participant)


@api.route('/newdle/<code>/participants', methods=('POST',))
@allow_anonymous
@use_args(NewUnknownParticipantSchema(exclude=('id',)), locations=('json',))
def create_unknown_participant(args, code):
    newdle = Newdle.query.filter_by(code=code).first_or_404(
        'Specified newdle does not exist'
    )
    if newdle.final_dt:
        raise Forbidden('This newdle has finished')
    participant = Participant(newdle=newdle, **args)
    newdle.participants.add(participant)
    newdle.update_lastmod()
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
        newdle.update_lastmod()
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
    ical_data = create_calendar_event(newdle)
    attachments = [('invite.ics', ical_data, 'text/calendar')]
    notify_newdle_participants(
        newdle,
        f'Result: {newdle.title}',
        'result_email.txt',
        'result_email.html',
        lambda p: {
            'creator': newdle.creator_name,
            'title': newdle.title,
            'participant': p.name,
            'newdle_link': url_for('newdle', code=newdle.code, _external=True),
            'date': date,
            'start_time': start_time,
            'end_time': end_time,
            'timezone': newdle.timezone,
        },
        attachments,
    )
    return '', 204


@api.route('/newdle/<code>/send-deletion-emails', methods=('POST',))
@use_args({'comment': fields.Str(required=False)}, locations=('json',))
def send_deletion_emails(args, code):
    newdle = Newdle.query.filter_by(code=code).first_or_404('Invalid code')
    if newdle.creator_uid != g.user['uid']:
        raise Forbidden
    notify_newdle_participants(
        newdle,
        f'Deleted: {newdle.title}',
        'deletion_email.txt',
        'deletion_email.html',
        lambda p: {
            'creator': newdle.creator_name,
            'title': newdle.title,
            'participant': p.name,
            'summary_link': url_for('newdle_summary', code=newdle.code, _external=True),
            'comment': args['comment'] if 'comment' in args else None,
        },
    )
    return '', 204
