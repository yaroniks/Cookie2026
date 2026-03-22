from app.database.redis import redis_service
from app.utils.ai_chat import MistralChat
from app.utils.parsers.rss import fetch_feeds
from app.utils.news_handler.ner_service import ner_service


@redis_service.cache(key='main_new', expire=3600)
async def get_main_new(session):
    feeds = await fetch_feeds(session)
    valid_feeds = []
    select_feeds = []
    for feed in feeds:
        if feed.get('title') and feed.get('description') and feed.get('image'):
            valid_feeds.append(feed)
            select_feeds.append({'name': feed.get('title'), 'desc': feed.get('description')})

    number = await MistralChat.get_response(
        f'ДАН СПИСОК НОВОСТЕЙ ТЫ ДОЛЖЕН ОТВЕТИТЬ ИНДЕКСОМ САМОЙ ИНТЕРЕСНОЙ НОВОСТИ, '
        f'ОДНИМ ЛИШЬ ЧИСЛОМ (ИНДЕКСОМ, НАЧИНАЕТСЯ С 0), НИЧЕГО ЛИШНЕГО В ОТВЕТЕ '
        f'КРОМЕ ЦИФР НЕ ДОЛЖНО БЫТЬ\nСПИСОК НОВОСТЕЙ: {select_feeds[:300]}')
    if number.isdigit():
        try:
            result = valid_feeds[int(number)]
        except:
            result = valid_feeds[0]
    else:
        result = valid_feeds[0]
    text = f"{result.get('title', '')} {result.get('description', '')} {result.get('category', '')}".replace('None', '')
    if text.replace(' ', ''):
        result["entities"] = await ner_service.extract_entities(text)
    else:
        result["entities"] = []
    return result
