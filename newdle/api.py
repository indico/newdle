from faker import Faker
from flask import Blueprint, g, jsonify, request
from itsdangerous import BadData, SignatureExpired
from marshmallow import fields
from werkzeug.exceptions import UnprocessableEntity

from .core.auth import user_info_from_app_token
from .core.webargs import use_kwargs
from .schemas import UserSchema, UserSearchResultSchema


api = Blueprint('api', __name__, url_prefix='/api')


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
