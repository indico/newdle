#!/usr/bin/env python
"""
Checks the consistency of the history, by comparing flask db
output and the filesystem ordering of files.
"""
import re
import subprocess
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
    for pyfile in sorted(root_path.glob('*.py')):
        global_vars = dict()
        code = compile(pyfile.read_text(), 'migration', 'exec')
        exec(code, global_vars)
        yield global_vars['revision']


def _check_history_consistency():
    revisions = list(_iter_db_revisions())
    file_revisions = list(_iter_file_revisions())
    revisions.reverse()
    assert revisions == file_revisions


if __name__ == '__main__':
    _check_history_consistency()
