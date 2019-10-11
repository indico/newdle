import time

from authlib.client import AuthlibBaseError, OAuth2Session


class ExchangingOAuth2Session(OAuth2Session):
    """
    This behaves almost like a normal OAuth2Session except that it will
    exchange its token to one for a different audience.

    It also takes care of refreshing the refresh token once it expired.
    """

    def __init__(self, client_id, client_secret, access_token_url, audience, **kwargs):
        super(ExchangingOAuth2Session, self).__init__(
            client_id, client_secret, refresh_token_url=access_token_url, **kwargs
        )
        self.access_token_url = access_token_url
        self.audience = audience
        self.register_compliance_hook('access_token_response', self._exchange_token)
        self.register_compliance_hook('refresh_token_response', self._exchange_token)

    def _exchange_token(self, resp):
        token = resp.json()
        if 'error' in token:
            # Something went wrong, we probably can't exchange anything..
            return resp
        session = OAuth2Session(
            self.client_id, self.client_auth.client_secret, token=token
        )
        exchanged_token = session.fetch_access_token(
            self.access_token_url,
            grant_type='urn:ietf:params:oauth:grant-type:token-exchange',
            audience=self.audience,
            subject_token=token['access_token'],
        )
        resp.json = lambda: exchanged_token
        return resp

    def _is_refresh_token_expired(self):
        issued_time = self.token['expires_at'] - self.token['expires_in']
        refresh_expires_at = issued_time + self.token['refresh_expires_in']
        return refresh_expires_at < time.time()

    def refresh_token(
        self, url=None, refresh_token=None, body='', auth=None, headers=None, **kwargs
    ):
        assert refresh_token is None or refresh_token == self.token['refresh_token']
        if self._is_refresh_token_expired():
            self.ensure_token(force=True)
            return self.token
        try:
            return super(ExchangingOAuth2Session, self).refresh_token(
                url, refresh_token, body, auth, headers, **kwargs
            )
        except AuthlibBaseError as exc:
            if exc.error != 'invalid_grant':
                raise
            # refresh token is not usable for some reason
            self.ensure_token(force=True)
            return self.token

    def ensure_token(self, force=False):
        """Retrieve a token if none is available.

        Call this before using the session to make sure there is a token,
        even if none was provided explicitly (e.g. from a cache).

        :param force: Whether to get a new token regardless of an existing one.
        """
        if self.token is None or force:
            self.fetch_access_token(
                self.access_token_url, grant_type='client_credentials'
            )
            if self.token_updater and self.token:
                self.token_updater(self.token)
