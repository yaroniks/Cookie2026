import config
from app.database.redis import redis_service

import logging
import aiohttp
import feedparser
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)


def extract_image(entry) -> Optional[str]:
    if entry.get("enclosures"):
        for enc in entry.enclosures:
            if enc.get("type", "").startswith("image/"):
                return enc.get("url")
    if entry.get("links"):
        for link in entry.links:
            if link.get("type", "").startswith("image/"):
                return link.get("href")
    if entry.get("media_content"):
        return entry.media_content[0].get("url")
    return None


def extract_date(entry) -> str | None:
    try:
        if entry.get("published_parsed"):
            return datetime(*entry.published_parsed[:6]).isoformat()
        if entry.get("updated_parsed"):
            return datetime(*entry.updated_parsed[:6]).isoformat()
        if entry.get("published"):
            return str(entry.get("published"))
        if entry.get("updated"):
            return str(entry.get("updated"))
    except Exception as err:
        logger.error(f"extract_date: {err}")
        return None


def extract_description(entry) -> str | None:
    return (
        entry.get("summary") or
        entry.get("description") or
        entry.get("content", [{}])[0].get("value")
    )


async def _fetch_all(session: aiohttp.ClientSession) -> list[dict]:
    """Общая логика парсинга — без кеша."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }
    results = []

    for name, url in config.RSS_FEEDS.items():
        try:
            async with session.get(url, headers=headers) as response:
                data = await response.text()
                feed = feedparser.parse(data)

                for entry in feed.entries:
                    results.append({
                        'source': name,
                        'author': entry.get('author'),
                        'title': (entry.get('title') or '').strip(),
                        'description': extract_description(entry),
                        'link': entry.get('link'),
                        'date': extract_date(entry),
                        'image': extract_image(entry),
                        'category': entry.get('category')
                    })

        except Exception as err:
            logger.error(f"fetch_feeds: ошибка для {name}: {err}")

    return results


@redis_service.cache(key="rss_feeds", expire=1800)
async def fetch_feeds(session: aiohttp.ClientSession) -> list[dict]:
    """
    Для FastAPI роутеров (/news/).
    Результат кешируется в Redis на 500 секунд.
    """
    return await _fetch_all(session)


async def fetch_feeds_raw(session: aiohttp.ClientSession) -> list[dict]:
    """
    Для Celery задач.
    Всегда делает живой HTTP-запрос, без кеша.
    """
    return await _fetch_all(session)
