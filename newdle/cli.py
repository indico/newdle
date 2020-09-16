from datetime import datetime, timedelta

from flask import Blueprint, current_app

from .core.db import db
from .models import Newdle


cli = Blueprint('newdle-cli', __name__, cli_group=None)


@cli.cli.command('cleanup-newdles')
def cleanup_newdles():
    """Removes old newdles from the database."""
    last_activity_cleanup_interval = timedelta(
        days=current_app.config['LAST_ACTIVITY_CLEANUP_INTERVAL']
    )
    final_date_cleanup_interval = timedelta(
        days=current_app.config['FINAL_DATE_CLEANUP_INTERVAL']
    )
    now = datetime.utcnow()
    # XXX: This does not take the newdle's timezone into account, but a
    # few hours are not significant here
    final_newdles_to_delete = Newdle.query.filter(
        Newdle.final_dt.isnot(None),
        Newdle.final_dt + final_date_cleanup_interval <= now,
    )
    for newdle in final_newdles_to_delete:
        db.session.delete(newdle)
    db.session.commit()

    incomplete_newdles_to_delete = Newdle.query.filter(
        Newdle.final_dt.is_(None),
        Newdle.last_update + last_activity_cleanup_interval <= now,
    )
    for newdle in incomplete_newdles_to_delete:
        db.session.delete(newdle)
    db.session.commit()
