from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import hash_password

from src.users.models import User
from src.users.repository import UserRepository
from src.users.schemas import UserCreate

from src.core.exceptions import UserNotFoundError


class UserService:

  def __init__(self, session: AsyncSession):
    self.session = session
    self.repository = UserRepository(session)

  async def create_user(
    self,
    data: UserCreate,
  ) -> User:
    
    password_hash = hash_password(data.password)

    user = await self.repository.create(
      display_name=data.display_name,
      username=data.username,
      email=data.email,
      password_hash=password_hash,
    )

    await self.session.commit()

    await self.session.refresh(user)

    return user
  
  async def get_user(
    self,
    user_id: int,
  ) -> User | None:
    
    return await self.repository.get_by_id(user_id)
  
  async def get_user_or_raise(
    self,
    user_id: int,
  ) -> User:
    
    user = await self.repository.get_by_id(user_id)

    if user is None:
      raise UserNotFoundError()
    
    return user

  async def delete_user(
    self,
    user_id: int,
  ) -> None:
    
    user = await self.get_user_or_raise(user_id)

    await self.repository.delete(user)

    await self.session.commit()
