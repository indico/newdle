"""Add 'limited_slots' column to newdles

Revision ID: 30b5fe7b5949
Revises: 28103ebec68e
Create Date: 2022-04-29 09:45:12.950683
"""

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = '30b5fe7b5949'
down_revision = '28103ebec68e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'newdles',
        sa.Column(
            'limited_slots', sa.Boolean(), nullable=False, server_default='false'
        ),
    )


def downgrade():
    op.drop_column('newdles', 'limited_slots')
