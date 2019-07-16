from authlib.common.errors import AuthlibBaseError
from authlib.common.security import generate_token
from flask import Blueprint, current_app, render_template, request, session, url_for

from .core.auth import (
    app_token_from_dummy,
    app_token_from_id_token,
    oauth,
    parse_id_token,
)


auth = Blueprint('auth', __name__)


@auth.route('/login/')
def login():
    if current_app.config['SKIP_LOGIN']:
        payload = {'error': None, 'token': app_token_from_dummy()}
        return render_template('login_result.html', payload=payload)

    session['oidc.nonce'] = nonce = generate_token(20)
    return oauth.oidc.authorize_redirect(
        url_for('.login_oauth_oidc', _external=True), nonce=nonce
    )


@auth.route('/login/oidc')
def login_oauth_oidc():
    # if authorization failed abort early
    if request.args.get('error'):
        payload = {'error': request.args['error'], 'token': None}
        return render_template('login_result.html', payload=payload)
    # try to get a token containing a valid oidc id token
    try:
        oauth_token_data = oauth.oidc.authorize_access_token()
        id_token = parse_id_token(oauth_token_data, session.pop('oidc.nonce'))
        token = app_token_from_id_token(id_token)
        payload = {'error': None, 'token': token}
    except AuthlibBaseError as exc:
        payload = {'error': str(exc), 'token': None}
    return render_template('login_result.html', payload=payload)
