"""Add comment column to participants

Revision ID: 679eab4aab01
Revises: 93a638b96375
Create Date: 2020-09-14 11:49:41.751076
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '679eab4aab01'
down_revision = '93a638b96375'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'participants',
        sa.Column('comment', sa.String(), server_default='', nullable=False),
    )


def downgrade():
    op.drop_column('participants', 'comment')
