from app import limiter
from app.routers import *
from config import settings
from app.utils import rabbitmq_service
from app.database.base import async_main
from app.database.redis import redis_service

import aiohttp
from fastapi import FastAPI
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run at startup
    await async_main()
    app.state.session = aiohttp.ClientSession()
    await redis_service.connect()
    # await rabbitmq_service.connect()
    yield
    # Run on shutdown
    await app.state.session.close()
    await redis_service.close()
    # await rabbitmq_service.close()


app = FastAPI(title=settings.TITLE, version=settings.VERSION, root_path=settings.ROOT_PATH, lifespan=lifespan)
app.add_middleware(CORSMiddleware,
                   allow_origins=["*"],
                   allow_methods=['*'],
                   allow_headers=['*'])
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.state.limiter = limiter


app.include_router(example_router)
