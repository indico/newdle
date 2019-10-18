from flask import url_for
from marshmallow import (
    ValidationError,
    fields,
    post_dump,
    post_load,
    validate,
    validates,
    validates_schema,
)
from marshmallow_enum import EnumField
from pytz import common_timezones_set

from .core.marshmallow import mm
from .core.util import DATETIME_FORMAT, check_user_signature
from .models import Availability


class UserSchema(mm.Schema):
    email = fields.String()
    name = fields.Function(lambda u: f'{u["first_name"]} {u["last_name"]}')
    initials = fields.Function(lambda u: f'{u["first_name"][0]} {u["last_name"][0]}')
    uid = fields.String()


class UserSearchResultSchema(UserSchema):
    class Meta:
        fields = ('email', 'name', 'initials', 'uid')

    @post_dump(pass_many=True)
    def sort_users(self, data, many, **kwargs):
        if many:
            data = sorted(data, key=lambda x: x['name'].lower())
        return data


class NewAnonymousParticipantSchema(mm.Schema):
    name = fields.String(required=True)


class NewKnownParticipantSchema(NewAnonymousParticipantSchema):
    email = fields.String(required=True)
    auth_uid = fields.String(required=True)
    signature = fields.String(required=True)

    @validates_schema
    def validate_signature(self, data, **kwargs):
        data = dict(data)
        signature = data.pop('signature')
        auth_uid = data.pop('auth_uid')
        if not check_user_signature(dict(data, uid=auth_uid), signature):
            raise ValidationError("Participant's user signature is invalid!")

    @post_load
    def remove_signature(self, data, **kwargs):
        """Remove signature, which is not needed after validation."""
        del data['signature']
        return data


class ParticipantSchema(mm.Schema):
    name = fields.String()
    email = fields.String()
    auth_uid = fields.String()
    code = fields.String()
    answers = fields.Mapping(
        fields.DateTime(format=DATETIME_FORMAT), EnumField(Availability)
    )


class UpdateParticipantSchema(mm.Schema):
    answers = fields.Mapping(
        fields.DateTime(format=DATETIME_FORMAT), EnumField(Availability)
    )


class UpdateNewdleSchema(mm.Schema):
    final_dt = fields.DateTime(format=DATETIME_FORMAT)


class NewNewdleSchema(mm.Schema):
    title = fields.String(validate=validate.Length(min=3, max=80), required=True)
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
    participants = fields.List(fields.Nested(NewKnownParticipantSchema), missing=[])
    final_dt = fields.DateTime(format=DATETIME_FORMAT)

    @validates('timeslots')
    def validate_timeslots(self, v):
        if len(set(v)) != len(v):
            raise ValidationError('Time slots are not unique')


class NewdleSchema(NewNewdleSchema):
    id = fields.Integer()
    creator_name = fields.String()
    code = fields.String()
    final_dt = fields.DateTime(format=DATETIME_FORMAT)
    url = fields.Function(
        lambda newdle: url_for('newdle', code=newdle.code, _external=True)
    )
    participants = fields.List(fields.Nested(ParticipantSchema))


class MyNewdleSchema(NewdleSchema):
    class Meta:
        exclude = ('timeslots',)


class RestrictedNewdleSchema(NewdleSchema):
    class Meta:
        exclude = ('participants',)
