import app.schemas as schemas
from app.limiter import limiter
from app.utils.parsers.currencies import parse_currencies

from fastapi import APIRouter, Request

router = APIRouter(prefix='/currencies', tags=['Currencies'])


@router.get('/', summary='Получить актуальный курс валют', response_model=...,
            responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def get_currencies(request: Request):
    return await parse_currencies(request.app.state.session)
