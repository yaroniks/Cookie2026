from config import settings

import logging
from neo4j import AsyncGraphDatabase

logger = logging.getLogger(__name__)


class Neo4jService:
    def __init__(self):
        self._driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )

    async def close_driver(self):
        await self._driver.close()

    async def save_to_neo4j(self, articles: list[dict]) -> None:
        """
        Сохраняет сущности и связи из статей в Neo4j.

        Для каждой статьи создаёт узел Article, затем узлы сущностей
        (Person / Organization / Location) и рёбра MENTIONED_IN.
        Если узел уже существует — обновляет его (MERGE).

        Ожидаемая структура article:
        {
            'link': 'https://...',
            'title': '...',
            'date': '2024-01-01T12:00:00',
            'cluster_id': 3,
            'source': 'ria',
            'entities': [
                {'text': 'Владимир Путин', 'label': 'PER'},
                {'text': 'Газпром',        'label': 'ORG'},
                {'text': 'Москва',         'label': 'LOC'},
            ]
        }

        Схема графа:
            (:Article)      -[:MENTIONED_IN]->   (:Person | :Organization | :Location)
            (:Person)       -[:CO_OCCURS_WITH]-> (:Person | :Organization)
        """
        if not articles:
            return

        async with self._driver.session() as session:
            for article in articles:
                link = article.get('link')
                entities = article.get('entities') or []

                if not link:
                    continue

                try:
                    await self._upsert_article(session, article)
                    await self._upsert_entities(session, link, entities)
                    await self._upsert_co_occurrences(session, link, entities)
                except Exception as err:
                    logger.error(f'save_to_neo4j: ошибка для статьи {link}: {err}')
                    continue

        logger.info(f'save_to_neo4j: обработано {len(articles)} статей')


    # ─────────────────────────────────────────────────────────────
    # Вспомогательные функции
    # ─────────────────────────────────────────────────────────────

    async def _upsert_article(self, session, article: dict) -> None:
        """Создаёт или обновляет узел Article."""
        await session.run(
            """
            MERGE (a:Article {link: $link})
            SET a.title      = $title,
                a.date       = $date,
                a.cluster_id = $cluster_id,
                a.source     = $source
            """,
            link=article.get('link'),
            title=article.get('title') or '',
            date=article.get('date') or '',
            cluster_id=article.get('cluster_id', -1),
            source=str(article.get('source') or ''),
        )


    # Маппинг меток spaCy -> типы узлов Neo4j
    _LABEL_TO_NODE: dict[str, str] = {
        'PER':    'Person',
        'PERSON': 'Person',
        'ORG':    'Organization',
        'LOC':    'Location',
        'GPE':    'Location',
    }


    async def _upsert_entities(self, session, article_link: str, entities: list[dict]) -> None:
        """
        Создаёт узлы сущностей и рёбра MENTIONED_IN к статье.
        (:Article) -[:MENTIONED_IN]-> (:Person | :Organization | :Location)
        """
        for entity in entities:
            node_type = self._LABEL_TO_NODE.get(entity.get('label', ''))
            name = entity.get('text', '').strip()

            if not node_type or not name:
                continue

            # node_type берётся из фиксированного словаря — инъекция исключена
            await session.run(
                f"""
                MERGE (e:{node_type} {{name: $name}})
                WITH e
                MATCH (a:Article {{link: $link}})
                MERGE (a)-[:MENTIONED_IN]->(e)
                """,
                name=name,
                link=article_link,
            )


    async def _upsert_co_occurrences(self, session, article_link: str, entities: list[dict]) -> None:
        """
        Создаёт рёбра CO_OCCURS_WITH между всеми парами Person/Organization в статье.
        Если ребро уже есть — увеличивает счётчик weight.
        (:Entity) -[:CO_OCCURS_WITH {weight: N}]- (:Entity)
        """
        meaningful = [
            e for e in entities
            if self._LABEL_TO_NODE.get(e.get('label', '')) in ('Person', 'Organization')
        ]

        for i in range(len(meaningful)):
            for j in range(i + 1, len(meaningful)):
                e1 = meaningful[i]
                e2 = meaningful[j]
                type1 = self._LABEL_TO_NODE[e1['label']]
                type2 = self._LABEL_TO_NODE[e2['label']]
                name1 = e1['text'].strip()
                name2 = e2['text'].strip()

                if name1 == name2:
                    continue

                await session.run(
                    f"""
                    MATCH (a:{type1} {{name: $name1}})
                    MATCH (b:{type2} {{name: $name2}})
                    MERGE (a)-[r:CO_OCCURS_WITH]-(b)
                    ON CREATE SET r.weight = 1
                    ON MATCH  SET r.weight = r.weight + 1
                    """,
                    name1=name1,
                    name2=name2,
                )


neo4j_service = Neo4jService()
