from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

from src.auth.refresh_sessions.models import RefreshSession


class RefreshSessionRepository:
  
  def __init__(self, session: AsyncSession):
    self.session = session

  async def create(
    self,
    *,
    user_id: int,
    token_hash: str,
    created_at: datetime,
    expires_at: datetime,
  ) -> RefreshSession:

    refresh_session = RefreshSession(
      user_id=user_id,
      token_hash=token_hash,
      created_at=created_at,
      expires_at=expires_at,
    )

    self.session.add(refresh_session)

    await self.session.flush()

    return refresh_session
  
  async def get_by_token_hash(self, token_hash: str) -> RefreshSession | None:
    result = await self.session.execute(
      select(RefreshSession).where(RefreshSession.token_hash == token_hash)
    )

    return result.scalar_one_or_none()
  
  async def revoke(self, refresh_session: RefreshSession) -> None:
    refresh_session.revoked_at = datetime.now(timezone.utc)

    self.session.flush()
