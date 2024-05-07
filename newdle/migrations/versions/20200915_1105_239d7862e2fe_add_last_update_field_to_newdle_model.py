"""Add last update field to newdle model

Revision ID: 239d7862e2fe
Revises: 679eab4aab01
Create Date: 2020-09-15 11:05:54.446898
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '239d7862e2fe'
down_revision = '679eab4aab01'
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
    op.execute(
        """
        UPDATE newdles
        SET last_update = final_dt
        WHERE final_dt IS NOT NULL AND final_dt < now() AT TIME ZONE 'utc';
        """
    )


def downgrade():
    op.drop_column('newdles', 'last_update')
