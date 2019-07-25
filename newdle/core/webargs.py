from webargs import flaskparser


def _strip_whitespace(s):
    if isinstance(s, str):
        s = s.strip()
    return s


class FlaskParser(flaskparser.FlaskParser):
    """A custom webargs flask parser that strips surrounding whitespace."""

    def parse_arg(self, name, field, req, locations=None):
        rv = super(FlaskParser, self).parse_arg(name, field, req, locations=locations)
        if isinstance(rv, str):
            return rv.strip()
        elif isinstance(rv, (list, set)):
            return type(rv)(map(_strip_whitespace, rv))
        return rv


parser = FlaskParser()
use_args = parser.use_args
use_kwargs = parser.use_kwargs
