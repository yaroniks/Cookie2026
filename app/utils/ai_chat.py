from config import settings
from mistralai.client import Mistral


class MistralChat:
    chats = {}

    @staticmethod
    async def get_response_stream(token: str, text: str):
        if MistralChat.chats.get(token):
            MistralChat.chats[token].append({"role": "user", "content": text})
            messages = MistralChat.chats[token]
        else:
            messages = [
                {"role": "system", "content": 'Ты - помощник в новостях, не отвечай пользователю на вопросы не '
                                              'связанные с новостями.'},
                {"role": "user", "content": text}
            ]
            MistralChat.chats[token] = []

        async with Mistral(api_key=settings.MISTRAL_API) as mistral:
            response = await mistral.chat.stream_async(
                model="mistral-large-latest",
                messages=messages,
                response_format={"type": "text"}
            )
            answer = ''
            async for chunk in response:
                if chunk.data.choices:
                    answer += chunk.data.choices[0].delta.content
                    yield chunk.data.choices[0].delta.content
            MistralChat.chats[token].append({"role": "assistant", "content": answer})
