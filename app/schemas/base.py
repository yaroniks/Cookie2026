from typing import Optional
from pydantic import BaseModel, Field


class Response(BaseModel):
    success: bool = Field(description='Удалось ли произвести действие')
    message: str = Field(description='Подробное сообщение о действии')


class ErrorMessage(BaseModel):
    detail: str = Field(description='Детали ошибки')
