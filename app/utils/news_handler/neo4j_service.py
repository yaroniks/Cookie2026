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

            raw_name = entity.get("text")
            name = raw_name.strip() if isinstance(raw_name, str) else ""
            if not node_type or not name:  # отсекает None, "", "  "
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

    async def get_co_occurrence_graph(
            self,
            min_weight: int = 1,
            limit: int = 200,
    ) -> dict:
        """
        Возвращает граф совместных упоминаний в формате, удобном для фронтенда
        (например, для vis.js / D3 / Cytoscape).

        Параметры:
            min_weight  — минимальный вес ребра (фильтрует редкие связи)
            limit       — максимальное количество рёбер

        Возвращает:
        {
            "nodes": [
                {"id": "Путин",    "label": "Путин",    "type": "Person"},
                {"id": "Газпром",  "label": "Газпром",  "type": "Organization"},
                ...
            ],
            "edges": [
                {"source": "Путин", "target": "Газпром", "weight": 5},
                ...
            ]
        }
        """
        query = """
            MATCH (a)-[r:CO_OCCURS_WITH]-(b)
            WHERE
                (a:Person OR a:Organization)
                AND (b:Person OR b:Organization)
                AND a.name IS NOT NULL
                AND b.name IS NOT NULL
                AND r.weight >= $min_weight
                // избегаем дублей (a->b и b->a) через лексикографический порядок
                AND a.name < b.name
            RETURN
                a.name        AS source,
                labels(a)[0]  AS source_type,
                b.name        AS target,
                labels(b)[0]  AS target_type,
                r.weight      AS weight
            ORDER BY r.weight DESC
            LIMIT $limit
        """

        async with self._driver.session() as session:
            result = await session.run(query, min_weight=min_weight, limit=limit)
            records = await result.data()

        # Собираем уникальные узлы
        nodes_map: dict[str, dict] = {}
        edges: list[dict] = []

        for row in records:
            src, tgt = row['source'], row['target']

            if src not in nodes_map:
                nodes_map[src] = {'id': src.replace('None', ''), 'label': src.replace('None', ''), 'type': row['source_type']}
            if tgt not in nodes_map:
                nodes_map[tgt] = {'id': tgt.replace('None', ''), 'label': tgt.replace('None', ''), 'type': row['target_type']}

            edges.append({'source': src.replace('None', ''), 'target': tgt.replace('None', ''), 'weight': row['weight']})

        return {'nodes': list(nodes_map.values()), 'edges': edges}

    async def get_mentioned_in_graph(self, limit: int = 300) -> dict:
        """
        Returns the MENTIONED_IN graph between Article nodes and entities
        (Person / Organization / Location).

        Response format:
        {
            "nodes": [
                {"id": "art::https://...", "label": "Article title", "type": "Article"},
                {"id": "ent::Putin",       "label": "Putin",         "type": "Person"},
            ],
            "edges": [
                {"source": "art::https://...", "target": "ent::Putin", "type": "MENTIONED_IN"}
            ]
        }
        """
        query = """
            MATCH (a:Article)-[:MENTIONED_IN]->(e)
            WHERE (e:Person OR e:Organization OR e:Location)
              AND e.name IS NOT NULL
              AND trim(e.name) <> ''
              AND toLower(e.name) <> 'none'
            RETURN
                a.link        AS article_link,
                a.title       AS article_title,
                e.name        AS entity_name,
                labels(e)[0]  AS entity_type
            LIMIT $limit
        """
        async with self._driver.session() as session:
            result = await session.run(query, limit=limit)
            records = await result.data()

        nodes_map: dict[str, dict] = {}
        edges: list[dict] = []

        for row in records:
            art_id = f"art::{row['article_link']}"
            ent_id = f"ent::{row['entity_name']}"

            if art_id not in nodes_map:
                nodes_map[art_id] = {
                    'id': art_id,
                    'label': row['article_title'] or row['article_link'],
                    'type': 'Article',
                }
            if ent_id not in nodes_map:
                nodes_map[ent_id] = {
                    'id': ent_id,
                    'label': row['entity_name'],
                    'type': row['entity_type'],
                }

            edges.append({
                'source': art_id,
                'target': ent_id,
                'type': 'MENTIONED_IN',
            })

        return {'nodes': list(nodes_map.values()), 'edges': edges}


neo4j_service = Neo4jService()
