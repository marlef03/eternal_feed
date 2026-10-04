"""change posts, comments, users created_at to TIMESTAMP with precision up to millis

Revision ID: e39f52293275
Revises: 4c31aad887de
Create Date: 2026-09-30 14:44:57.179326

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import TIMESTAMP


# revision identifiers, used by Alembic.
revision: str = 'e39f52293275'
down_revision: Union[str, Sequence[str], None] = '4c31aad887de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "users",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=TIMESTAMP(timezone=True, precision=3),
    )

    op.alter_column(
        "posts",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=TIMESTAMP(timezone=True, precision=3),
    )

    op.alter_column(
        "comments",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=TIMESTAMP(timezone=True, precision=3),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "users",
        "created_at",
        existing_type=TIMESTAMP(timezone=True, precision=3),
        type_=sa.DateTime(timezone=True),
    )

    op.alter_column(
        "posts",
        "created_at",
        existing_type=TIMESTAMP(timezone=True, precision=3),
        type_=sa.DateTime(timezone=True),
    )

    op.alter_column(
        "comments",
        "created_at",
        existing_type=TIMESTAMP(timezone=True, precision=3),
        type_=sa.DateTime(timezone=True),
    )
