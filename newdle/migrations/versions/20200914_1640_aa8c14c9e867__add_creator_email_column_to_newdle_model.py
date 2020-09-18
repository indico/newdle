"""Add creator email column to Newdle model

Revision ID: aa8c14c9e867
Revises: c161fdcfab19
Create Date: 2020-09-14 16:40:23.418303
"""

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = 'aa8c14c9e867'
down_revision = 'c161fdcfab19'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'newdles',
        sa.Column('creator_email', sa.String(), server_default='', nullable=False),
    )


def downgrade():
    op.drop_column('newdles', 'creator_email')
