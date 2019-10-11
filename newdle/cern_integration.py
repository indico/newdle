# Anything in here is using CERN-specific APIs, and should eventually be moved into
# a separate package (e.g. using setuptools entry points or a config option pointing
# to a package).

from authlib.oauth2.rfc6749 import OAuth2Token
from flask import current_app

from .core.cache import cache
from .oauth_util import ExchangingOAuth2Session


def get_authz_api_oauth_session():
    def _update_token(token):
        expiry = max(token['expires_in'], token['refresh_expires_in'])
        cache.set('cern-authz-api-token', token, expiry)

    oauth_session = ExchangingOAuth2Session(
        current_app.config['OIDC_CLIENT_ID'],
        current_app.config['OIDC_CLIENT_SECRET'],
        current_app.config['OIDC_ACCESS_TOKEN_URL'],
        'authorization-service-api',
        token_updater=_update_token,
    )
    token_data = cache.get('cern-authz-api-token')
    if token_data is not None:
        oauth_session.token = OAuth2Token.from_dict(token_data)
    # Get a token if we don't have one from the cache
    oauth_session.ensure_token()
    return oauth_session


def search_cern_users(q, limit):
    oauth_session = get_authz_api_oauth_session()
    res = oauth_session.get(
        'https://authorization-service-api.web.cern.ch/api/v1.0/Identity',
        params={
            'limit': limit,
            'filter': ['type:eq:Person', 'source:eq:cern', f'displayName:contains:{q}'],
            'field': ['upn', 'displayName', 'firstName', 'lastName'],
            'sort': ['displayName', 'upn'],
        },
    )
    data = res.json()
    users = [
        {
            # the api doesn't return emails yet...
            'email': f"{user['upn']}@cern.ch",
            'first_name': user['firstName'],
            'last_name': user['lastName'],
            'uid': user['upn'],
        }
        for user in data['data']
    ]
    return data['pagination']['total'], users
