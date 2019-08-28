import flask_migrate
import pytest

from newdle.core.app import create_app
from newdle.core.db import db


TEST_DATABASE_URI = 'postgresql:///newdle_tests'


@pytest.fixture(scope='session')
def app():
    """Session-wide test `Flask` application."""
    config_override = {'TESTING': True, 'SQLALCHEMY_DATABASE_URI': TEST_DATABASE_URI}
    app = create_app(config_override, use_env_config=False)
    ctx = app.app_context()
    ctx.push()
    yield app
    ctx.pop()


@pytest.fixture(scope='session')
def database(app):
    flask_migrate.upgrade(revision='head')
    yield
    flask_migrate.downgrade(revision='base')


@pytest.fixture(scope='function')
def db_session(app, database):
    """Create a new database session."""
    connection = db.engine.connect()
    transaction = connection.begin()

    options = dict(bind=connection, binds={})
    session = db.create_scoped_session(options=options)

    db.session = session
    db.app = app

    yield session

    transaction.rollback()
    connection.close()
    session.remove()
