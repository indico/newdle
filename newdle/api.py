from flask import Blueprint, g, jsonify, request
from itsdangerous import BadData, SignatureExpired

from .core.auth import user_info_from_app_token
from .schemas import UserSchema


api = Blueprint('api', __name__, url_prefix='/api')


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
