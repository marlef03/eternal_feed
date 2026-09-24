"""[fix]: add ON DELETE for user_id foreign key in refresh_ressions table

Revision ID: 4c31aad887de
Revises: 82e3a5ef2149
Create Date: 2026-09-24 17:50:54.259063

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4c31aad887de'
down_revision: Union[str, Sequence[str], None] = '82e3a5ef2149'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        constraint_name="refresh_sessions_user_id_fkey",
        table_name="refresh_sessions",
        type_="foreignkey",
    )

    op.create_foreign_key(
        constraint_name="refresh_sessions_user_id_fkey",
        source_table="refresh_sessions",
        referent_table="users",
        local_cols=["user_id"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        constraint_name="refresh_sessions_user_id_fkey",
        table_name="refresh_sessions",
        type_="foreignkey",
    )

    op.create_foreign_key(
        constraint_name="refresh_sessions_user_id_fkey",
        source_table="refresh_sessions",
        referent_table="users",
        local_cols=["user_id"],
        remote_cols=["id"],
    )
