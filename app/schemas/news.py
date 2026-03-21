from app.utils.enums import SourceEnum
from app.utils.enums import EntityEnum

from typing import Optional
from pydantic import BaseModel, Field


class Entity(BaseModel):
    text: str
    label: EntityEnum


class NewsItem(BaseModel):
    source: SourceEnum = Field(description='Откуда эта новость')

    author: Optional[str] = Field(description='Автор')
    title: Optional[str] = Field(description='Заголовок')
    description: Optional[str] = Field(description='Описание новости')
    link: Optional[str] = Field(description='Ссылка на эту новость')
    date: Optional[str] = Field(description='Дата публикации')
    image: Optional[str] = Field(description='Ссылка на картинку')
    category: Optional[str] = Field(description='Категория новости')
    entities: list[Entity] = Field(description='Список сущностей')
