from flask import Blueprint, current_app, redirect, render_template, session, url_for

from newdle.core.auth import app_token_from_dummy, multipass

auth = Blueprint('auth', __name__)


@auth.route('/login/')
def login():
    if current_app.config['SKIP_LOGIN']:
        payload = {'error': None, 'token': app_token_from_dummy()}
        return render_template('login_result.html', payload=payload)

    return multipass.process_login('newdle-sso')


@auth.route('/logout/')
def logout():
    after_logout_url = url_for('index', _external=True)
    if current_app.config['SKIP_LOGIN']:
        session.clear()
        return redirect(after_logout_url)
    return multipass.logout(after_logout_url, clear_session=True)
