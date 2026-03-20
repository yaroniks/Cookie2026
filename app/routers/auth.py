from app.utils.auth import *
import app.schemas as schemas
from app.limiter import limiter
from app.database.models import *

from fastapi import APIRouter, Request, HTTPException, status, Response

router = APIRouter(tags=['Auth'])


@router.post('/register', summary='Зарегестрироваться', response_model=schemas.Response,
             responses={409: {'model': schemas.ErrorMessage}, 429: {'model': schemas.ErrorMessage}})
@limiter.limit('10/minute')
async def user_register(request: Request, user_data: schemas.UserRegister):
    user = await User.get_user(login=user_data.login)
    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='The user already exists.')

    data: dict = user_data.dict()
    data['password'] = get_password_hash(user_data.password)
    await User.add_user(data)
    return {'success': True, 'message': 'The user is registered.'}


@router.post('/login', summary='Войти', response_model=schemas.UserToken,
             responses={401: {'model': schemas.ErrorMessage}, 429: {'model': schemas.ErrorMessage}})
@limiter.limit('10/minute')
async def user_login(request: Request, response: Response, user: schemas.UserLogin):
    user = await check_user(user.login, user.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect login or password.')

    access_token = create_access_token({'id': str(user.id)})
    response.set_cookie(key='access_token', value=access_token)
    return {'access_token': access_token}


@router.post('/logout', summary='Выйти', response_model=schemas.Response)
@limiter.limit('10/minute')
async def user_logout(request: Request, response: Response):
    response.delete_cookie(key='access_token')
    return {'success': True, 'message': 'You are logged out.'}