import pytest

from newdle.core.app import create_app
from newdle.core.db import db


TEST_DATABASE_URI = 'postgresql:///newdle_tests'


@pytest.fixture(scope='session')
def app(request):
    """Session-wide test `Flask` application."""
    config_override = {'TESTING': True, 'SQLALCHEMY_DATABASE_URI': TEST_DATABASE_URI}
    app = create_app(config_override, use_env_config=False)
    ctx = app.app_context()
    ctx.push()
    yield app
    ctx.pop()


@pytest.fixture(scope='function')
def db_session(app, request):
    """Create a new database session."""
    connection = db.engine.connect()
    transaction = connection.begin()

    options = dict(bind=connection, binds={})
    session = db.create_scoped_session(options=options)

    db.session = session
    db.app = app
    db.create_all()

    def teardown():
        transaction.rollback()
        connection.close()
        session.remove()

    request.addfinalizer(teardown)
    return session
