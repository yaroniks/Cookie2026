import app.schemas as schemas
from app.limiter import limiter
from app.database.models import *
from app.utils.rss_parser import fetch_feeds

from fastapi import APIRouter, Request, HTTPException, status, Response

router = APIRouter(prefix='/news', tags=['News'])


@router.get('/', summary='Новости на главную страницу', response_model=list[schemas.NewsItem],
            responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def get_news(request: Request):
    return await fetch_feeds(request.app.state.session)


@router.post('/search/{name}', summary='Новости по запросу', #response_model=...,
             responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def search_news(request: Request, name: str):
    ...
