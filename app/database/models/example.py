from config import settings
from app.database.base import *

from sqlalchemy import select, update, delete
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import BIGINT, String, Enum, ForeignKey, Boolean


class Test(Base):
    __tablename__ = 'tests'

    id: Mapped[int] = mapped_column(BIGINT, autoincrement=True, primary_key=True)

    @staticmethod
    async def add_test(test_id: int) -> None:
        async with async_session() as session:
            stmt = (
                select(Test)
                .where(Test.id == test_id)
            )
            test = await session.scalar(stmt)
            if not test:
                session.add(test(id=test_id))
                await session.commit()
