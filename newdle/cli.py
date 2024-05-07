import sys
from datetime import datetime, timedelta

import click
from flask import Blueprint, current_app
from sqlalchemy import and_, or_

from newdle.core.db import db
from newdle.models import Newdle
from newdle.providers.free_busy.util import (
    get_msal_app,
    get_msal_token,
    save_msal_cache,
)

try:
    import exchangelib
except ImportError:
    exchangelib = None


cli = Blueprint('newdle-cli', __name__, cli_group=None)


@cli.cli.command('cleanup-newdles')
@click.option(
    '-n',
    '--dry-run',
    is_flag=True,
    help='If enabled, does not commit changes to the DB.',
)
def cleanup_newdles(dry_run):
    """Remove old newdles from the database."""
    last_activity_cleanup_days = current_app.config['LAST_ACTIVITY_CLEANUP_DELAY']
    final_date_cleanup_days = current_app.config['FINAL_DATE_CLEANUP_DELAY']
    deleted_cleanup_days = current_app.config['DELETED_CLEANUP_DELAY']
    now = datetime.utcnow()
    if (
        not last_activity_cleanup_days
        and not final_date_cleanup_days
        and not deleted_cleanup_days
    ):
        current_app.logger.warn(
            'Nothing to do, LAST_ACTIVITY_CLEANUP_DELAY, '
            'DELETED_CLEANUP_DELAY and FINAL_DATE_CLEANUP_DELAY are not set.'
        )
        return
    filters = []
    deleted_filter = False
    if last_activity_cleanup_days:
        last_activity_cleanup_delay = timedelta(days=last_activity_cleanup_days)
        filters.append(now - Newdle.last_update > last_activity_cleanup_delay)
    if deleted_cleanup_days:
        deleted_cleanup_delay = timedelta(days=deleted_cleanup_days)
        deleted_filter = now - Newdle.deletion_dt > deleted_cleanup_delay
    if final_date_cleanup_days:
        final_date_cleanup_delay = timedelta(days=final_date_cleanup_days)
        # XXX: This does not take the newdle's timezone into account, but a
        # few hours are not significant here
        filters.append(
            or_(
                Newdle.final_dt.is_(None),
                now - Newdle.final_dt > final_date_cleanup_delay,
            )
        )

    for newdle in Newdle.query.filter(and_(*filters) | deleted_filter):
        current_app.logger.info(f'Deleting newdle {newdle.code} ({newdle.title})')
        db.session.delete(newdle)
    if dry_run:
        current_app.logger.info(
            'The script was run in dry-run mode, rolling back changes.'
        )
        db.session.rollback()
    else:
        db.session.commit()


@cli.cli.command('exchange-token')
@click.option(
    '-f',
    '--force',
    is_flag=True,
    help='Get a new token even if one may already exist',
)
@click.option(
    '-d',
    '--dump-token',
    is_flag=True,
    help='Dump the token on stdout',
)
def get_exchange_token(force, dump_token):
    """Get a "modern auth" Exchange token."""
    if exchangelib is None:
        print('exchangelib is not available')
        sys.exit(1)

    app, cache, cache_file = get_msal_app()
    username = current_app.config['EXCHANGE_PROVIDER_ACCOUNT']
    if token := get_msal_token(force=force):
        print(f'Got access token for {username}')
        if dump_token:
            print(token)
        sys.exit(0)

    flow = app.initiate_device_flow(
        scopes=['https://outlook.office.com/EWS.AccessAsUser.All']
    )
    if 'user_code' not in flow:
        print(f'Could not create device flow. Error: {flow}')
        sys.exit(1)
    print(flow['message'], flush=True)
    result = app.acquire_token_by_device_flow(flow)

    if 'access_token' not in result:
        print(f'Error getting access_token: {result}')
        sys.exit(1)

    accounts = app.get_accounts(username)
    assert len(accounts) == 1
    assert accounts[0]['username'] == username

    save_msal_cache(cache, cache_file)
    print(f'Got access token for {username}')
    if dump_token:
        print(result['access_token'])
