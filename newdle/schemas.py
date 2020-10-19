from flask import url_for
from marshmallow import (
    EXCLUDE,
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
from .core.util import (
    DATETIME_FORMAT,
    avatar_payload_from_participant,
    avatar_payload_from_user_info,
    check_user_signature,
    sign_user,
)
from .models import Availability


class UserSchema(mm.Schema):
    email = fields.String()
    name = fields.Function(lambda u: f'{u["first_name"]} {u["last_name"]}')
    uid = fields.String()
    avatar_url = fields.Function(
        lambda user: url_for(
            'api.user_avatar', payload=avatar_payload_from_user_info(user)
        )
    )


class UserSearchResultSchema(UserSchema):
    class Meta:
        fields = ('email', 'name', 'uid', 'avatar_url')

    @post_dump
    def sign(self, data, many, **kwargs):
        # Using uid vs auth_uid will generate a different signature
        return sign_user(
            {**data, 'auth_uid': data['uid']}, fields={'email', 'name', 'auth_uid'}
        )

    @post_dump(pass_many=True)
    def sort_users(self, data, many, **kwargs):
        if many:
            data = sorted(data, key=lambda x: x['name'].lower())
        return data


class NewUnknownParticipantSchema(mm.Schema):
    name = fields.String(required=True)


class NewKnownParticipantSchema(NewUnknownParticipantSchema):
    email = fields.String(required=True)
    auth_uid = fields.String(required=True)
    signature = fields.String(required=True)

    @validates_schema
    def validate_signature(self, data, **kwargs):
        data = dict(data)
        signature = data.pop('signature')
        if not check_user_signature(data, signature):
            raise ValidationError("Participant's user signature is invalid!")

    @post_load
    def remove_signature(self, data, **kwargs):
        """Remove signature, which is not needed after validation."""
        del data['signature']
        return data


class ParticipantSchema(mm.Schema):
    id = fields.Int()
    name = fields.String()
    email = fields.String()
    auth_uid = fields.String()
    code = fields.String()
    answers = fields.Mapping(
        fields.DateTime(format=DATETIME_FORMAT), EnumField(Availability)
    )
    comment = fields.String()
    avatar_url = fields.Function(
        lambda participant: url_for(
            'api.user_avatar', payload=avatar_payload_from_participant(participant)
        )
    )


class RestrictedParticipantSchema(ParticipantSchema):
    class Meta:
        exclude = ('code',)

    @post_dump
    def sign(self, data, many, **kwargs):
        if data['auth_uid'] is not None:
            return sign_user(data, fields={'email', 'name', 'auth_uid'})
        return data


class UpdateParticipantSchema(mm.Schema):
    answers = fields.Mapping(
        fields.DateTime(format=DATETIME_FORMAT), EnumField(Availability)
    )
    comment = fields.String(default='')


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
    participants = fields.List(
        fields.Nested(NewKnownParticipantSchema, unknown=EXCLUDE), missing=[]
    )
    final_dt = fields.DateTime(format=DATETIME_FORMAT)
    private = fields.Boolean(required=True)
    notify = fields.Boolean(required=True)

    @validates('timeslots')
    def validate_timeslots(self, v):
        if len(set(v)) != len(v):
            raise ValidationError('Time slots are not unique')


class NewdleSchema(NewNewdleSchema):
    id = fields.Integer()
    creator_name = fields.String()
    creator_uid = fields.String()
    creator_email = fields.String()
    code = fields.String()
    final_dt = fields.DateTime(format=DATETIME_FORMAT)
    deletion_dt = fields.DateTime(format=DATETIME_FORMAT)
    url = fields.Function(
        lambda newdle: url_for('newdle', code=newdle.code, _external=True)
    )
    participants = fields.List(fields.Nested(RestrictedParticipantSchema))
    private = fields.Boolean()
    notify = fields.Boolean()
    deleted = fields.Boolean()


class MyNewdleSchema(NewdleSchema):
    class Meta:
        exclude = ('timeslots',)


class RestrictedNewdleSchema(NewdleSchema):
    class Meta:
        exclude = ('participants',)


class DeletedNewdleSchema(NewdleSchema):
    class Meta:
        fields = ('id', 'creator_name', 'creator_uid', 'code', 'deleted', 'title')


class NewdleParticipantSchema(ParticipantSchema):
    newdle = fields.Nested(RestrictedNewdleSchema)
