# Anything in here is using CERN-specific APIs, and should eventually be moved into
# a separate package (e.g. using setuptools entry points or a config option pointing
# to a package).

from .core.auth import multipass


def search_cern_users(q, limit):
    # TODO: refactor this to not have anything specific to the CERN user search.
    # but this probably needs a new API in multipass since right now we have no
    # way to specify the limits etc.
    # the code below also only works with the 'cern' multipass identity provider..

    provider = multipass.identity_providers['newdle-search']
    params = {
        'limit': limit,
        'filter': ['type:eq:Person', 'source:eq:cern', f'displayName:contains:{q}'],
        'field': [
            'upn',
            'displayName',
            'firstName',
            'lastName',
            'primaryAccountEmail',
        ],
    }
    with provider._get_api_session() as api_session:
        resp = api_session.get(
            f'{provider.authz_api_base}/api/v1.0/Identity', params=params
        )
        resp.raise_for_status()
        data = resp.json()

    users = [
        {
            'email': user['primaryAccountEmail'],
            'first_name': user['firstName'],
            'last_name': user['lastName'],
            'uid': user['upn'],
        }
        for user in data['data']
        # XXX: skip identities with no account in the cern authentication
        # database and thus no email
        if user['primaryAccountEmail']
    ]
    return data['pagination']['total'], users
