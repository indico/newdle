from marshmallow import fields, post_dump

from .core.marshmallow import mm


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
