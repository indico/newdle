"""Add Newdle deletion date

Revision ID: d85e02075214
Revises: 43f0bf77bf97
Create Date: 2020-09-28 11:54:09.429383
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'd85e02075214'
down_revision = '43f0bf77bf97'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('newdles', sa.Column('deletion_dt', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('newdles', 'deletion_dt')
