from config import settings
from app.database import ArticleModel
from app.database.redis import redis_service
from app.utils.news_handler.embedding_service import embedding_service

from mistralai.client import Mistral

SYSTEM_PROMPT = """Ты — интеллектуальный новостной ассистент.
Отвечай строго на основе предоставленных новостных статей.
Если в контексте нет информации для ответа — честно скажи об этом.
Отвечай на том же языке, на котором задан вопрос.
Будь краток, точен и информативен. Не выдумывай факты. 
ОТВЕЧАЙ ТОЛЬКО ТОГДА, КОГДА ПОЛЬЗОВАТЕЛЬ ДЕЙСТВИТЕЛЬНО СПРОСИЛ О НОВОСТЯХ ИЛИ СВЯЗАННОМ СЛУЧАЕ В ОСТАЛЬНОМ ОТКАЗЫВАЙСЯ"""


class MistralChat:
    chats = {}

    @staticmethod
    async def get_context(query: str):
        """Создание контекста для сообщения"""
        if await redis_service.get(query.lower().replace(' ', '_')):
            return await redis_service.get(query.lower().replace(' ', '_'))

        context = ''
        query_vec = await embedding_service.encode(query)
        articles = await ArticleModel.get_articles_for_rag(query_vec)

        for a in articles:
            context += f'\nИсточник: {a.source}\nДата: {a.date}\nЗаголовок: {a.title}\nОписание: {a.description}\nСсылка: {a.link}\n'

        await redis_service.set(query.lower().replace(' ', '_'), context, 3600)
        return context

    @staticmethod
    async def get_response_stream(token: str, text: str):
        context = await MistralChat.get_context(text)

        content = (f'Контекст — найденные новостные статьи:\n'
                   f'{context}\nВопрос пользователя: {text}\n'
                   f'Дай развёрнутый ответ, опираясь на статьи выше.\n'
                   f'В конце укажи статьи, которые использовал\n')

        if MistralChat.chats.get(token):
            MistralChat.chats[token].append(
                {"role": "user", "content": content}
            )
            messages = MistralChat.chats[token]
        else:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": content}]
            MistralChat.chats[token] = messages

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

    @staticmethod
    async def get_response(text: str) -> str:
        async with Mistral(api_key=settings.MISTRAL_API) as mistral:
            chat_response = await mistral.chat.complete_async(
                model='mistral-large-latest', messages=[{"role": "user", "content": text}]
            )
            return chat_response.choices[0].message.content
