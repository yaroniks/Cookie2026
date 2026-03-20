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

    SECRET_KEY: str
    ALGORITHM: str


settings = Settings()


def get_auth_data():
    return {'secret_key': settings.SECRET_KEY, 'algorithm': settings.ALGORITHM}
