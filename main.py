from app import limiter
from app.routers import *
from config import settings
from app.utils import rabbitmq_service
from app.database.base import async_main
from app.database.redis import redis_service
from app.utils.scheduler import start_scheduler, stop_scheduler

import aiohttp
import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run at startup
    await async_main()
    app.state.session = aiohttp.ClientSession()
    await redis_service.connect()
    await start_scheduler()
    yield
    # Run on shutdown
    await stop_scheduler()
    await app.state.session.close()
    await redis_service.close()


app = FastAPI(title=settings.TITLE, version=settings.VERSION, root_path=settings.ROOT_PATH, lifespan=lifespan)
app.add_middleware(CORSMiddleware,
                   allow_origins=["*"],
                   allow_methods=['*'],
                   allow_headers=['*'])
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.state.limiter = limiter


app.include_router(news_router)
app.include_router(chat_router)
app.include_router(graph_router)
