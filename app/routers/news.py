from app.database.models import ArticleModel
import app.schemas as schemas
from app.limiter import limiter
from app.utils.news_handler.ner_service import ner_service
from app.utils.news_handler.news_processor import get_articles_semantic, process_and_save
from app.utils.news_handler.rss_parser import fetch_feeds

from fastapi import APIRouter, Request

router = APIRouter(prefix='/news', tags=['News'])


@router.get('/', summary='Новости на главную страницу', response_model=list[schemas.NewsItem],
            responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def get_news(request: Request):
    feeds = await fetch_feeds(request.app.state.session)
    for feed in feeds[:300]:
        text = f"{feed.get('title', '')} {feed.get('description', '')} {feed.get('category', '')}"
        feed["entities"] = await ner_service.extract_entities(text)
    return feeds[:300]


@router.post('/search/{name}', summary='Новости по запросу', response_model=list[schemas.NewsItem],
             responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def search_news(request: Request, name: str):
    # rss_feeds = await fetch_feeds(request.app.state.session)
    # await process_and_save(rss_feeds)

    results = []
    articles = await get_articles_semantic(query=name)
    for a in articles:
        text = f"{a.title} {a.description} {a.category}"
        results.append({
            "source": a.source,
            "title": a.title,
            "description": a.description,
            "link": a.link,
            "date": a.date,
            "image": a.image,
            "category": a.category,
            "entities": await ner_service.extract_entities(text)
        })

    return results
