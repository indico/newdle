#!/bin/sh

echo 'upgrading database to latest revision'
flask db upgrade

echo 'running uwsgi...'
exec uwsgi --ini /uwsgi.ini
