from datetime import datetime, timedelta

import pytest
from flask import current_app

from newdle.cli import cleanup_newdles
from newdle.core.db import db
from newdle.models import Newdle


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_uncompleted_tasks(cli_runner, dummy_newdle):
    days = timedelta(days=current_app.config['LAST_ACTIVITY_CLEANUP_INTERVAL'] + 1)
    dummy_newdle.last_update = datetime.utcnow() - days
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 0


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_non_fitting_incomplete_tasks(cli_runner, dummy_newdle):
    days = timedelta(days=current_app.config['LAST_ACTIVITY_CLEANUP_INTERVAL'] - 10)
    dummy_newdle.last_update = datetime.utcnow() - days
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 1


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_final_tasks(cli_runner, dummy_newdle):
    days = timedelta(days=current_app.config['FINAL_DATE_CLEANUP_INTERVAL'] + 1)
    dummy_newdle.final_dt = datetime.utcnow() - days
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 0


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_non_fitting_final_tasks(cli_runner, dummy_newdle):
    days = timedelta(days=current_app.config['FINAL_DATE_CLEANUP_INTERVAL'] - 5)
    dummy_newdle.final_dt = datetime.utcnow() - days
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 1


@pytest.mark.usefixtures('db_session')
def test_cleanup_newdles_multiple_entries_final_task(
    cli_runner, multiple_dummy_newdles
):
    assert Newdle.query.count() == 3
    first_newdle = multiple_dummy_newdles[0]
    days = timedelta(days=current_app.config['FINAL_DATE_CLEANUP_INTERVAL'] + 1)
    first_newdle.final_dt = datetime.utcnow() - days
    db.session.commit()

    cli_runner.invoke(cleanup_newdles, [])

    assert Newdle.query.count() == 2
