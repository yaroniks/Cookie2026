import app.schemas as schemas
from app.limiter import limiter
from app.utils.ai_chat import MistralChat

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

router = APIRouter(prefix='/chat', tags=['AI Chat'])


@router.post('/send_message', summary='Отправить сообщение ИИ, stream', response_class=StreamingResponse,
             responses={429: {'model': schemas.ErrorMessage}})
@limiter.limit('10/minute')
async def send_message(request: Request, data: schemas.SendMessage):
    return StreamingResponse(
        MistralChat.get_response_stream(data.token, data.text),
        media_type='text/event-stream',
        headers={"X-Accel-Buffering": "no"}
    )
