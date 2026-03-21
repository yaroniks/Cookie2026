from app.database.base import *
from app.utils.enums import SourceEnum

import logging
import datetime
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Column, Integer, String, Text, DateTime, BIGINT, Enum, select

logger = logging.getLogger(__name__)


class ArticleModel(Base):
    __tablename__ = 'articles'

    id: Mapped[int] = mapped_column(BIGINT, autoincrement=True, primary_key=True)

    source: Mapped[SourceEnum] = mapped_column(Enum(SourceEnum, name='source_enum'))
    author: Mapped[str] = mapped_column(String, nullable=True)
    title: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    link: Mapped[str] = mapped_column(String, nullable=True)
    date: Mapped[str] = mapped_column(String, nullable=True)
    image: Mapped[str] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=True)

    cluster_id = Column(Integer, index=True)  # Результат clustering_service

    embedding = Column(Vector(384))  # Размерность 384 для MiniLM-L12-v2

    @staticmethod
    async def get_articles_for_rag(query_vec: list[float], top_k: int = 20) -> list['ArticleModel']:
        """
        Similarity search через pgvector.
        Возвращает top_k статей, наиболее близких к query_vec по косинусному расстоянию.
        """
        async with async_session() as session:
            result = await session.execute(
                select(ArticleModel)
                .where(ArticleModel.embedding.isnot(None))
                .order_by(ArticleModel.embedding.cosine_distance(query_vec))
                .limit(top_k)
            )
            return result.scalars().all()

    @staticmethod
    async def save_to_db(articles: list[dict]) -> list['ArticleModel']:
        """
        Сохраняет статьи в PostgreSQL, пропуская дубликаты по полю link.

        Принимает список словарей из clustering_service (уже содержат cluster_id и embedding).
        Возвращает список сохранённых объектов ArticleModel.

        Пример входного словаря:
        {
            'source': 'ria',
            'author': 'Иван Иванов',
            'title': 'Заголовок новости',
            'description': 'Описание...',
            'link': 'https://...',
            'date': '2024-01-01T12:00:00',
            'image': 'https://...',
            'category': 'Политика',
            'cluster_id': 3,
            'embedding': [0.12, -0.34, ...]
        }
        """
        if not articles:
            return []

        saved = []

        async with async_session() as session:
            async with session.begin():
                # Собираем все ссылки из входного батча
                links = [a.get('link') for a in articles if a.get('link')]

                # Одним запросом находим уже существующие ссылки
                existing_links: set[str] = set()
                if links:
                    result = await session.execute(
                        select(ArticleModel.link).where(ArticleModel.link.in_(links))
                    )
                    existing_links = {row[0] for row in result.fetchall()}

                for article in articles:
                    link = article.get('link')

                    # Пропускаем дубликаты
                    if link and link in existing_links:
                        logger.debug(f'save_to_db: пропуск дубликата {link}')
                        continue

                    try:
                        db_article = ArticleModel(
                            source=article.get('source'),
                            author=article.get('author'),
                            title=article.get('title'),
                            description=article.get('description'),
                            link=link,
                            date=article.get('date'),
                            image=article.get('image'),
                            category=article.get('category'),
                            cluster_id=article.get('cluster_id'),
                            embedding=article.get('embedding'),
                        )
                        session.add(db_article)
                        saved.append(db_article)

                    except Exception as err:
                        logger.error(f'save_to_db: ошибка при создании записи {link}: {err}')
                        continue

            logger.info(f'save_to_db: сохранено {len(saved)} статей, пропущено {len(articles) - len(saved)} дубликатов')

        return saved
