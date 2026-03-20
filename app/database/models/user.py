from config import settings
from app.database.base import *
from app.utils.enums import RoleEnum

from typing import Optional
from sqlalchemy import select, update, delete
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import BIGINT, String, Enum, ForeignKey, Boolean


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(BIGINT, autoincrement=True, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    login: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum, name='role_enum'))
    created_at: Mapped[created_at]

    @staticmethod
    async def add_user(data: dict) -> None:
        async with async_session() as session:
            session.add(User(**data))
            await session.commit()

    @staticmethod
    async def get_user(id: Optional[int] = None, login: Optional[str] = None) -> Optional['User']:
        async with async_session() as session:
            if id:
                user = await session.scalar(select(User).where(User.id == id))
            if login:
                user = await session.scalar(select(User).where(User.login == login))
            return user
