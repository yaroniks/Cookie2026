from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import aiohttp
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def fetch_and_process_job():
    """Запускается каждые 15 минут. Обычный async — никаких оберток."""
    logger.info("scheduler: запуск пайплайна")
    try:
        from app.utils.news_handler.rss_parser import fetch_feeds_raw
        from app.utils.news_handler.news_processor import process_and_save

        async with aiohttp.ClientSession() as session:
            articles = await fetch_feeds_raw(session)

        if not articles:
            logger.info("scheduler: нет новых статей")
            return

        stats = await process_and_save(articles)
        logger.info(f"scheduler: готово — {stats}")

    except Exception as e:
        logger.error(f"scheduler: ошибка — {e}", exc_info=True)


async def start_scheduler():
    scheduler.add_job(
        fetch_and_process_job,
        trigger=IntervalTrigger(minutes=15),
        id="fetch_and_process",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.start()
    logger.info("scheduler: запущен")


async def stop_scheduler():
    scheduler.shutdown()
    logger.info("scheduler: остановлен")