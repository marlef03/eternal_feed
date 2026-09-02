from datetime import datetime

from sqlalchemy import (
  DateTime,
  ForeignKey,
  Text,
  func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.base import Base


class Comment(Base):
  __tablename__ = 'comments'

  id: Mapped[int] = mapped_column(
    primary_key=True,
  )

  content: Mapped[str] = mapped_column(
    Text,
    nullable=False,
  )

  author_id: Mapped[int] = mapped_column(
    ForeignKey('users.id', ondelete="CASCADE"),
    nullable=False,
    index=True,
  )

  post_id: Mapped[int] = mapped_column(
    ForeignKey('posts.id', ondelete='CASCADE'),
    nullable=False,
    index=True,
  )

  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
  )

  author: Mapped['User'] = relationship(
    back_populates='comments',
  )

  post: Mapped['Post'] = relationship(
    back_populates='comments',
  )
