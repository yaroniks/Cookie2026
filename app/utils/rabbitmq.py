from config import settings

import json
import logging
import aio_pika
from typing import Optional

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


class RabbitMQService:
    QUEUE_NAME = 'test'

    def __init__(self):
        self._connection: Optional[aio_pika.RobustConnection] = None
        self._channel: Optional[aio_pika.RobustChannel] = None

    async def connect(self):
        self._connection = await aio_pika.connect_robust(
            f'amqp://{settings.RABITMQ_USERNAME}:{settings.RABITMQ_PASSWORD}@{settings.RABITMQ_HOST}:{settings.RABITMQ_PORT}/'
        )
        self._channel = await self._connection.channel()
        await self._channel.declare_queue(self.QUEUE_NAME, durable=True)
        logger.info('RabbitMQService connected.')

    async def close(self):
        if self._channel and not self._channel.is_closed:
            await self._channel.close()
        if self._connection and not self._connection.is_closed:
            await self._connection.close()
        logger.info('RabbitMQService closed.')

    async def publish(self):
        """
        Отправка сообщений в очередь

        """
        payload = {

        }
        message_body = json.dumps(payload, ensure_ascii=False).encode()
        await self._channel.default_exchange.publish(
            aio_pika.Message(message_body, delivery_mode=aio_pika.DeliveryMode.PERSISTENT),
            routing_key=self.QUEUE_NAME
        )
        logger.info(f'publish {payload}')

    async def worker(self):
        """consumer - обрабатывает все поступающие сообщения"""

        await self._channel.set_qos(prefetch_count=2)
        queue = await self._channel.get_queue(self.QUEUE_NAME)
        logger.info('Start rabbitmq worker.')

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                message: aio_pika.IncomingMessage
                async with message.process(requeue=True):
                    logger.info(f'consume {data}')
                    data = json.loads(message.body.decode())
                    ...


rabbitmq_service = RabbitMQService()
