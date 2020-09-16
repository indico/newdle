import os
from datetime import datetime, timedelta

import flask_migrate
import pytest

from newdle.core.app import create_app
from newdle.core.db import db
from newdle.models import Newdle, Participant


TEST_DATABASE_URI = os.environ.get(
    'NEWDLE_TEST_DATABASE_URI', 'postgresql:///newdle_tests'
)


@pytest.fixture(scope='session')
def app():
    """Session-wide test `Flask` application."""
    config_override = {
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': TEST_DATABASE_URI,
        'SERVER_NAME': 'flask.test',
        'SECRET_KEY': 'test',
        'EMAIL_BACKEND': 'newdle.vendor.django_mail.backends.locmem.EmailBackend',
    }
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


@pytest.fixture()
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


@pytest.fixture
def mail_queue():
    from newdle.vendor import django_mail

    django_mail.outbox = []
    return django_mail.outbox


@pytest.fixture()
def flask_client(app):
    return app.test_client()


@pytest.fixture
def dummy_uid():
    return 'user123'


@pytest.fixture
def dummy_participant_uid():
    return 'pig'


@pytest.fixture
def dummy_newdle(db_session, dummy_uid):
    newdle = Newdle(
        code='dummy',
        title='Test event',
        creator_uid=dummy_uid,
        creator_name='Dummy',
        duration=timedelta(minutes=60),
        private=True,
        timezone='Europe/Zurich',
        timeslots=[
            datetime(2019, 9, 11, 13, 0),
            datetime(2019, 9, 11, 14, 0),
            datetime(2019, 9, 12, 13, 0),
            datetime(2019, 9, 12, 13, 30),
        ],
        participants={
            Participant(code='part1', name='Tony Stark'),
            Participant(code='part2', name='Albert Einstein'),
            Participant(
                code='part3',
                name='Guinea Pig',
                email='example@example.com',
                auth_uid='pig',
            ),
        },
    )
    db_session.add(newdle)
    db_session.flush()
    return newdle
