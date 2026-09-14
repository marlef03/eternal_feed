from datetime import datetime

from sqlalchemy import select, or_, and_, true
from sqlalchemy.orm import contains_eager, aliased, joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.posts.models import Post

from src.comments.models import Comment

from src.core.config import settings


class PostRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, post_id: int) -> Post | None:
        result = await self.session.execute(select(Post).where(Post.id == post_id))

        return result.scalar_one_or_none()
    
    async def get_by_id_with_author(self, post_id: int) -> Post | None:
        result = await self.session.execute(
            select(Post)
            .where(Post.id == post_id)
            .options(
                joinedload(Post.author)
            )
        )

        return result.scalar_one_or_none()

    async def get_before(
        self,
        timestamp: datetime,
        id: int,
    ) -> list[Post] | None:
        
        result = await self.session.execute(
            select(Post)
            .where(
                or_(
                    Post.created_at < timestamp,
                    and_(Post.created_at == timestamp, Post.id < id),
                )
            )
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_per_update)
        )

        return result.scalars().all()
    
    async def get_before_with_author(
        self,
        timestamp: datetime,
        id: int,
    ) -> list[Post] | None:
        
        result = await self.session.execute(
            select(Post)
            .where(
                or_(
                    Post.created_at < timestamp,
                    and_(Post.created_at == timestamp, Post.id < id),
                )
            )
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_per_update)
            .options(
                joinedload(Post.author),
            )
        )

        return result.scalars().all()
    
    async def get_before_with_comments(
        self,
        timestamp: datetime,
        id: int,
    ) -> list[Post] | None:
        
        post_subquery = (
            select(Post)
            .where(
                or_(
                    Post.created_at < timestamp,
                    and_(Post.created_at == timestamp, Post.id < id),
                )
            )
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_per_update)
            .subquery()
        )

        post_alias = aliased(Post, post_subquery)

        comment_lateral = (
            select(Comment)
            .where(Comment.post_id == post_alias.id)
            .order_by(Comment.created_at.desc(), Comment.id.desc())
            .limit(settings.comments_preloaded + 1)
            .lateral()
        )
        
        comment_alias = aliased(Comment, comment_lateral)

        result = await self.session.execute(
            select(post_alias)
            .outerjoin(comment_lateral, true())
            .options(
                contains_eager(post_alias.comments.of_type(comment_alias))
                .selectinload(comment_alias.author),
                selectinload(post_alias.author),
            )
            .order_by(post_alias.created_at.desc(), post_alias.id.desc())
        )

        return result.scalars().unique().all()

    async def get_latest(self) -> list[Post] | None:
        result = await self.session.execute(
            select(Post)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_preload)
        )

        return result.scalars().all()
    
    async def get_latest_with_author(self) -> list[Post] | None:
        result = await self.session.execute(
            select(Post)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_preload)
            .options(
                joinedload(Post.author)
            )
        )

        return result.scalars().all()
    
    async def get_latest_with_comments(self) -> list[Post] | None:
        post_subquery = (
            select(Post)
            .order_by(Post.created_at.desc(), Post.id.desc())
            .limit(settings.posts_preload)
            .subquery()
        )

        post_alias = aliased(Post, post_subquery)

        comment_lateral = (
            select(Comment)
            .where(Comment.post_id == post_alias.id)
            .order_by(Comment.created_at.desc(), Comment.id.desc())
            .limit(settings.comments_preloaded + 1)
            .lateral()
        )
        
        comment_alias = aliased(Comment, comment_lateral)

        result = await self.session.execute(
            select(post_alias)
            .outerjoin(comment_lateral, true())
            .options(
                contains_eager(post_alias.comments.of_type(comment_alias))
                .selectinload(comment_alias.author),
                selectinload(post_alias.author),
            )
            .order_by(post_alias.created_at.desc(), post_alias.id.desc())
        )

        return result.scalars().unique().all()

    async def create(
        self,
        *,
        title: str,
        content: str,
        author_id: int,
    ) -> Post:

        post = Post(
            title=title,
            content=content,
            author_id=author_id,
        )

        self.session.add(post)

        await self.session.flush()

        return post

    async def delete(self, post: Post) -> None:
        await self.session.delete(post)
