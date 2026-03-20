import app.schemas as schemas
from app.limiter import limiter
from app.database.models import *
from app.utils.ai_chat import MistralChat

from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Request, HTTPException, status, Response

router = APIRouter(prefix='/chat', tags=['AI Chat'])


@router.post('/send_message', summary='Отправить сообщение, ', response_class=StreamingResponse,
             responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('60/minute')
async def send_message(request: Request, data: schemas.SendMessage):
    return StreamingResponse(
        MistralChat.get_response_stream(data.token, data.text),
        media_type='text/event-stream',
        headers={"X-Accel-Buffering": "no"}
    )
