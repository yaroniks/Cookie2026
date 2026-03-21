from fastapi import APIRouter, Query
from app.utils.news_handler.neo4j_service import neo4j_service

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/co-occurrences")
async def get_co_occurrences(
        min_weight: int = Query(default=1, ge=1, description="Minimum edge weight"),
        limit: int = Query(default=200, ge=1, le=1000, description="Max number of edges"),
):
    """
    Returns the CO_OCCURS_WITH graph between Person/Organization nodes.

    Example response:
    {
        "nodes": [
            {"id": "Putin",   "label": "Putin",   "type": "Person"},
            {"id": "Gazprom", "label": "Gazprom", "type": "Organization"}
        ],
        "edges": [
            {"source": "Putin", "target": "Gazprom", "weight": 7}
        ]
    }
    """
    return await neo4j_service.get_co_occurrence_graph(
        min_weight=min_weight,
        limit=limit,
    )


@router.get("/mentioned-in")
async def get_mentioned_in(
        limit: int = Query(default=300, ge=1, le=2000, description="Max number of edges"),
):
    """
    Returns the MENTIONED_IN graph between Articles and entities
    (Person / Organization / Location).

    Example response:
    {
        "nodes": [
            {"id": "art::https://...", "label": "Article title", "type": "Article"},
            {"id": "ent::Putin",       "label": "Putin",         "type": "Person"}
        ],
        "edges": [
            {"source": "art::https://...", "target": "ent::Putin", "type": "MENTIONED_IN"}
        ]
    }
    """
    return await neo4j_service.get_mentioned_in_graph(limit=limit)