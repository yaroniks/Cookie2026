from app.database.models import ArticleModel
import app.schemas as schemas
from app.limiter import limiter
from app.utils.news_handler.news_processor import get_articles_semantic, process_and_save
from app.utils.news_handler.rss_parser import fetch_feeds

from fastapi import APIRouter, Request

router = APIRouter(prefix='/news', tags=['News'])


@router.get('/', summary='Новости на главную страницу', response_model=list[schemas.NewsItem],
            responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def get_news(request: Request):
    return await fetch_feeds(request.app.state.session)


@router.post('/search/{name}', summary='Новости по запросу',# response_model=,
             responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def search_news(request: Request, name: str):
    # rss_feeds = await fetch_feeds(request.app.state.session)
    # await process_and_save(rss_feeds)

    articles = await get_articles_semantic(query=name)

    return [
        {
            "id": a.id,
            "source": a.source,
            "title": a.title,
            "description": a.description,
            "link": a.link,
            "date": a.date,
            "image": a.image,
            "category": a.category,
            "cluster_id": a.cluster_id,
        }
        for a in articles
    ]
