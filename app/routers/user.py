from app.utils.auth import *
import app.schemas as schemas
from app.limiter import limiter
from app.database.models import *

from fastapi import APIRouter, Request, HTTPException, status, Response

router = APIRouter(prefix='/user', tags=['User'])


@router.get('/', summary='Информация о пользователе', response_model=schemas.User,
            responses={401: {'model': schemas.ErrorMessage}, 429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def get_user(request: Request, user_data: schemas.User = Depends(check_token)):
    user = await User.get_user(user_data.id)
    return user
