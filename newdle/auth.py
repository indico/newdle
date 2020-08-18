from flask import Blueprint, current_app, render_template, url_for

from .core.auth import app_token_from_dummy, multipass


auth = Blueprint('auth', __name__)


@auth.route('/login/')
def login():
    if current_app.config['SKIP_LOGIN']:
        payload = {'error': None, 'token': app_token_from_dummy()}
        return render_template('login_result.html', payload=payload)

    return multipass.process_login('newdle-sso')


@auth.route('/logout/')
def logout():
    return multipass.logout(url_for('index', _external=True), clear_session=True)
