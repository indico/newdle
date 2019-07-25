from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException
from werkzeug.middleware.proxy_fix import ProxyFix

from ..api import api
from ..auth import auth
from .auth import oauth
from .db import db
from .marshmallow import mm


def _configure_app(app):
    app.config.setdefault('PROXY', False)
    app.config.from_pyfile('newdle.cfg.example')
    app.config.from_envvar('NEWDLE_CONFIG')
    if app.config['PROXY']:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)


def _configure_db(app):
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)


def _configure_errors(app):
    @app.errorhandler(HTTPException)
    def _handle_http_exception(exc):
        if request.blueprint != 'api' and (
            request.accept_mimetypes['application/json']
            < request.accept_mimetypes['text/html']
        ):
            # If the client prefers HTML (probably a browser), we keep the
            # default logic which shows a standard HTML message suitable for
            # the http status code.
            return exc
        return jsonify(error=exc.description), exc.code

    @app.errorhandler(Exception)
    def _handle_exception(exc):
        if request.blueprint != 'api' and (
            request.accept_mimetypes['application/json']
            < request.accept_mimetypes['text/html']
        ):
            # If the client prefers HTML (probably a browser), we keep the
            # default logic which results in standard "internal server error"
            # message or the debugger while in development mode.
            raise
        app.logger.exception('Request failed')
        return jsonify(error='internal_error'), 500


def create_app():
    app = Flask('newdle')
    _configure_app(app)
    _configure_db(app)
    _configure_errors(app)
    mm.init_app(app)
    oauth.init_app(app)
    app.register_blueprint(api)
    app.register_blueprint(auth)
    return app
