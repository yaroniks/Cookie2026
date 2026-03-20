import app.schemas as schemas
from app.limiter import limiter
from app.database.models import *

from typing import Optional
from fastapi import APIRouter, Request, UploadFile, Form, File, Path, Query

router = APIRouter(prefix='/example', tags=['Example'])


@router.get('/{name}', summary='Пример', response_model=schemas.Response,
            responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def get_example(
        request: Request,
        name: str = Path(description='Проверка'),
        day: Optional[str] = Query(None, description='Дата (ГГГГ.ММ.ДД) на которую нужно расписание, если нет - полное', example='2026.12.31')
):
    return {'success': True, 'message': 'Success.'}


@router.post('/upload', summary='Пример загрузки файла',
             responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def upload_file(
        request: Request,
        name: str = Form(),
        file: UploadFile = File()
):
    return {"filename": name}
