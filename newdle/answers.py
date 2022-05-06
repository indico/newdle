from collections import Counter

from newdle.core.util import format_dt
from newdle.models import Availability


def validate_answers(newdle, participant, answers):
    invalid = answers.keys() - set(newdle.timeslots)
    if invalid:
        return {
            'code': 422,
            'messages': {
                'answers': {
                    format_dt(key): {'key': ['Invalid timeslot']} for key in invalid
                }
            },
        }

    if newdle.limited_slots:
        # 'ifneedbe' is not allowed for newdles with limited slots
        if Availability.ifneedbe in answers.values():
            return {
                'code': 422,
                'messages': {
                    'answers': [
                        "'if-need-be' is not allowed in newdles with limited slots"
                    ]
                },
            }

        # Must have at most one 'available'
        counts = Counter(answers.values())
        if counts[Availability.available] > 1:
            return {
                'code': 422,
                'messages': {'answers': ["At most one 'available' may be present"]},
            }

        # The slot must not be already taken
        timeslot = next(
            (
                slot
                for slot, availability in answers.items()
                if availability == Availability.available
            ),
            None,
        )
        if timeslot is not None and any(
            p.answers.get(timeslot) == Availability.available
            for p in newdle.participants
            if p.code != participant.code
        ):
            return {
                'code': 409,
                'messages': {'answers': ['The selected timeslot is already taken']},
            }
