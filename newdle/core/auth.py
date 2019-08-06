import requests
from authlib.flask.client import OAuth
from authlib.jose import jwk, jwt
from authlib.oidc.core import CodeIDToken, ImplicitIDToken, UserInfo
from flask import current_app
from itsdangerous import URLSafeTimedSerializer
from werkzeug.local import LocalProxy


oauth = OAuth()
oauth.register('oidc')

secure_serializer = LocalProxy(
    lambda: URLSafeTimedSerializer(current_app.config['SECRET_KEY'], b'newdle')
)


# based on https://github.com/authlib/loginpass/blob/master/loginpass/_core.py (BSD)
def parse_id_token(token_data, nonce):
    def load_key(header, payload):
        # TODO: cache this?
        jwk_set = requests.get(current_app.config['OIDC_JWKS_URL']).json()
        return jwk.loads(jwk_set, header.get('kid'))

    id_token = token_data['id_token']
    claims_params = {'nonce': nonce, 'client_id': current_app.config['OIDC_CLIENT_ID']}
    if 'access_token' in token_data:
        claims_params['access_token'] = token_data['access_token']
        claims_cls = CodeIDToken
    else:
        claims_cls = ImplicitIDToken
    claims_options = {'iss': {'values': [current_app.config['OIDC_ISSUER']]}}
    claims = jwt.decode(
        id_token,
        key=load_key,
        claims_cls=claims_cls,
        claims_options=claims_options,
        claims_params=claims_params,
    )
    claims.validate(leeway=120)
    return UserInfo(claims)


def app_token_from_id_token(id_token):
    return secure_serializer.dumps(
        {
            'email': id_token['email'],
            'first_name': id_token['given_name'],
            'last_name': id_token['family_name'],
            'uid': id_token['sub'],
        },
        salt='app-token',
    )


def app_token_from_dummy():
    return secure_serializer.dumps(
        {
            'email': 'example@example.com',
            'first_name': 'Guinea',
            'last_name': 'Pig',
            'uid': '-',
        },
        salt='app-token',
    )


def user_info_from_app_token(app_token):
    return secure_serializer.loads(
        app_token, salt='app-token', max_age=current_app.config['TOKEN_LIFETIME']
    )
