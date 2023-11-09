import csv
import datetime
from io import BytesIO, StringIO

from xlsxwriter import Workbook

from newdle.core.util import format_dt


def _generate_answers_for_export(newdle):
    slots = [format_dt(slot) for slot in newdle.timeslots]
    rows = []
    rows.append(['Participant name'] + slots + ['Comment'])

    for p in newdle.participants:
        answers = [p.name]
        for slot in newdle.timeslots:
            if answer := p.answers.get(slot):
                answers.append(answer.name)
            else:
                answers.append('')
        answers.append(p.comment)
        rows.append(answers)
    # Sort participants by name
    rows[1:] = sorted(rows[1:], key=lambda row: row[0])
    return rows


def export_answers_to_csv(newdle):
    rows = _generate_answers_for_export(newdle)
    buffer = BytesIO()
    output = StringIO()
    writer = csv.writer(output, dialect='unix')
    writer.writerows(rows)
    buffer.write(output.getvalue().encode('utf-8-sig'))
    buffer.seek(0)
    output.close()

    return buffer


def export_answers_to_xlsx(newdle):
    rows = _generate_answers_for_export(newdle)
    workbook_options = {
        'in_memory': True,
        'strings_to_formulas': False,
        'strings_to_numbers': False,
        'strings_to_urls': False,
    }

    buffer = BytesIO()
    with Workbook(buffer, workbook_options) as workbook:
        workbook.set_properties({'created': datetime.datetime.now()})
        bold = workbook.add_format({'bold': True})
        sheet = workbook.add_worksheet()
        sheet.write_row(0, 0, rows[0], bold)
        for row, values in enumerate(rows[1:], 1):
            sheet.write_row(row, 0, values)
    buffer.seek(0)
    return buffer
