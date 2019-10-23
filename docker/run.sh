#!/bin/sh

echo 'upgrading database to latest revision'
FLASK_ENV=production FLASK_APP=newdle.wsgi flask db upgrade

echo 'running uwsgi...'
exec uwsgi --ini /uwsgi.ini
