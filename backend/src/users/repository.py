from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.users.models import User


class UserRepository:

  def __init__(self, session: AsyncSession):
    self.session = session

  async def get_by_id(self, user_id: int) -> User | None:
    result = await self.session.execute(
      select(User).where(User.id == user_id)
    )

    return result.scalar_one_or_none()
  
  async def get_by_username(self, username: str) -> User | None:
    result = await self.session.execute(
      select(User).where(User.username == username)
    )

    return result.scalar_one_or_none()
  
  async def get_by_email(self, email: str) -> User | None:
    result = await self.session.execute(
      select(User).where(User.email == email)
    )

    return result.scalar_one_or_none()
  
  async def create(
      self,
      *,
      display_name: str,
      username: str,
      email: str,
      password_hash: str,
  ) -> User:

    user = User(
      display_name=display_name,
      username=username,
      email=email,
      password_hash=password_hash,
    )

    self.session.add(user)

    await self.session.flush()

    return user

  async def delete(self, user: User) -> None:
    await self.session.delete(user)
