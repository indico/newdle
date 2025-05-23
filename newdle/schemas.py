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

from newdle.core.marshmallow import mm
from newdle.core.util import (
    DATETIME_FORMAT,
    avatar_payload_from_participant,
    avatar_payload_from_user_info,
    check_user_signature,
    sign_user,
)
from newdle.models import Availability


class UserSchema(mm.Schema):
    email = fields.String()
    name = fields.String()
    uid = fields.String()
    avatar_url = fields.Function(
        lambda user: url_for(
            'api.user_avatar', payload=avatar_payload_from_user_info(user)
        )
    )

    @post_dump
    def sign(self, data, many, **kwargs):
        # Using uid vs auth_uid will generate a different signature
        return sign_user(
            {**data, 'auth_uid': data['uid']}, fields={'email', 'name', 'auth_uid'}
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


def validate_signature(data):
    data = dict(data)
    signature = data.pop('signature', None)
    if not signature or not check_user_signature(
        data, signature, fields=('name', 'email', 'auth_uid')
    ):
        raise ValidationError("Participant's user signature is invalid!")


class NewKnownParticipantSchema(NewUnknownParticipantSchema):
    email = fields.String(required=True)
    auth_uid = fields.String(required=True)
    signature = fields.String(required=True)

    @validates_schema
    def validate_participant(self, data, **kwargs):
        validate_signature(data)

    @post_load
    def remove_signature(self, data, **kwargs):
        """Remove signature, which is not needed after validation."""
        data.pop('signature', None)
        return data


class NewParticipantSchema(mm.Schema):
    """
    Represents a participant, being it new, existing, known or unknown.

    The participant can either be:
    - an existing one (defined by id)
    - a new unknown (defined by name)
    - a new known (defined by name, email and auth_uid)
    """

    id = fields.Integer()
    name = fields.String()
    email = fields.String(allow_none=True)
    auth_uid = fields.String(allow_none=True)
    signature = fields.String(allow_none=True)

    @validates_schema
    def validate_participant(self, data, **kwargs):
        if any(data.get(x) for x in ('email', 'auth_uid', 'signature')):
            validate_signature(data)

    @post_load
    def remove_signature(self, data, **kwargs):
        data.pop('signature', None)
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

    @validates('name')
    def name_not_empty(self, value):
        if not value or not value.strip():
            raise ValidationError('This field cannot be empty.')


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
    limited_slots = fields.Boolean()
    participants = fields.List(
        fields.Nested(NewKnownParticipantSchema, unknown=EXCLUDE), missing=[]
    )
    private = fields.Boolean(required=True)
    notify = fields.Boolean(required=True)

    @validates('timeslots')
    def validate_timeslots(self, v):
        if len(set(v)) != len(v):
            raise ValidationError('Time slots are not unique')


class UpdateNewdleSchema(NewNewdleSchema):
    participants = fields.List(fields.Nested(NewParticipantSchema, unknown=EXCLUDE))
    final_dt = fields.DateTime(format=DATETIME_FORMAT)


class NewdleSchema(NewNewdleSchema):
    id = fields.Integer()
    creator_name = fields.String()
    creator_uid = fields.String()
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
    available_timeslots = fields.List(fields.DateTime(format=DATETIME_FORMAT))


class MyNewdleSchema(NewdleSchema):
    class Meta:
        exclude = ('timeslots',)


class RestrictedNewdleSchema(NewdleSchema):
    class Meta:
        exclude = ('participants',)


class DeletedNewdleSchema(NewdleSchema):
    class Meta:
        fields = (
            'id',
            'creator_name',
            'creator_uid',
            'code',
            'deleted',
            'title',
        )


class NewdleParticipantSchema(ParticipantSchema):
    newdle = fields.Nested(RestrictedNewdleSchema)
