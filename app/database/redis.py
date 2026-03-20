from config import settings

import json
from functools import wraps
from typing import Optional, Any
import redis.asyncio as aioredis


class RedisService:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None

    async def connect(self):
        self.redis = aioredis.from_url(
            f'redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}',
            password=settings.REDIS_PASSWORD, decode_responses=True
        )

    async def close(self):
        if self.redis:
            await self.redis.aclose()

    async def get(self, key: str) -> Optional[Any]:
        """
        Получить значение из кеша

        key: str - ключ
        """
        if not self.redis:
            return None
        value = await self.redis.get(key)
        if value:
            return json.loads(value)

    async def set(self, key: str, value: Any, expire: Optional[int] = None):
        """
        Установить значение в кеше

        key: str - ключ
        value: Any - значение
        expire: Optional[int] - время жизни кеша
        """
        if not self.redis:
            return
        if expire:
            await self.redis.setex(key, expire, json.dumps(value))
        else:
            await self.redis.set(key, json.dumps(value))

    def cache(self, key: str, expire: Optional[int] = None):
        """
        Декоратор для кеширования результата асинхронных функций.

        key: str - ключ
        expire: Optional[int] - время жизни кеша
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                if not self.redis:
                    return await func(*args, **kwargs)

                value = await self.get(key)
                if value:
                    return value

                result = await func(*args, **kwargs)
                await self.set(key, result, expire)
                return result
            return wrapper
        return decorator


redis_service = RedisService()
