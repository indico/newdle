import typing

from marshmallow import EXCLUDE
from webargs import flaskparser


def _strip_whitespace(value):
    if isinstance(value, str):
        value = value.strip()
    elif isinstance(value, typing.Mapping):
        return {k: _strip_whitespace(value[k]) for k in value}
    elif isinstance(value, (list, tuple)):
        return type(value)(map(_strip_whitespace, value))
    return value


class WhitspaceStrippingFlaskParser(flaskparser.FlaskParser):
    def pre_load(self, location_data, *, schema, req, location):
        if location in ('query', 'form', 'json'):
            return _strip_whitespace(location_data)
        return location_data


parser = WhitspaceStrippingFlaskParser(unknown=EXCLUDE)


@parser.error_handler
def handle_error(error, req, schema, *, error_status_code, error_headers):
    # since 6.0.0b7 errors are namespaced by their source. this is nice for APIs taking
    # data from different locations to serve very specific errors, but in a typical web
    # app where you usually have only one source and certainly not the same field name in
    # different locations, it just makes handling errors in JS harder since we suddenly
    # have to care if it's form data or json data
    namespaced = error.messages  # mutating this below is safe
    error.messages = namespaced.popitem()[1]
    assert not namespaced  # we never expect to have more than one location
    parser.handle_error(
        error,
        req,
        schema,
        error_status_code=error_status_code,
        error_headers=error_headers,
    )


use_args = parser.use_args
use_kwargs = parser.use_kwargs
abort = flaskparser.abort
