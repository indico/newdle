"""Add creator email and notify columns to newdle model

Revision ID: 43f0bf77bf97
Revises: 239d7862e2fe
Create Date: 2020-09-22 17:59:41.990893
"""

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = '43f0bf77bf97'
down_revision = '239d7862e2fe'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'newdles',
        sa.Column('creator_email', sa.String(), server_default='', nullable=False),
    )
    op.add_column(
        'newdles',
        sa.Column('notify', sa.Boolean(), server_default='false', nullable=False),
    )
    op.alter_column(
        'newdles',
        'notify',
        server_default='true',
    )


def downgrade():
    op.drop_column('newdles', 'notify')
    op.drop_column('newdles', 'creator_email')
