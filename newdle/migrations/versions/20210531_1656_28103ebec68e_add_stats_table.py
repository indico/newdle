"""Add stats table

Revision ID: 28103ebec68e
Revises: d85e02075214
Create Date: 2021-05-31 16:56:28.134498
"""

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = '28103ebec68e'
down_revision = 'd85e02075214'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'stats',
        sa.Column('key', sa.String(), nullable=False, primary_key=True),
        sa.Column('value', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('key', name=op.f('pk_stats')),
    )
    op.execute(
        '''
        INSERT INTO stats (key, value)
        SELECT 'newdles_created', COUNT(*) FROM newdles;

        INSERT INTO stats (key, value)
        SELECT 'participants_created', COUNT(*) FROM participants;
        '''
    )


def downgrade():
    op.drop_table('stats')
