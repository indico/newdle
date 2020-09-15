from datetime import datetime, timedelta

import pytest
from flask import current_app

from newdle.core.db import db
from newdle.models import Newdle


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_uncompleted_tasks(cli_runner, dummy_newdle):
    dummy_newdle.last_update = datetime.utcnow() - timedelta(
        days=current_app.config['LAST_ACTIVITY_CLEANUP_INTERVAL'] + 1
    )
    db.session.commit()
    assert 1 == Newdle.query.count()
    cli_runner.invoke(args=['cleanup_newdles'])
    assert 0 == Newdle.query.count()


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_non_fitting_incomplete_tasks(cli_runner, dummy_newdle):
    dummy_newdle.last_update = datetime.utcnow() - timedelta(
        days=current_app.config['LAST_ACTIVITY_CLEANUP_INTERVAL'] - 10
    )
    db.session.commit()
    assert 1 == Newdle.query.count()
    cli_runner.invoke(args=['cleanup_newdles'])
    assert 1 == Newdle.query.count()


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_final_tasks(cli_runner, dummy_newdle):
    dummy_newdle.final_dt = datetime.utcnow() - timedelta(
        days=current_app.config['FINAL_DATE_CLEANUP_INTERVAL'] + 1
    )
    db.session.commit()
    assert 1 == Newdle.query.count()
    cli_runner.invoke(args=['cleanup_newdles'])
    assert 0 == Newdle.query.count()


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_non_fitting_final_tasks(cli_runner, dummy_newdle):
    dummy_newdle.final_dt = datetime.utcnow() - timedelta(
        days=current_app.config['FINAL_DATE_CLEANUP_INTERVAL'] - 5
    )
    db.session.commit()
    assert 1 == Newdle.query.count()
    cli_runner.invoke(args=['cleanup_newdles'])
    assert 1 == Newdle.query.count()
