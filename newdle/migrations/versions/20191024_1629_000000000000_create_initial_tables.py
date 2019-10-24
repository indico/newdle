"""Create initial tables

Revision ID: 000000000000
Create Date: 2019-10-24 16:29:39.913975
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '000000000000'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'newdles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('creator_uid', sa.String(), nullable=False),
        sa.Column('creator_name', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('duration', sa.Interval(), nullable=False),
        sa.Column('timezone', sa.String(), nullable=False),
        sa.Column('timeslots', postgresql.ARRAY(sa.DateTime()), nullable=False),
        sa.Column('final_dt', sa.DateTime(), nullable=True),
        sa.Column('code', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_newdles')),
    )
    op.create_index(
        op.f('ix_newdles_creator_uid'), 'newdles', ['creator_uid'], unique=False
    )
    op.create_index(op.f('ix_uq_newdles_code'), 'newdles', ['code'], unique=True)
    op.create_table(
        'participants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('auth_uid', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('answers', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('newdle_id', sa.Integer(), nullable=False),
        sa.CheckConstraint(
            '(email IS NULL) = (auth_uid IS NULL)',
            name=op.f('ck_participants_email_uid_null'),
        ),
        sa.ForeignKeyConstraint(
            ['newdle_id'],
            ['newdles.id'],
            name=op.f('fk_participants_newdle_id_newdles'),
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_participants')),
    )
    op.create_index(
        op.f('ix_participants_newdle_id'), 'participants', ['newdle_id'], unique=False
    )
    op.create_index(
        op.f('ix_uq_participants_code'), 'participants', ['code'], unique=True
    )


def downgrade():
    op.drop_index(op.f('ix_uq_participants_code'), table_name='participants')
    op.drop_index(op.f('ix_participants_newdle_id'), table_name='participants')
    op.drop_table('participants')
    op.drop_index(op.f('ix_uq_newdles_code'), table_name='newdles')
    op.drop_index(op.f('ix_newdles_creator_uid'), table_name='newdles')
    op.drop_table('newdles')
