from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    TITLE: str
    VERSION: str
    ROOT_PATH: str

    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    RABITMQ_HOST: str
    RABITMQ_PORT: int
    RABITMQ_USERNAME: str
    RABITMQ_PASSWORD: str

    MONGODB_HOST: str
    MONGODB_PORT: int
    MONGODB_USER: str
    MONGODB_PASSWORD: str

    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str

    MISTRAL_API: str


settings = Settings()

RSS_FEEDS = {
    "ria": "https://ria.ru/export/rss2/archive/index.xml",
    "lenta": "https://lenta.ru/rss/news",
    "tass": "https://tass.ru/rss/v2.xml",
    "kommersant": "https://www.kommersant.ru/RSS/news.xml",
    "vedomosti": "https://www.vedomosti.ru/rss/news",
    "habr": "https://habr.com/ru/rss/news/",
    "cnews": "https://www.cnews.ru/inc/rss/news.xml",
}
