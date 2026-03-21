from typing import Optional
from pydantic import BaseModel, Field


class SendMessage(BaseModel):
    text: str = Field(description='Сообщение пользователя')
    token: str = Field(description='Токен')
