from datetime import datetime

from flask import g
from icalendar import Calendar, Event, vCalAddress, vText
from pytz import timezone, utc

from newdle.models import Availability


def _email_to_vcal_address(email):
    return vCalAddress(f'MAILTO:{email}')


def _add_participant_to_ical_event(event, participant):
    """Adds a participant as an attendee to an ical event."""
    attendee = _email_to_vcal_address(participant.email)
    attendee.params['cn'] = vText(participant.name)
    attendee.params['ROLE'] = vText('REQ-PARTICIPANT')
    event.add('attendee', attendee, encode=0)


def create_calendar_event(newdle, participant=None):
    """Create an icalendar event based on a newdle."""
    calendar = Calendar()
    event = Event()
    tz = timezone(newdle.timezone)

    if participant:
        start_dt = next(
            slot
            for slot, answer in participant.answers.items()
            if answer == Availability.available
        )
    else:
        start_dt = newdle.final_dt
    start_dt = tz.normalize(tz.localize(start_dt)).astimezone(utc)
    end_dt = start_dt + newdle.duration

    event.add('summary', newdle.title)
    event.add('dtstart', start_dt)
    event.add('dtend', end_dt)
    event.add('dtstamp', datetime.utcnow())

    organizer = _email_to_vcal_address(g.user['email'])
    organizer.params['cn'] = vText(newdle.creator_name)
    event['organizer'] = organizer

    if not newdle.private and not participant:
        participants = [p for p in newdle.participants if p.email]
        for participant in participants:
            _add_participant_to_ical_event(event, participant)

    calendar.add_component(event)
    return calendar.to_ical()
