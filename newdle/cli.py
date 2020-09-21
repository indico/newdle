from datetime import datetime, timedelta

import click
from flask import Blueprint, current_app
from sqlalchemy import or_

from .core.db import db
from .models import Newdle


cli = Blueprint('newdle-cli', __name__, cli_group=None)


@cli.cli.command('cleanup-newdles')
@click.option(
    '-n',
    '--dry-run',
    is_flag=True,
    help='If enabled, does not commit changes to the DB.',
)
def cleanup_newdles(dry_run):
    """Removes old newdles from the database."""
    last_activity_cleanup_days = current_app.config['LAST_ACTIVITY_CLEANUP_INTERVAL']
    final_date_cleanup_days = current_app.config['FINAL_DATE_CLEANUP_INTERVAL']
    now = datetime.utcnow()
    if not last_activity_cleanup_days and not final_date_cleanup_days:
        current_app.logger.warn(
            'Nothing to do, LAST_ACTIVITY_CLEANUP_INTERVAL '
            'and FINAL_DATE_CLEANUP_INTERVAL are not set.'
        )
        return
    filters = []
    if last_activity_cleanup_days:
        last_activity_cleanup_interval = timedelta(days=last_activity_cleanup_days)
        filters.append(now - Newdle.last_update > last_activity_cleanup_interval)
    if final_date_cleanup_days:
        final_date_cleanup_interval = timedelta(days=final_date_cleanup_days)
        # XXX: This does not take the newdle's timezone into account, but a
        # few hours are not significant here
        filters.append(
            or_(
                Newdle.final_dt.is_(None),
                now - Newdle.final_dt > final_date_cleanup_interval,
            )
        )

    for newdle in Newdle.query.filter(*filters):
        current_app.logger.info(f'Deleting newdle {newdle.code} ({newdle.title})')
        db.session.delete(newdle)
    if dry_run:
        current_app.logger.info(
            'The script was run in dry-run mode, rolling back changes.'
        )
        db.session.rollback()
    else:
        db.session.commit()
