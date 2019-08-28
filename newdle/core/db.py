from flask_migrate import Migrate
from flask_sqlalchemy import Model, SQLAlchemy
from flask_sqlalchemy.model import BindMetaMixin
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base


def _column_names(constraint, table):
    return '_'.join((c if isinstance(c, str) else c.name) for c in constraint.columns)


def _unique_index(constraint, table):
    return 'uq_' if constraint.unique else ''


class _NoNameGenMeta(BindMetaMixin, DeclarativeMeta):
    # This is like Flask-SQLAlchemy's default metaclass but without
    # generating table names (i.e. a model without an explicit table
    # name will fail instead of getting a name set implicitly)
    pass


_naming_convention = {
    'fk': 'fk_%(table_name)s_%(column_names)s_%(referred_table_name)s',
    'pk': 'pk_%(table_name)s',
    'ix': 'ix_%(unique_index)s%(table_name)s_%(column_names)s',
    'ck': 'ck_%(table_name)s_%(constraint_name)s',
    'uq': 'uq_%(table_name)s_%(column_names)s',
    'column_names': _column_names,
    'unique_index': _unique_index,
}

db = SQLAlchemy(
    model_class=declarative_base(cls=Model, metaclass=_NoNameGenMeta, name='Model')
)
db.Model.metadata.naming_convention = _naming_convention

migrate = Migrate(db=db)
