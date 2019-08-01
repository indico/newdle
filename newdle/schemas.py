from marshmallow import fields, post_dump
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


class SlotSchema(mm.Schema):
    start = fields.DateTime(required=True, format=DATETIME_FORMAT)
    end = fields.DateTime(required=True, format=DATETIME_FORMAT)


class NewNewdleSchema(mm.Schema):
    title = fields.String(validate=lambda x: len(x) >= 3, required=True)
    duration = fields.Int(required=True, validate=lambda x: x % 15 == 0)
    timezone = fields.String(
        validate=lambda x: x in common_timezones_set, required=True
    )
    time_slots = fields.List(fields.Nested(SlotSchema), validate=bool, required=True)
    participants = fields.List(fields.Nested(ParticipantSchema), missing=[])


class NewdleSchema(NewNewdleSchema):
    id = fields.Integer()
