from pydantic import BaseModel, Field


class GetCurrencies(BaseModel):
    char_code: str = Field(description='Код валюты')
    nominal: int = Field(description='Количество валюты')
    name: str = Field(description='Название валюты')
    value: float = Field(description='Стоимость в рублях за nominal валюты')
    unit_rate: float = Field(description='Стоимость в рублях за 1 валюты')
