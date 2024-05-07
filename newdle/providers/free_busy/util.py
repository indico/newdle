from pathlib import Path

from flask import current_app

try:
    from msal import PublicClientApplication, SerializableTokenCache

    has_msal = True
except ImportError:
    has_msal = False


def get_msal_app():
    if not has_msal:
        raise Exception('msal not available')

    cache = SerializableTokenCache()
    cache_file = Path(current_app.config['EXCHANGE_PROVIDER_CACHE_FILE'])
    if cache_file.exists():
        cache.deserialize(cache_file.read_text())
    app = PublicClientApplication(
        current_app.config['EXCHANGE_PROVIDER_CLIENT_ID'],
        authority=current_app.config['EXCHANGE_PROVIDER_AUTHORITY'],
        token_cache=cache,
    )
    return app, cache, cache_file


def save_msal_cache(cache, cache_file: Path):
    if not cache.has_state_changed:
        return
    cache_file.touch(mode=0o600)  # create with safe permissions if new file
    cache_file.write_text(cache.serialize())


def get_msal_token(*, force=False):
    app, cache, cache_file = get_msal_app()
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
    save_msal_cache(cache, cache_file)
    return result.get('access_token')
