from datetime import datetime, timedelta

from flask import current_app

from newdle.cli import cleanup_newdles
from newdle.core.db import db
from newdle.models import Newdle


def test_cleanup_newdles_uncompleted_tasks_disabled(cli_runner, dummy_newdle):
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 1


def test_cleanup_newdles_final_date_disabled(cli_runner, dummy_newdle, override_config):
    override_config(LAST_ACTIVITY_CLEANUP_DELAY=90, FINAL_DATE_CLEANUP_DELAY=None)
    days = timedelta(days=current_app.config['LAST_ACTIVITY_CLEANUP_DELAY'] - 10)
    dummy_newdle.last_update = datetime.utcnow() - days
    dummy_newdle.final_dt = datetime.utcnow() - timedelta(days=60)
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 1


def test_cleanup_newdles_uncompleted_tasks(cli_runner, dummy_newdle, override_config):
    override_config(LAST_ACTIVITY_CLEANUP_DELAY=90, FINAL_DATE_CLEANUP_DELAY=30)
    days = timedelta(days=current_app.config['LAST_ACTIVITY_CLEANUP_DELAY'] + 1)
    dummy_newdle.last_update = datetime.utcnow() - days
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 0


def test_cleanup_newdles_non_fitting_incomplete_tasks(
    cli_runner, dummy_newdle, override_config
):
    override_config(LAST_ACTIVITY_CLEANUP_DELAY=90, FINAL_DATE_CLEANUP_DELAY=30)
    days = timedelta(days=current_app.config['LAST_ACTIVITY_CLEANUP_DELAY'] - 10)
    dummy_newdle.last_update = datetime.utcnow() - days
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 1


def test_cleanup_newdles_final_tasks(cli_runner, dummy_newdle, override_config):
    override_config(LAST_ACTIVITY_CLEANUP_DELAY=90, FINAL_DATE_CLEANUP_DELAY=30)
    days = timedelta(days=current_app.config['FINAL_DATE_CLEANUP_DELAY'] + 1)
    days_upd = timedelta(days=current_app.config['LAST_ACTIVITY_CLEANUP_DELAY'] + 1)
    dummy_newdle.final_dt = datetime.utcnow() - days
    dummy_newdle.last_update = datetime.utcnow() - days_upd
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 0


def test_cleanup_newdles_non_fitting_final_tasks(
    cli_runner, dummy_newdle, override_config
):
    override_config(LAST_ACTIVITY_CLEANUP_DELAY=90, FINAL_DATE_CLEANUP_DELAY=30)
    days = timedelta(days=current_app.config['FINAL_DATE_CLEANUP_DELAY'] - 5)
    dummy_newdle.final_dt = datetime.utcnow() - days
    db.session.commit()
    assert Newdle.query.count() == 1
    cli_runner.invoke(cleanup_newdles, [])
    assert Newdle.query.count() == 1


def test_cleanup_newdles_multiple_entries_final_task(
    cli_runner, create_newdle, override_config
):
    override_config(LAST_ACTIVITY_CLEANUP_DELAY=90, FINAL_DATE_CLEANUP_DELAY=30)
    newdle_1 = create_newdle(1)
    newdle_2 = create_newdle(2)
    create_newdle(3)
    assert Newdle.query.count() == 3
    days = timedelta(days=current_app.config['FINAL_DATE_CLEANUP_DELAY'] + 1)
    days_upd = timedelta(days=current_app.config['LAST_ACTIVITY_CLEANUP_DELAY'] + 1)
    newdle_1.final_dt = datetime.utcnow() - days
    newdle_1.last_update = datetime.utcnow() - days_upd

    days_upd = timedelta(days=current_app.config['LAST_ACTIVITY_CLEANUP_DELAY'] - 5)
    newdle_2.last_update = datetime.utcnow() - days_upd
    db.session.commit()

    cli_runner.invoke(cleanup_newdles, [])

    assert Newdle.query.count() == 2
