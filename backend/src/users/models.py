from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.base import Base


class User(Base):
  __tablename__ = 'users'

  id: Mapped[int] = mapped_column(
    primary_key=True,
  )

  display_name: Mapped[str] = mapped_column(
    String(50),
    nullable=False,
  )

  username: Mapped[str] = mapped_column(
    String(50),
    unique=True,
    index=True,
    nullable=False,
  )

  email: Mapped[str] = mapped_column(
    String(255),
    unique=True,
    index=True,
    nullable=False,
  )

  password_hash: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
  )

  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
  )

  posts: Mapped[list['Post']] = relationship(
    back_populates='author',
    cascade='all, delete-orphan',
  )

  comments: Mapped[list['Comment']] = relationship(
    back_populates='author',
    cascade='all, delete-orphan',
  )
