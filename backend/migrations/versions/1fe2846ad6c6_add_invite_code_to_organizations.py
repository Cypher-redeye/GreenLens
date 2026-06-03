"""add invite_code to organizations

Revision ID: 1fe2846ad6c6
Revises: c86f21b0e333
Create Date: 2026-06-03 11:29:43.080733

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1fe2846ad6c6'
down_revision: Union[str, None] = 'c86f21b0e333'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('organizations', sa.Column('invite_code', sa.String(), nullable=True))
    op.create_index(op.f('ix_organizations_invite_code'), 'organizations', ['invite_code'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_organizations_invite_code'), table_name='organizations')
    op.drop_column('organizations', 'invite_code')
