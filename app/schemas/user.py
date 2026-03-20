from app.utils.enums import RoleEnum

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class User(BaseModel):
    id: int = Field(description='ID пользователя')
    name: str = Field(min_length=3, max_length=32, description='Имя')
    login: str = Field(description='Номер телефона/Email')
    role: RoleEnum = Field(description='Роль пользователя')
    created_at: datetime = Field(description='Дата регистрации пользователя')


class UserRegister(BaseModel):
    login: str = Field(description='Номер телефона/Email')
    password: str = Field(min_length=6, max_length=32, description='Пароль')
    name: str = Field(min_length=3, max_length=32, description='Имя')
    role: RoleEnum = Field(description='Роль пользователя')


class UserLogin(BaseModel):
    login: str = Field(description='Номер телефона/Email')
    password: str = Field(min_length=6, max_length=32, description='Пароль')


class UserToken(BaseModel):
    access_token: str = Field(description='Токен доступа')
