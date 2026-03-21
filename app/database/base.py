from config import settings

from sqlalchemy import text
from typing import Annotated
from datetime import datetime
from sqlalchemy import func, DateTime
from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine

engine = create_async_engine(
    url=f'postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/Database'
)
async_session = async_sessionmaker(engine)

created_at = Annotated[datetime, mapped_column(DateTime(timezone=True), server_default=func.now())]


class Base(AsyncAttrs, DeclarativeBase):
    # __abstract__ = True
    ...


async def async_main():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
