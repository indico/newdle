import pytest

from newdle.core.util import sign_user
from newdle.schemas import NewParticipantSchema


@pytest.mark.usefixtures('app')
def test_new_participant_schema():
    schema = NewParticipantSchema()
    assert schema.validate({'id': 1, 'name': 'foo'}) == {}
    assert schema.validate({'name': 'foo'}) == {}
    assert schema.validate({'id': 1, 'name': 'foo', 'email': 'a@a.com'}) != {}
    assert (
        schema.validate({'name': 'foo', 'email': 'a@a.com', 'signature': 'foo'}) != {}
    )
    assert (
        schema.validate(
            sign_user(
                {'name': 'foo', 'email': 'a@a.com', 'auth_uid': '-'},
                fields=('name', 'email', 'auth_uid'),
            )
        )
        == {}
    )
