from flask import current_app

from newdle.core.cache import cache

try:
    from msal import PublicClientApplication, SerializableTokenCache

    has_msal = True
except ImportError:
    has_msal = False


def get_msal_app():
    if not has_msal:
        raise Exception('msal not available')

    token_cache = SerializableTokenCache()
    if cache_data := cache.get('exchange-token'):
        token_cache.deserialize(cache_data)
    app = PublicClientApplication(
        current_app.config['EXCHANGE_PROVIDER_CLIENT_ID'],
        authority=current_app.config['EXCHANGE_PROVIDER_AUTHORITY'],
        token_cache=token_cache,
    )
    return app, token_cache


def save_msal_cache(token_cache):
    if not token_cache.has_state_changed:
        return
    cache.set('exchange-token', token_cache.serialize(), timeout=0)


def get_msal_token(*, force=False):
    app, token_cache = get_msal_app()
    username = current_app.config['EXCHANGE_PROVIDER_ACCOUNT']
    if not (accounts := app.get_accounts(username)):
        return None
    # get cached token or use a refresh token
    assert len(accounts) == 1
    assert accounts[0]['username'] == username
    result = app.acquire_token_silent(
        scopes=[
            # 'https://outlook.office.com/Calendars.Read.Shared',
            'https://outlook.office.com/EWS.AccessAsUser.All',
        ],
        account=accounts[0],
        authority=None,
        force_refresh=force,
        claims_challenge=None,
    )
    if not result:
        return None

    # save cache in case we refreshed the token
    save_msal_cache(token_cache)
    return result.get('access_token')
