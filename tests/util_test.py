from newdle.core.util import check_user_signature, sign_user


def test_signatures():
    user = {'name': 'Leroy Jenkins', 'email': 'jenkiiins@example.com', 'uid': 'leroy'}

    assert sign_user(user) == {
        'name': 'Leroy Jenkins',
        'email': 'jenkiiins@example.com',
        'uid': 'leroy',
        'signature': 'c2fYpLArdmnNyq45uKbx7bdMrTs',
    }


def test_signature_check():
    user_data = {
        'name': 'Leroy Jenkins',
        'email': 'jenkiiins@example.com',
        'uid': 'leroy',
    }
    assert check_user_signature(user_data, 'c2fYpLArdmnNyq45uKbx7bdMrTs')

    # check that a small change in the data results in failing verification
    user_data['uid'] = 'leroz'
    assert not check_user_signature(user_data, 'c2fYpLArdmnNyq45uKbx7bdMrTs')
