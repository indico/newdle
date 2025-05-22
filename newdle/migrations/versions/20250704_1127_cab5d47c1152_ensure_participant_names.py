"""Ensure participant names

Revision ID: cab5d47c1152
Revises: 30b5fe7b5949
Create Date: 2025-07-04 11:27:08.792500
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = 'cab5d47c1152'
down_revision = '30b5fe7b5949'
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        UPDATE participants
        SET name = '?'
        WHERE name= '';
        """
    )


def downgrade():
    pass
