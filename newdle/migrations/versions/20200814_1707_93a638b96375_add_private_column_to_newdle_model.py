"""Add private column to Newdle model

Revision ID: 93a638b96375
Revises: 000000000000
Create Date: 2020-08-14 17:07:47.546630
"""

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = '93a638b96375'
down_revision = '000000000000'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'newdles',
        sa.Column('private', sa.Boolean(), nullable=False, server_default='true'),
    )
    op.alter_column(
        'newdles',
        'private',
        server_default='false',
    )


def downgrade():
    op.drop_column('newdles', 'private')
