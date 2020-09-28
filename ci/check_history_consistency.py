#!/usr/bin/env python
"""
Checks the consistency of the history, by comparing flask db
output and the filesystem ordering of files.
"""
import re
import subprocess
import sys
from pathlib import Path


def _iter_db_revisions():
    output = (
        subprocess.check_output(['flask', 'db', 'history'], text=True)
        .strip()
        .split('\n')
    )
    pattern = re.compile(r'^.* -> ([a-zA-Z0-9]+)( \(head\))?,')
    for line in output:
        for obj in pattern.finditer(line):
            yield obj.group(1)


def _iter_file_revisions():
    root_path = Path('newdle/migrations/versions')
    pattern = re.compile(r"\srevision = '(.*)'")
    for pyfile in sorted(root_path.glob('*.py')):
        results = pattern.findall(pyfile.read_text())
        yield results[0]


def _check_history_consistency():
    revisions = list(_iter_db_revisions())
    file_revisions = list(_iter_file_revisions())
    revisions.reverse()

    if revisions != file_revisions:
        print(
            'The order of revisions in the database and in the filesystem is different. '
            'Please review them and make sure the revision history is linear. '
            'Make sure that all the migrations have a distinct "down_revision".'
        )
        sys.exit(1)


if __name__ == '__main__':
    _check_history_consistency()
