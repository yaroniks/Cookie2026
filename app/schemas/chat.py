from typing import Optional
from pydantic import BaseModel, Field


class SendMessage(BaseModel):
    text: str
    token: str
