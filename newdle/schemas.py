from flask import url_for
from marshmallow import ValidationError, fields, post_dump, validates
from pytz import common_timezones_set

from .core.marshmallow import mm
from .core.util import DATETIME_FORMAT


class UserSchema(mm.Schema):
    email = fields.String()
    name = fields.Function(lambda u: f'{u["first_name"]} {u["last_name"]}')
    initials = fields.Function(lambda u: f'{u["first_name"][0]} {u["last_name"][0]}')
    uid = fields.String()


class UserSearchResultSchema(UserSchema):
    class Meta:
        fields = ('email', 'name', 'initials')

    @post_dump(pass_many=True)
    def sort_users(self, data, many, **kwargs):
        if many:
            data = sorted(data, key=lambda x: x['name'].lower())
        return data


class ParticipantSchema(mm.Schema):
    name = fields.String(required=True)
    email = fields.String()
    auth_uid = fields.String()


class NewNewdleSchema(mm.Schema):
    title = fields.String(validate=lambda x: len(x) >= 3, required=True)
    duration = fields.TimeDelta(
        precision=fields.TimeDelta.MINUTES,
        required=True,
        validate=lambda x: x.total_seconds() % 900 == 0,
    )
    timezone = fields.String(
        validate=lambda x: x in common_timezones_set, required=True
    )
    timeslots = fields.List(
        fields.DateTime(required=True, format=DATETIME_FORMAT),
        validate=bool,
        required=True,
    )
    participants = fields.List(fields.Nested(ParticipantSchema), missing=[])

    @validates('timeslots')
    def validate_timeslots(self, v):
        if len(set(v)) != len(v):
            raise ValidationError('Time slots are not unique')


class NewdleSchema(NewNewdleSchema):
    id = fields.Integer()
    code = fields.String()
    url = fields.Function(
        lambda newdle: url_for('api.get_newdle', code=newdle.code, _external=True)
    )
