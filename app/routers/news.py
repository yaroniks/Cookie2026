from app.database.models import ArticleModel
import app.schemas as schemas
from app.limiter import limiter
from app.utils.ai_chat import MistralChat
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


@router.get('/main', summary='Главная новость', response_model=schemas.NewsItem,
            responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def news_main(request: Request):
    feeds = await fetch_feeds(request.app.state.session)
    select_feeds = []
    for feed in feeds:
        if not feed.get('title') or not feed.get('description') or not feed.get('image'):
            feeds.remove(feed)
        else:
            select_feeds.append({'name': feed.get('title'), 'desc': feed.get('description')})

    number = await MistralChat.get_response(f'ДАН СПИСОК НОВОСТЕЙ ТЫ ДОЛЖЕН ОТВЕТИТЬ ИНДЕКСОМ САМОЙ ИНТЕРЕСНОЙ НОВОСТИ, '
                                            f'ОДНИМ ЛИШЬ ЧИСЛОМ, НИЧЕГО ЛИШНЕГО В ОТВЕТЕ КРОМЕ ЦИФР НЕ ДОЛЖНО БЫТЬ\n'
                                            f'СПИСОК НОВОСТЕЙ: {select_feeds[:500]}')
    if number.isdigit():
        try:
            result = feeds[int(number)]
        except:
            result = feeds[0]
    else:
        result = feeds[0]
    text = f"{result.get('title', '')} {result.get('description', '')} {result.get('category', '')}"
    result["entities"] = await ner_service.extract_entities(text)
    return result


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
            "author": a.author,
            "title": a.title,
            "description": a.description,
            "link": a.link,
            "date": a.date,
            "image": a.image,
            "category": a.category,
            "entities": await ner_service.extract_entities(text)
        })

    return results
