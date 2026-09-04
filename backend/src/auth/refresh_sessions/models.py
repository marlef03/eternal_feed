from __future__ import annotations

from typing import TYPE_CHECKING

from datetime import datetime

from sqlalchemy import (
  DateTime,
  ForeignKey,
  String,
  BigInteger,
  func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.base import Base

if TYPE_CHECKING:
  from src.users.models import User


class RefreshSession(Base):
  __tablename__ = 'refresh_sessions'

  id: Mapped[int] = mapped_column(
    BigInteger,
    primary_key=True,
  )

  user_id: Mapped[int] = mapped_column(
    ForeignKey('users.id'),
    nullable=False,
    index=True,
  )

  token_hash: Mapped[str] = mapped_column(
    String(64),
    unique=True,
    nullable=False,
    index=True,
  )

  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    nullable=False,
  )

  expires_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    nullabe=False,
  )

  revoked_at: Mapped[datetime | None] = mapped_column(
    DateTime(timezone=True),
  )

  user: Mapped[User] = relationship(
    back_populates='refresh_sessions',
  )
