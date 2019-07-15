from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from .api import api
from .frontend import frontend


def _configure_app(app):
    app.config.setdefault('PROXY', False)
    app.config.from_pyfile('newdle.cfg.example')
    app.config.from_envvar('NEWDLE_CONFIG')
    if app.config['PROXY']:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


def create_app():
    app = Flask('newdle')
    _configure_app(app)
    app.register_blueprint(frontend)
    app.register_blueprint(api)
    return app
