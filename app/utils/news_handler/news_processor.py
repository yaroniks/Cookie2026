from app.database.models import ArticleModel
from app.utils.news_handler.ner_service import ner_service
from app.utils.news_handler.neo4j_service import neo4j_service
from app.utils.news_handler.embedding_service import embedding_service
from app.utils.news_handler.clustering_service import clustering_service

import logging

logger = logging.getLogger(__name__)


async def get_articles_semantic(query: str, top_k: int = 20) -> list[ArticleModel]:
    query_vec = await embedding_service.encode(query)
    return await ArticleModel.get_articles_for_rag(query_vec, top_k=top_k)


async def process_and_save(raw_articles: list[dict]) -> dict:
    """
    Полный pipeline: сырые статьи из rss_parser → PostgreSQL + Neo4j.

    Шаги:
      1. Кластеризация (embedding + HDBSCAN)
      2. NER — извлечение сущностей для каждой статьи
      3. Сохранение в PostgreSQL (статьи + эмбеддинги)
      4. Сохранение в Neo4j (граф сущностей)

    Возвращает статистику выполнения.
    """
    if not raw_articles:
        return {"total": 0, "inserted_pg": 0, "neo4j": "skipped"}

    logger.info(f"process_and_save: получено {len(raw_articles)} статей")
    raw_articles = raw_articles[:300]
    # Шаг 1: кластеризация — добавляет cluster_id и embedding в каждую статью
    clustered = clustering_service.cluster_articles(raw_articles)
    logger.info("process_and_save: кластеризация завершена")

    # Шаг 2: NER — добавляем поле entities к каждой статье
    for article in clustered:
        text = f"{article.get('title', '')} {article.get('description', '')} {article.get('category', '')}".replace('None', '')
        if text.replace(' ', ''):
            article["entities"] = await ner_service.extract_entities(text)
        else:
            article["entities"] = []

    logger.info("process_and_save: NER завершён")

    # Шаг 3: PostgreSQL
    inserted = await ArticleModel.save_to_db(clustered)

    # Шаг 4: Neo4j — только статьи с хотя бы одной сущностью
    articles_with_entities = [a for a in clustered if a.get("entities")]
    await neo4j_service.save_to_neo4j(articles_with_entities)

    stats = {
        "total": len(raw_articles),
        "inserted_pg": inserted,
        "neo4j": len(articles_with_entities),
        "noise": sum(1 for a in clustered if a.get("cluster_id") == -1),
        "clusters": len({a["cluster_id"] for a in clustered if a.get("cluster_id") != -1}),
    }
    logger.info(f"process_and_save: готово — {stats}")
    return stats