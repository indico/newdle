from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from .db import db
from ..api import api
from ..frontend import frontend


def _configure_app(app):
    app.config.setdefault('PROXY', False)
    app.config.from_pyfile('newdle.cfg.example')
    app.config.from_envvar('NEWDLE_CONFIG')
    if app.config['PROXY']:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


def _configure_db(app):
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)


def create_app():
    app = Flask('newdle')
    _configure_app(app)
    _configure_db(app)
    app.register_blueprint(frontend)
    app.register_blueprint(api)
    return app
