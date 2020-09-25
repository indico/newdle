#!/usr/bin/env python
"""
Checks the consistency of the history, by comparing flask db
output and the filesystem ordering of files.
"""
import os
import re
import subprocess


def _get_db_revisions():
    output = (
        subprocess.check_output(['flask', 'db', 'history'])
        .decode('utf-8')
        .strip()
        .split('\n')
    )
    pattern = re.compile(r'^.* -> ([a-zA-Z0-9]+)( \(head\))?,')
    for line in output:
        for obj in pattern.finditer(line):
            yield obj.group(1)


def _get_file_revisions():
    root_path = 'newdle/migrations/versions'
    for f in sorted(os.listdir(root_path)):
        if f.endswith('.py'):
            file_path = os.path.join(root_path, f)
            op = (
                subprocess.check_output(
                    ['grep', '-Po', "(?<=^revision = ').*(?=')", file_path]
                )
                .decode('utf-8')
                .strip()
            )
            yield op


def _check_history_consistency():
    revisions = list(_get_db_revisions())
    file_revisions = list(_get_file_revisions())
    revisions.reverse()
    assert revisions != file_revisions


if __name__ == '__main__':
    _check_history_consistency()
