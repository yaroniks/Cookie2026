import config
from jose import jwt
from config import settings
from app.database.models import *
from typing import Optional, Annotated
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from fastapi import Request, HTTPException, status, Depends, Header

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Хэш пароля"""
    return pwd_context.hash(password)


def check_password(plain_password: str, hashed_password: str) -> bool:
    """Проверить пароль"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Создать токен доступа"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode.update({'exp': expire})
    auth_data = config.get_auth_data()
    encode_jwt = jwt.encode(to_encode, auth_data['secret_key'], algorithm=auth_data['algorithm'])
    return encode_jwt


async def check_user(login: str, password: str) -> Optional[User]:
    """Проверить почту и пароль"""
    user = await User.get_user(login=login)
    if user and check_password(password, user.password):
        return user


async def check_token(access_token: Annotated[str, Header()]) -> Optional[User]:
    """Проверить токен"""
    try:
        auth_data = config.get_auth_data()
        data = jwt.decode(access_token, auth_data['secret_key'], algorithms=[auth_data['algorithm']])
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token.')

    user_id = data.get('id')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token.')

    user = await User.get_user(id=int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token.')

    return user


async def optional_check_token(access_token: Annotated[str, Header()] = None) -> Optional[User]:
    """Проверить токен"""
    if access_token is None:
        return None

    try:
        auth_data = config.get_auth_data()
        data = jwt.decode(access_token, auth_data['secret_key'], algorithms=[auth_data['algorithm']])
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token.')

    user_id = data.get('id')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token.')

    user = await User.get_user(id=int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token.')

    return user
