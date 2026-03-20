from app.utils.rabbitmq import rabbitmq_service

import asyncio


async def main():
    await rabbitmq_service.connect()
    await rabbitmq_service.worker()


if __name__ == '__main__':
    asyncio.run(main())
