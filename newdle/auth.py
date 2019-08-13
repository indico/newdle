from authlib.common.errors import AuthlibBaseError
from authlib.common.security import generate_token
from flask import (
    Blueprint,
    current_app,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.urls import url_encode

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


@auth.route('/logout/')
def logout():
    if not current_app.config['OIDC_LOGOUT_URL']:
        return redirect(url_for('index'))
    query = url_encode({'post_logout_redirect_uri': url_for('index', _external=True)})
    return redirect(current_app.config['OIDC_LOGOUT_URL'] + '?' + query)
