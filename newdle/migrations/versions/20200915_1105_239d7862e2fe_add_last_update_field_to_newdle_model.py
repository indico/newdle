"""Add last update field to newdle model

Revision ID: 239d7862e2fe
Revises: 93a638b96375
Create Date: 2020-09-15 11:05:54.446898
"""

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = '239d7862e2fe'
down_revision = '93a638b96375'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'newdles',
        sa.Column(
            'last_update',
            sa.DateTime(),
            server_default=sa.text("(now() at time zone 'utc')::timestamp"),
            nullable=False,
        ),
    )


def downgrade():
    op.drop_column('newdles', 'last_update')
